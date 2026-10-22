from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "arasaac"
OUTPUT = ROOT / "assets" / "previews"
FONT = Path("C:/Windows/Fonts/arial.ttf")
FONT_BOLD = Path("C:/Windows/Fonts/arialbd.ttf")


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT), size)


def source(key: str, pictogram_id: int) -> Image.Image:
    return Image.open(ASSETS / f"{key}_{pictogram_id}.png").convert("RGBA")


def centered_text(draw: ImageDraw.ImageDraw, box, text: str, size: int, bold=False):
    text_font = font(size, bold)
    bounds = draw.textbbox((0, 0), text, font=text_font)
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]
    x = box[0] + (box[2] - box[0] - width) / 2
    y = box[1] + (box[3] - box[1] - height) / 2 - bounds[1]
    draw.text((x, y), text, font=text_font, fill="#17332d")


def base() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGB", (412, 412), "#151918")
    draw = ImageDraw.Draw(image)
    draw.ellipse((0, 0, 411, 411), fill="#f4f7f6")
    return image, draw


def symbol_button(image, draw, x, y, width, height, label, key, pictogram_id, accent, selected=False):
    fill = "#e3f0eb" if selected else "white"
    outline = "#2b7a5f" if selected else accent
    border_width = 3 if selected else 2
    draw.rounded_rectangle(
        (x, y, x + width, y + height), 12, fill=fill, outline=outline, width=border_width
    )
    icon = source(key, pictogram_id).resize((52, 52), Image.Resampling.LANCZOS)
    image.alpha_composite(icon, (x + (width - 52) // 2, y + 2))
    centered_text(draw, (x + 2, y + 57, x + width - 2, y + height - 2), label, 14)


def text_button(draw, x, y, width, height, label, fill):
    draw.rounded_rectangle((x, y, x + width, y + height), 12, fill=fill, outline="#17332d", width=2)
    centered_text(draw, (x, y, x + width, y + height), label, 14)


def speak_button(draw, x, y, width=132, height=42):
    draw.rounded_rectangle(
        (x, y, x + width, y + height), 12, fill="#72c6a7", outline="#17332d", width=2
    )
    center_y = y + height // 2
    draw.polygon(
        [(x + 25, center_y - 7), (x + 25, center_y + 7), (x + 36, center_y)],
        fill="#17332d",
    )
    centered_text(draw, (x + 28, y, x + width, y + height), "Hablar", 14)


def phrase_panel(image, draw, y, items=None):
    x = 54
    width = 304
    draw.rounded_rectangle((x, y, x + width, y + 66), 12, fill="white", outline="#b9cbc5", width=2)
    if not items:
        centered_text(draw, (x, y + 5, x + width, y + 24), "Mi mensaje", 12)
        centered_text(draw, (x, y + 25, x + width, y + 58), "Toca una imagen para comenzar", 14)
        return

    gap = 6
    image_size = 30
    total_width = len(items) * image_size + (len(items) - 1) * gap
    start_x = x + (width - total_width) // 2
    for index, (key, pictogram_id, _) in enumerate(items):
        icon = source(key, pictogram_id).resize((image_size, image_size), Image.Resampling.LANCZOS)
        image.alpha_composite(icon, (start_x + index * (image_size + gap), y + 2))
    centered_text(draw, (x + 12, y + 40, x + width - 12, y + 62), " + ".join(item[2] for item in items), 12)


def render_home():
    canvas, draw = base()
    canvas = canvas.convert("RGBA")
    draw = ImageDraw.Draw(canvas)
    centered_text(draw, (95, 14, 317, 40), "Que quieres decir?", 16, True)
    centered_text(draw, (76, 41, 336, 63), "Elige una categoria", 12)
    items = [
        (56, 76, "Necesidades", "cat_needs", 37160, "#e8c547"),
        (211, 76, "Emociones", "cat_emotions", 12359, "#e88d67"),
        (56, 170, "Acciones", "cat_actions", 32067, "#5ea8a7"),
        (211, 170, "Lugares", "cat_places", 32598, "#6d8cc7"),
    ]
    for x, y, label, key, pictogram_id, accent in items:
        symbol_button(canvas, draw, x, y, 145, 86, label, key, pictogram_id, accent)
    phrase_panel(canvas, draw, 266)
    speak_button(draw, 140, 342)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(OUTPUT / "inicio.png")


def render_needs():
    canvas, draw = base()
    canvas = canvas.convert("RGBA")
    draw = ImageDraw.Draw(canvas)
    centered_text(draw, (120, 11, 292, 37), "Necesidades", 16, True)
    text_button(draw, 56, 43, 98, 42, "‹  Volver", "#e2ece8")
    text_button(draw, 258, 43, 98, 42, "Borrar", "#f7d8d4")
    phrase_panel(
        canvas,
        draw,
        91,
        [("water", 2248, "Agua"), ("food", 4610, "Comida")],
    )
    items = [
        (60, 160, "Agua", "water", 2248, "#4aa3df"),
        (216, 160, "Comida", "food", 4610, "#f2b134"),
        (60, 240, "Bano", "bathroom_need", 2430, "#78c091"),
        (216, 240, "Ayuda", "help", 12252, "#e56b6f"),
    ]
    for index, (x, y, label, key, pictogram_id, accent) in enumerate(items):
        symbol_button(canvas, draw, x, y, 136, 76, label, key, pictogram_id, accent, index == 1)
    centered_text(draw, (76, 336, 336, 352), "Seleccionado: Comida", 12)
    speak_button(draw, 140, 354)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(OUTPUT / "necesidades.png")


if __name__ == "__main__":
    render_home()
    render_needs()
    print(OUTPUT)
