"""Render the generated preview contact sheet.

The input is `docs/previews/themes.json`, written by `scripts/previews.mjs`
from the same theme definitions the plugin ships. The output is an illustration
for the README, not a screenshot of the application.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
THEMES = json.loads((ROOT / "docs" / "previews" / "themes.json").read_text(encoding="utf-8"))

WIDTH, HEIGHT = 1560, 1180
BACKGROUND = "#101010"
TITLE_COLOR = "#ebdbb2"
MUTED = "#a89984"

FONT_REGULAR = Path("C:/Windows/Fonts/segoeui.ttf")
FONT_BOLD = Path("C:/Windows/Fonts/segoeuib.ttf")
FONT_MONO = Path("C:/Windows/Fonts/consola.ttf")


def font(path: Path, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    try:
        return ImageFont.truetype(str(path), size)
    except OSError:
        return ImageFont.load_default()


f_title = font(FONT_BOLD, 30)
f_subtitle = font(FONT_REGULAR, 15)
f_name = font(FONT_BOLD, 19)
f_small = font(FONT_REGULAR, 12)
f_tiny = font(FONT_REGULAR, 10)
f_mono = font(FONT_MONO, 11)


def hex_text(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, fill: str, fnt) -> None:
    draw.text(xy, text, fill=fill, font=fnt)


def draw_card(draw: ImageDraw.ImageDraw, x: int, y: int, theme: dict) -> None:
    w, h = 480, 320
    draw.rounded_rectangle((x, y, x + w, y + h), radius=16, fill=theme["layer1"], outline=theme["border"])

    hex_text(draw, (x + 20, y + 16), theme["name"], theme["text"], f_name)
    badge = "dark only" if theme["family"] == "whale" else theme["colorScheme"]
    badge_width = draw.textlength(badge, font=f_small)
    hex_text(draw, (int(x + w - 20 - badge_width), y + 21), badge, theme["text3"], f_small)

    # Mini application window.
    mx, my, mw, mh = x + 20, y + 50, w - 40, 178
    draw.rounded_rectangle((mx, my, mx + mw, my + mh), radius=10, fill=theme["base"], outline=theme["border"])

    # Sidebar.
    sx, sw = mx + 10, 104
    draw.rounded_rectangle((sx, my + 10, sx + sw, my + mh - 10), radius=8, fill=theme["sidebar"])
    draw.ellipse((sx + 10, my + 20, sx + 18, my + 28), fill=theme["accent"])
    hex_text(draw, (sx + 24, my + 17), "DeepSeek", theme["text"], f_small)
    draw.rounded_rectangle((sx + 8, my + 40, sx + sw - 8, my + 62), radius=6, fill=theme["layer2"])
    hex_text(draw, (sx + 16, my + 45), "+ New chat", theme["accent"], f_tiny)
    for index, bar_width in enumerate((58, 44, 50)):
        by = my + 78 + index * 14
        draw.rounded_rectangle((sx + 10, by, sx + 10 + bar_width, by + 4), radius=2, fill=theme["text3"])
    draw.rounded_rectangle((sx + 8, my + mh - 34, sx + sw - 8, my + mh - 14), radius=6, fill=theme["layer2"])

    # Main pane.
    px = sx + sw + 16
    pw = mx + mw - 14 - px
    hex_text(draw, (px, my + 16), "Assistant", theme["text"], f_small)
    draw.ellipse((px + pw - 6, my + 20, px + pw, my + 24), fill=theme["accent"])

    bubble_w = 150
    draw.rounded_rectangle((px + pw - bubble_w, my + 38, px + pw, my + 64), radius=8, fill=theme["accent"])
    hex_text(draw, (px + pw - bubble_w + 12, my + 45), "Write a function", theme["onAccent"], f_tiny)

    code_y = my + 74
    draw.rounded_rectangle((px, code_y, px + pw - 10, code_y + 56), radius=8, fill=theme["codeBg"])
    hex_text(draw, (px + 10, code_y + 7), "# Python", theme["text3"], f_mono)
    hex_text(draw, (px + 10, code_y + 23), "def hello():", theme["text2"], f_mono)
    hex_text(draw, (px + 20, code_y + 39), 'return "Hello"', theme["success"], f_mono)

    # Composer.
    comp_y = my + mh - 44
    draw.rounded_rectangle((px, comp_y, px + pw, comp_y + 30), radius=9, fill=theme["layer1"], outline=theme["border"])
    hex_text(draw, (px + 12, comp_y + 9), "Message...", theme["text3"], f_tiny)
    draw.polygon(
        [(px + pw - 22, comp_y + 12), (px + pw - 10, comp_y + 17), (px + pw - 22, comp_y + 22)],
        fill=theme["accent"],
    )

    # Swatches and ids.
    swatches = [theme["base"], theme["layer1"], theme["accent"], theme["success"], theme["error"]]
    for index, color in enumerate(swatches):
        bx = x + 20 + index * 58
        draw.rounded_rectangle((bx, y + h - 68, bx + 48, y + h - 44), radius=5, fill=color, outline=theme["border"])
        hex_text(draw, (bx, y + h - 40), color, theme["text3"], f_tiny)
    hex_text(draw, (x + 20, y + h - 20), theme["id"], theme["text3"], f_tiny)


def main() -> None:
    image = Image.new("RGB", (WIDTH, HEIGHT), BACKGROUND)
    draw = ImageDraw.Draw(image)
    hex_text(draw, (40, 30), "Gruvbox themes for DeepSeek Harness", TITLE_COLOR, f_title)
    hex_text(draw, (40, 72), "Generated palette previews from the shipped theme definitions - not screenshots", MUTED, f_subtitle)

    for index, theme in enumerate(THEMES):
        column = index % 3
        row = index // 3
        draw_card(draw, 40 + column * 500, 110 + row * 340, theme)

    output = ROOT / "docs" / "previews" / "contact-sheet.png"
    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, optimize=True)
    print(f"wrote {output}")


if __name__ == "__main__":
    main()
