from pathlib import Path
from array import array
import hashlib
from io import BytesIO
import sys
import wave


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "microSD" / "audio"
HEADER = ROOT / "STCS_AudioAssets.h"
SOURCE_FILE = ROOT / "STCS_AudioAssets.c"
TARGET_SAMPLE_RATE = 16000


def symbol_name(path: Path) -> str:
    return "stcs_audio_" + "".join(
        character if character.isalnum() else "_" for character in path.stem.lower()
    )


def format_bytes(data: bytes) -> str:
    lines = []
    for offset in range(0, len(data), 16):
        chunk = data[offset : offset + 16]
        lines.append("  " + ", ".join(f"0x{value:02X}" for value in chunk) + ",")
    return "\n".join(lines)


def optimize_wav(data: bytes, name: str) -> bytes:
    source_buffer = BytesIO(data)
    with wave.open(source_buffer, "rb") as source:
        channels = source.getnchannels()
        sample_width = source.getsampwidth()
        source_rate = source.getframerate()
        compression = source.getcomptype()
        frames = source.readframes(source.getnframes())

    if channels != 1 or sample_width != 2 or compression != "NONE":
        raise ValueError(
            f"{name}: expected mono 16-bit PCM WAV, got "
            f"{channels} channel(s), {sample_width * 8}-bit, {compression}"
        )

    if source_rate == TARGET_SAMPLE_RATE:
        return data

    samples = array("h")
    samples.frombytes(frames)
    if sys.byteorder != "little":
        samples.byteswap()

    output_count = max(1, round(len(samples) * TARGET_SAMPLE_RATE / source_rate))
    rate_ratio = source_rate / TARGET_SAMPLE_RATE
    resampled = array("h")
    for output_index in range(output_count):
        source_position = output_index * rate_ratio
        left_index = int(source_position)
        right_index = min(left_index + 1, len(samples) - 1)
        fraction = source_position - left_index
        value = round(
            samples[left_index] * (1.0 - fraction)
            + samples[right_index] * fraction
        )
        resampled.append(max(-32768, min(32767, value)))

    if sys.byteorder != "little":
        resampled.byteswap()

    output_buffer = BytesIO()
    with wave.open(output_buffer, "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(TARGET_SAMPLE_RATE)
        output.writeframes(resampled.tobytes())
    return output_buffer.getvalue()


def main() -> None:
    audio_files = sorted(SOURCE.glob("*.wav"))
    if not audio_files:
        raise SystemExit(f"No WAV files found in {SOURCE}")

    header = """#pragma once

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern \"C\" {
#endif

typedef struct {
  const char *path;
  const uint8_t *data;
  size_t size;
} STCS_EmbeddedAudio;

extern const STCS_EmbeddedAudio stcs_embedded_audio[];
extern const size_t stcs_embedded_audio_count;
extern const char stcs_embedded_audio_version[];

#ifdef __cplusplus
}
#endif
"""

    arrays = []
    entries = []
    total_size = 0
    source_total_size = 0
    version_hash = hashlib.sha256()
    for audio_path in audio_files:
        source_data = audio_path.read_bytes()
        data = optimize_wav(source_data, audio_path.name)
        symbol = symbol_name(audio_path)
        source_total_size += len(source_data)
        total_size += len(data)
        version_hash.update(audio_path.name.encode("ascii"))
        version_hash.update(data)
        arrays.append(
            f"static const uint8_t {symbol}[] = {{\n{format_bytes(data)}\n}};"
        )
        entries.append(
            f'  {{\"/{audio_path.name}\", {symbol}, sizeof({symbol})}},'
        )

    source = "\n".join(
        [
            '#include "STCS_AudioAssets.h"',
            "",
            *arrays,
            "",
            "const STCS_EmbeddedAudio stcs_embedded_audio[] = {",
            *entries,
            "};",
            "",
            f'const char stcs_embedded_audio_version[] = \"{version_hash.hexdigest()[:16]}\";',
            "",
            "const size_t stcs_embedded_audio_count =",
            "    sizeof(stcs_embedded_audio) / sizeof(stcs_embedded_audio[0]);",
            "",
        ]
    )

    HEADER.write_text(header, encoding="ascii", newline="\n")
    SOURCE_FILE.write_text(source, encoding="ascii", newline="\n")
    saved_bytes = source_total_size - total_size
    print(
        f"Generated {len(audio_files)} audio assets at {TARGET_SAMPLE_RATE} Hz "
        f"({total_size} bytes, saved {saved_bytes} bytes)"
    )


if __name__ == "__main__":
    main()
