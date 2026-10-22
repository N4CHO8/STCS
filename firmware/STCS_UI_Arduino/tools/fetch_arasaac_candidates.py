from pathlib import Path
from urllib.request import urlretrieve

from PIL import Image, ImageDraw, ImageFont


CANDIDATES = {
    "Necesidades": [37160],
    "Emociones": [12359],
    "Acciones": [32067, 7297],
    "Lugares": [32598, 9819],
    "Agua": [32464, 2248],
    "Comida": [4611, 4610],
    "Bano": [6929, 6930],
    "Ayuda": [12252, 19524],
    "Feliz": [32123, 9907],
    "Triste": [35545, 2606],
    "Enojado": [35539, 2374],
    "Cansado": [35537, 2314],
    "Jugar": [6537, 2439],
    "Comer": [6456, 2349],
    "Dormir": [6479, 2369],
    "Ir": [8142, 2432],
    "Casa": [6964, 2317],
    "Escuela": [32446, 3082],
    "Parque": [2859],
}

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "arasaac_candidates"
THUMBNAIL_SIZE = 180
CELL_WIDTH = 220
CELL_HEIGHT = 230
COLUMNS = 4


def image_url(pictogram_id: int) -> str:
    return (
        f"https://static.arasaac.org/pictograms/{pictogram_id}/"
        f"{pictogram_id}_300.png"
    )


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    entries = []

    for label, pictogram_ids in CANDIDATES.items():
        for pictogram_id in pictogram_ids:
            target = OUTPUT / f"{label.lower()}_{pictogram_id}.png"
            if not target.exists():
                urlretrieve(image_url(pictogram_id), target)
            entries.append((label, pictogram_id, target))

    rows = (len(entries) + COLUMNS - 1) // COLUMNS
    sheet = Image.new("RGB", (COLUMNS * CELL_WIDTH, rows * CELL_HEIGHT), "white")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=18)

    for index, (label, pictogram_id, path) in enumerate(entries):
        column = index % COLUMNS
        row = index // COLUMNS
        x = column * CELL_WIDTH
        y = row * CELL_HEIGHT
        image = Image.open(path).convert("RGBA")
        image.thumbnail((THUMBNAIL_SIZE, THUMBNAIL_SIZE), Image.Resampling.LANCZOS)
        image_x = x + (CELL_WIDTH - image.width) // 2
        sheet.paste(image, (image_x, y + 4), image)
        caption = f"{label} | ID {pictogram_id}"
        draw.text((x + 8, y + 190), caption, fill="black", font=font)
        draw.rectangle((x, y, x + CELL_WIDTH - 1, y + CELL_HEIGHT - 1), outline="#cccccc")

    sheet.save(OUTPUT / "comparacion.png")
    print(OUTPUT / "comparacion.png")


if __name__ == "__main__":
    main()
