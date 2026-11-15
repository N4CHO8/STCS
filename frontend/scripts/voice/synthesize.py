"""Generate only the requested phrase; no credentials or clinical records enter this process."""
import hashlib
import json
import sys
import wave
from pathlib import Path
import numpy as np
from piper import PiperVoice

MODEL_SHA = "d2c9224e122321aac3c33343957fff4d0f465226cb74c66b0f520ca3f8c0dd07"
model, output = Path(sys.argv[1]), Path(sys.argv[2])
if hashlib.sha256(model.read_bytes()).hexdigest() != MODEL_SHA:
    raise ValueError("The configured voice does not match the reviewed model")
if hashlib.sha256(Path(str(model) + ".json").read_bytes()).hexdigest() != "531c4051502e1acbc10b42437f11679bfce9e3919e1796e51fabd73e01e7fd2e":
    raise ValueError("Voice configuration checksum mismatch")
request = json.loads(sys.stdin.buffer.read(512).decode("utf-8"))
text = request["text"]
if not isinstance(text, str) or not text.strip() or len(text.encode("utf-8")) > 95:
    raise ValueError("Invalid phrase")
voice = PiperVoice.load(str(model))
samples = []
rate = None
for chunk in voice.synthesize(text):
    samples.append(chunk.audio_int16_array)
    rate = chunk.sample_rate
audio = np.concatenate(samples)
# Deliver the single fixed PCM format understood by the hardware contract.
positions = np.arange(round(len(audio) * 16000 / rate)) * rate / 16000
pcm = np.interp(positions, np.arange(len(audio)), audio).clip(-32768, 32767).astype("<i2")
if len(pcm) == 0 or len(pcm) > 160000:
    raise ValueError("Phrase audio exceeds ten seconds")
with wave.open(str(output), "wb") as target:
    target.setnchannels(1)
    target.setsampwidth(2)
    target.setframerate(16000)
    target.writeframes(pcm.tobytes())
