from pathlib import Path
from urllib.request import urlretrieve

from PIL import Image


PICTOGRAMS = {
    "cat_needs": (37160, "Necesidades"),
    "cat_emotions": (12359, "Emociones"),
    "cat_actions": (32067, "Acciones"),
    "cat_places": (32598, "Lugares"),
    "water": (2248, "Agua"),
    "food": (4610, "Comida"),
    "bathroom_need": (2430, "Bano"),
    "help": (12252, "Ayuda"),
    "happy": (35547, "Feliz"),
    "sad": (35545, "Triste"),
    "angry": (35539, "Enojado"),
    "tired": (35537, "Cansado"),
    "play": (6537, "Jugar"),
    "eat": (6456, "Comer"),
    "sleep": (6479, "Dormir"),
    "go": (8142, "Ir"),
    "home": (6964, "Casa"),
    "school": (32446, "Escuela"),
    "bathroom_place": (6929, "Bano"),
    "park": (2859, "Parque"),
    "pain": (2367, "Dolor"),
    "fear": (10261, "Miedo"),
    "talk": (6517, "Hablar"),
    "hospital": (6523, "Hospital"),
}

CATEGORY_KEYS = {"cat_needs", "cat_emotions", "cat_actions", "cat_places"}
ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets" / "arasaac"
HEADER_PATH = ROOT / "STCS_Pictograms.h"
SOURCE_PATH = ROOT / "STCS_Pictograms.c"
LARGE_SIZE = 52
SMALL_SIZE = 30


def image_url(pictogram_id: int) -> str:
    return (
        f"https://static.arasaac.org/pictograms/{pictogram_id}/"
        f"{pictogram_id}_300.png"
    )


def load_source(key: str, pictogram_id: int) -> Image.Image:
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    path = SOURCE_DIR / f"{key}_{pictogram_id}.png"
    if not path.exists():
        urlretrieve(image_url(pictogram_id), path)
    return Image.open(path).convert("RGBA")


def resize(image: Image.Image, size: int) -> Image.Image:
    return image.resize((size, size), Image.Resampling.LANCZOS)


def rgb565_alpha(image: Image.Image) -> bytes:
    data = bytearray()
    for red, green, blue, alpha in image.getdata():
        value = ((red >> 3) << 11) | ((green >> 2) << 5) | (blue >> 3)
        data.extend((value & 0xFF, value >> 8, alpha))
    return bytes(data)


def format_bytes(data: bytes) -> str:
    lines = []
    for offset in range(0, len(data), 18):
        chunk = data[offset : offset + 18]
        lines.append("  " + ", ".join(f"0x{value:02x}" for value in chunk) + ",")
    return "\n".join(lines)


def descriptor(name: str, image: Image.Image) -> str:
    data = rgb565_alpha(image)
    width, height = image.size
    return f"""const LV_ATTRIBUTE_MEM_ALIGN LV_ATTRIBUTE_LARGE_CONST uint8_t {name}_map[] = {{
{format_bytes(data)}
}};

const lv_img_dsc_t {name} = {{
  .header.always_zero = 0,
  .header.w = {width},
  .header.h = {height},
  .data_size = {len(data)},
  .header.cf = LV_IMG_CF_TRUE_COLOR_ALPHA,
  .data = {name}_map,
}};
"""


def main() -> None:
    declarations = []
    definitions = []

    for key, (pictogram_id, _) in PICTOGRAMS.items():
        source = load_source(key, pictogram_id)
        large_name = f"stcs_img_{key}"
        declarations.append(f"LV_IMG_DECLARE({large_name});")
        definitions.append(descriptor(large_name, resize(source, LARGE_SIZE)))

        if key not in CATEGORY_KEYS:
            small_name = f"stcs_mini_{key}"
            declarations.append(f"LV_IMG_DECLARE({small_name});")
            definitions.append(descriptor(small_name, resize(source, SMALL_SIZE)))

    HEADER_PATH.write_text(
        "#pragma once\n\n#include <lvgl.h>\n\n" + "\n".join(declarations) + "\n",
        encoding="ascii",
    )
    SOURCE_PATH.write_text(
        '#include "STCS_Pictograms.h"\n\n' + "\n".join(definitions),
        encoding="ascii",
    )
    print(f"Generated {HEADER_PATH.name} and {SOURCE_PATH.name}")


if __name__ == "__main__":
    main()
