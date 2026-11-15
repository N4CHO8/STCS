"""Capture technical evidence only; never dump arbitrary firmware serial output."""
import argparse
import json
import time
from pathlib import Path
import serial

parser = argparse.ArgumentParser()
parser.add_argument("--port", default="COM7")
parser.add_argument("--seconds", type=int, default=60)
parser.add_argument("--log", required=True)
args = parser.parse_args()
assert 1 <= args.seconds <= 600
prefixes = ("STCS_HEALTH|", "STCS_SYNC|", "STCS_CACHE|", "STCS_PAGE|", "STCS_MEDIA|", "STCS_BOOT|", "STCS_BOARD|", "STCS_ATLAS|")
panic = False
count = 0
with serial.Serial(args.port, 115200, timeout=0.2) as connection, Path(args.log).open("a", encoding="utf-8") as log:
    connection.dtr = True
    connection.rts = False
    end = time.monotonic() + args.seconds
    while time.monotonic() < end:
        line = connection.readline().decode(errors="replace").strip()
        if "Guru Meditation" in line or "Backtrace" in line:
            panic = True
        if line.startswith(prefixes):
            log.write(line + "\n")
            log.flush()
            count += 1
    log.write(json.dumps({"panicObserved": panic, "technicalLines": count}) + "\n")
print(json.dumps({"panicObserved": panic, "technicalLines": count}))
