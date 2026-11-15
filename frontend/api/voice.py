"""Private, on-demand Piper function. No database/storage credentials enter this runtime."""
from http.server import BaseHTTPRequestHandler
from pathlib import Path
import hashlib
import hmac
import io
import json
import os
import threading
import urllib.request
import wave

VOICE = "piper-es_ES-davefx-medium-d2c9224e1223-v1"
FILES = {
    "es_ES-davefx-medium.onnx": "d2c9224e122321aac3c33343957fff4d0f465226cb74c66b0f520ca3f8c0dd07",
    "es_ES-davefx-medium.onnx.json": "531c4051502e1acbc10b42437f11679bfce9e3919e1796e51fabd73e01e7fd2e",
}
MODEL_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/davefx/medium/"
lock = threading.Lock()
voice = None


def get_voice():
    global voice
    if voice is not None:
        return voice
    from piper import PiperVoice
    # /tmp is only an expendable model cache. Generated audio persists through the Node storage adapter.
    folder = Path(os.environ.get("STCS_TTS_CACHE_DIR", "/tmp/stcs-piper"))
    folder.mkdir(parents=True, exist_ok=True)
    for name, digest in FILES.items():
        path = folder / name
        if not path.exists() or hashlib.sha256(path.read_bytes()).hexdigest() != digest:
            temp = folder / (name + ".download")
            try:
                with urllib.request.urlopen(MODEL_URL + name, timeout=35) as source, temp.open("wb") as target:
                    size = 0
                    while chunk := source.read(1024 * 1024):
                        size += len(chunk)
                        if size > 65_000_000:
                            raise ValueError("Model size limit")
                        target.write(chunk)
                if hashlib.sha256(temp.read_bytes()).hexdigest() != digest:
                    raise ValueError("Model checksum mismatch")
                temp.replace(path)
            finally:
                temp.unlink(missing_ok=True)
    voice = PiperVoice.load(str(folder / "es_ES-davefx-medium.onnx"))
    return voice


def synthesize(text):
    import numpy as np
    with lock:
        model = get_voice()
        chunks = list(model.synthesize(text))
    samples = np.concatenate([chunk.audio_int16_array for chunk in chunks])
    rate = chunks[0].sample_rate
    positions = np.arange(round(len(samples) * 16000 / rate)) * rate / 16000
    pcm = np.interp(positions, np.arange(len(samples)), samples).clip(-32768, 32767).astype("<i2")
    if not 0 < len(pcm) <= 160000:
        raise ValueError("Audio exceeds ten seconds")
    output = io.BytesIO()
    with wave.open(output, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(16000)
        wav.writeframes(pcm.tobytes())
    return output.getvalue()


class handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass  # Never log input phrases, credentials or request headers.

    def reply(self, status, data, mime="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        key = os.environ.get("STCS_MEDIA_WORKER_KEY", "")
        supplied = self.headers.get("x-stcs-worker-key", "")
        if len(key) < 32 or not hmac.compare_digest(key.encode(), supplied.encode()):
            return self.reply(403, b'{"error":"Forbidden"}')
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 512:
                raise ValueError("Invalid payload")
            body = json.loads(self.rfile.read(length))
            text = body["text"]
            if body.get("voice") != VOICE or not isinstance(text, str) or not text.strip() or len(text.encode("utf-8")) > 95:
                raise ValueError("Invalid phrase")
            data = synthesize(text)
        except (ValueError, KeyError, TypeError):
            return self.reply(422, b'{"error":"Invalid phrase or audio"}')
        except Exception:
            return self.reply(503, b'{"error":"Voice preparation unavailable"}')
        self.reply(200, data, "audio/wav")


if __name__ == "__main__":
    from http.server import ThreadingHTTPServer
    ThreadingHTTPServer(("127.0.0.1", 3103), handler).serve_forever()
