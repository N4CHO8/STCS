"""Download reviewed CC0 Spanish voice outside Git; verify both files before installation."""
import hashlib
import sys
import urllib.request
from pathlib import Path

target=Path(sys.argv[1]);target.mkdir(parents=True,exist_ok=True)
base="https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/davefx/medium/"
files={
    "es_ES-davefx-medium.onnx":"d2c9224e122321aac3c33343957fff4d0f465226cb74c66b0f520ca3f8c0dd07",
    "es_ES-davefx-medium.onnx.json":"531c4051502e1acbc10b42437f11679bfce9e3919e1796e51fabd73e01e7fd2e",
}
for name,digest in files.items():
    path=target/name
    if path.exists() and hashlib.sha256(path.read_bytes()).hexdigest()==digest:
        continue
    temp=target/(name+".download")
    try:
        with urllib.request.urlopen(base+name,timeout=60) as response, temp.open("wb") as out:
            while chunk:=response.read(1024*1024):out.write(chunk)
        if hashlib.sha256(temp.read_bytes()).hexdigest()!=digest:raise ValueError("Voice checksum mismatch")
        temp.replace(path)
    finally:
        temp.unlink(missing_ok=True)
print("Spanish voice downloaded and verified.")
