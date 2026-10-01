import os
from PIL import Image, ImageDraw, ImageFont

# Board Dimensions (Exact 2048 x 2048 matching user specs)
SIZE = 2048
CORNER = 271
PROP_W = 164
PROP_H = 271
BORDER = 3
CENTER_SIZE = 1500  # 2048 - 2*(271+3) = 1500

BG_COLOR = (219, 230, 215)  # Classic Monopoly light greenish-cream #dbe6d7
BORDER_COLOR = (15, 23, 42)  # Board dividing lines #0f172a
TEXT_DARK = (15, 23, 42)     # #0f172a
TEXT_MUTED = (51, 65, 85)    # #334155
WHITE = (255, 255, 255)

FONT_BOLD_PATH = "/usr/share/fonts/google-noto/NotoSans-Bold.ttf"
FONT_REG_PATH = "/usr/share/fonts/google-noto/NotoSans-Regular.ttf"

def get_font(size, bold=True):
    path = FONT_BOLD_PATH if bold else FONT_REG_PATH
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

COLORS = {
    "brown": hex_to_rgb("#764227"),
    "lightblue": hex_to_rgb("#9dd5f3"),
    "pink": hex_to_rgb("#df348e"),
    "orange": hex_to_rgb("#f7931e"),
    "red": hex_to_rgb("#ed1b24"),
    "yellow": hex_to_rgb("#fef200"),
    "green": hex_to_rgb("#1fb25a"),
    "darkblue": hex_to_rgb("#0072bb"),
}

SPACES = [
    # 0: LOS (Bottom Right)
    {"index": 0, "type": "corner", "name": "LOS"},
    # 1 - 9: South (Bottom) Edge, Right to Left
    {"index": 1, "type": "property", "name": "BADSTRASSE", "price": "60 DM", "color": COLORS["brown"]},
    {"index": 2, "type": "special", "name": "GEMEINSCHAFTS-\nFELD", "sub": "FOLGE DEN\nANWEISUNGEN"},
    {"index": 3, "type": "property", "name": "TURMSTRASSE", "price": "60 DM", "color": COLORS["brown"]},
    {"index": 4, "type": "special", "name": "EINKOMMEN-\nSTEUER", "sub": "ZAHLE 200 DM"},
    {"index": 5, "type": "special", "name": "SÜDBAHNHOF", "price": "200 DM"},
    {"index": 6, "type": "property", "name": "CHAUSSEE-\nSTRASSE", "price": "100 DM", "color": COLORS["lightblue"]},
    {"index": 7, "type": "special", "name": "EREIGNISFELD", "sub": "FOLGE DEN\nANWEISUNGEN"},
    {"index": 8, "type": "property", "name": "ELISENSTRASSE", "price": "100 DM", "color": COLORS["lightblue"]},
    {"index": 9, "type": "property", "name": "POSTSTRASSE", "price": "120 DM", "color": COLORS["lightblue"]},
    # 10: Gefängnis (Bottom Left)
    {"index": 10, "type": "corner", "name": "GEFÄNGNIS"},
    # 11 - 19: West (Left) Edge, Bottom to Top
    {"index": 11, "type": "property", "name": "SEESTRASSE", "price": "140 DM", "color": COLORS["pink"]},
    {"index": 12, "type": "special", "name": "ELEKTRIZITÄTS-\nWERK", "price": "150 DM"},
    {"index": 13, "type": "property", "name": "HAFENSTRASSE", "price": "140 DM", "color": COLORS["pink"]},
    {"index": 14, "type": "property", "name": "NEUE STRASSE", "price": "160 DM", "color": COLORS["pink"]},
    {"index": 15, "type": "special", "name": "WESTBAHNHOF", "price": "200 DM"},
    {"index": 16, "type": "property", "name": "MÜNCHNER\nSTRASSE", "price": "180 DM", "color": COLORS["orange"]},
    {"index": 17, "type": "special", "name": "GEMEINSCHAFTS-\nFELD", "sub": "FOLGE DEN\nANWEISUNGEN"},
    {"index": 18, "type": "property", "name": "WIENER\nSTRASSE", "price": "180 DM", "color": COLORS["orange"]},
    {"index": 19, "type": "property", "name": "BERLINER\nSTRASSE", "price": "200 DM", "color": COLORS["orange"]},
    # 20: Frei Parken (Top Left)
    {"index": 20, "type": "corner", "name": "FREI PARKEN"},
    # 21 - 29: North (Top) Edge, Left to Right
    {"index": 21, "type": "property", "name": "THEATER-\nSTRASSE", "price": "220 DM", "color": COLORS["red"]},
    {"index": 22, "type": "special", "name": "EREIGNISFELD", "sub": "FOLGE DEN\nANWEISUNGEN"},
    {"index": 23, "type": "property", "name": "MUSEUM-\nSTRASSE", "price": "220 DM", "color": COLORS["red"]},
    {"index": 24, "type": "property", "name": "OPERNPLATZ", "price": "240 DM", "color": COLORS["red"]},
    {"index": 25, "type": "special", "name": "NORDBAHNHOF", "price": "200 DM"},
    {"index": 26, "type": "property", "name": "LESSING-\nSTRASSE", "price": "260 DM", "color": COLORS["yellow"]},
    {"index": 27, "type": "property", "name": "SCHILLER-\nSTRASSE", "price": "260 DM", "color": COLORS["yellow"]},
    {"index": 28, "type": "special", "name": "WASSERWERK", "price": "150 DM"},
    {"index": 29, "type": "property", "name": "GOETHE-\nSTRASSE", "price": "280 DM", "color": COLORS["yellow"]},
    # 30: Gehe ins Gefängnis (Top Right)
    {"index": 30, "type": "corner", "name": "GEHE INS GEFÄNGNIS"},
    # 31 - 39: East (Right) Edge, Top to Bottom
    {"index": 31, "type": "property", "name": "RATHAUSPLATZ", "price": "300 DM", "color": COLORS["green"]},
    {"index": 32, "type": "property", "name": "HAUPTSTRASSE", "price": "300 DM", "color": COLORS["green"]},
    {"index": 33, "type": "special", "name": "GEMEINSCHAFTS-\nFELD", "sub": "FOLGE DEN\nANWEISUNGEN"},
    {"index": 34, "type": "property", "name": "BAHNHOF-\nSTRASSE", "price": "320 DM", "color": COLORS["green"]},
    {"index": 35, "type": "special", "name": "HAUPTBAHNHOF", "price": "200 DM"},
    {"index": 36, "type": "special", "name": "EREIGNISFELD", "sub": "FOLGE DEN\nANWEISUNGEN"},
    {"index": 37, "type": "property", "name": "PARKSTRASSE", "price": "350 DM", "color": COLORS["darkblue"]},
    {"index": 38, "type": "special", "name": "ZUSATZSTEUER", "sub": "ZAHLE 100 DM"},
    {"index": 39, "type": "property", "name": "SCHLOSSALLEE", "price": "400 DM", "color": COLORS["darkblue"]}
]

def render_street_cell(space_info):
    """
    Renders an upright 164 x 271 px street cell as seen from the outer edge looking inwards:
    - Top (y=0..56): Color Bar facing center of the board
    - Middle: Street Name & Subtext
    - Bottom (y=237..271): Price facing the outside edge
    """
    w, h = PROP_W, PROP_H
    im = Image.new("RGBA", (w, h), BG_COLOR)
    draw = ImageDraw.Draw(im)

    is_prop = space_info.get("type") == "property"
    color = space_info.get("color")

    if is_prop and color:
        bar_h = 56
        draw.rectangle([0, 0, w, bar_h], fill=color)
        draw.line([0, bar_h, w, bar_h], fill=BORDER_COLOR, width=3)

    # Street Name
    name = space_info.get("name", "")
    font_name = get_font(18, bold=True)
    lines = name.split('\n')
    
    text_y = 68 if is_prop else 24
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font_name)
        lw = bbox[2] - bbox[0]
        lh = bbox[3] - bbox[1]
        draw.text(((w - lw) // 2, text_y), line, fill=TEXT_DARK, font=font_name)
        text_y += lh + 6

    # Subtext (e.g. "FOLGE DEN ANWEISUNGEN" or "ZAHLE 200 DM")
    sub = space_info.get("sub", "")
    if sub:
        font_sub = get_font(13, bold=False)
        sub_lines = sub.split('\n')
        sub_y = text_y + 10
        for sline in sub_lines:
            bbox = draw.textbbox((0, 0), sline, font=font_sub)
            sw = bbox[2] - bbox[0]
            sh = bbox[3] - bbox[1]
            draw.text(((w - sw) // 2, sub_y), sline, fill=TEXT_MUTED, font=font_sub)
            sub_y += sh + 4

    # Price at bottom
    price = space_info.get("price", "")
    if price:
        font_price = get_font(16, bold=True)
        bbox = draw.textbbox((0, 0), price, font=font_price)
        pw = bbox[2] - bbox[0]
        draw.text(((w - pw) // 2, h - 34), price, fill=TEXT_DARK, font=font_price)

    return im

def render_corner_los():
    w, h = CORNER, CORNER
    im = Image.new("RGBA", (w, h), BG_COLOR)
    draw = ImageDraw.Draw(im)

    font_sub = get_font(14, bold=True)
    sub1 = "ZIEHE IM VORBEIGEHEN"
    sub2 = "200 DM EIN"
    
    bbox1 = draw.textbbox((0, 0), sub1, font=font_sub)
    draw.text(((w - (bbox1[2] - bbox1[0])) // 2, 28), sub1, fill=TEXT_MUTED, font=font_sub)
    
    bbox2 = draw.textbbox((0, 0), sub2, font=font_sub)
    draw.text(((w - (bbox2[2] - bbox2[0])) // 2, 50), sub2, fill=TEXT_MUTED, font=font_sub)

    # Giant LOS text angled
    los_im = Image.new("RGBA", (220, 110), (0,0,0,0))
    los_draw = ImageDraw.Draw(los_im)
    font_los = get_font(72, bold=True)
    los_draw.text((10, 10), "LOS", fill=(220, 38, 38), font=font_los)
    los_rot = los_im.rotate(45, expand=True, resample=Image.BICUBIC)
    
    im.paste(los_rot, (25, 65), los_rot)
    return im

def render_corner_jail():
    w, h = CORNER, CORNER
    im = Image.new("RGBA", (w, h), BG_COLOR)
    draw = ImageDraw.Draw(im)

    # In Jail inner box: top-right corner
    # Inner box: x: 70..271, y: 0..201
    inner_box = [70, 0, w, 201]
    draw.rectangle(inner_box, fill=(249, 115, 22))  # Orange jail color
    draw.line([70, 0, 70, 201], fill=BORDER_COLOR, width=3)
    draw.line([70, 201, w, 201], fill=BORDER_COLOR, width=3)

    font_in = get_font(18, bold=True)
    draw.text((95, 30), "IM", fill=WHITE, font=font_in)
    draw.text((95, 60), "GEFÄNGNIS", fill=WHITE, font=font_in)

    # "NUR" vertical along left
    font_visit = get_font(17, bold=True)
    nur_im = Image.new("RGBA", (90, 30), (0,0,0,0))
    ImageDraw.Draw(nur_im).text((0, 0), "NUR", fill=TEXT_DARK, font=font_visit)
    nur_rot = nur_im.rotate(-90, expand=True)
    im.paste(nur_rot, (22, 75), nur_rot)

    # "ZU BESUCH" horizontal along bottom
    bbox = draw.textbbox((0, 0), "ZU BESUCH", font=font_visit)
    bw = bbox[2] - bbox[0]
    draw.text(((w + 40 - bw) // 2, 225), "ZU BESUCH", fill=TEXT_DARK, font=font_visit)

    return im

def render_corner_parking():
    w, h = CORNER, CORNER
    im = Image.new("RGBA", (w, h), BG_COLOR)
    draw = ImageDraw.Draw(im)

    font_title = get_font(26, bold=True)
    t1 = "FREI"
    t2 = "PARKEN"
    
    b1 = draw.textbbox((0, 0), t1, font=font_title)
    draw.text(((w - (b1[2]-b1[0]))//2, 85), t1, fill=(220, 38, 38), font=font_title)

    b2 = draw.textbbox((0, 0), t2, font=font_title)
    draw.text(((w - (b2[2]-b2[0]))//2, 125), t2, fill=(220, 38, 38), font=font_title)

    return im

def render_corner_gotojail():
    w, h = CORNER, CORNER
    im = Image.new("RGBA", (w, h), BG_COLOR)
    draw = ImageDraw.Draw(im)

    font_title = get_font(22, bold=True)
    lines = ["GEHE", "IN DAS", "GEFÄNGNIS"]
    y = 60
    for line in lines:
        b = draw.textbbox((0, 0), line, font=font_title)
        draw.text(((w - (b[2]-b[0]))//2, y), line, fill=TEXT_DARK, font=font_title)
        y += 34

    font_sub = get_font(12, bold=False)
    sub = "BEGIB DICH DIREKT DORTHIN"
    b_sub = draw.textbbox((0, 0), sub, font=font_sub)
    draw.text(((w - (b_sub[2]-b_sub[0]))//2, y + 10), sub, fill=TEXT_MUTED, font=font_sub)

    return im

def build_board():
    board = Image.new("RGBA", (SIZE, SIZE), BORDER_COLOR)
    draw = ImageDraw.Draw(board)

    # 1. Fill center area
    center_x = CORNER + BORDER
    center_y = CORNER + BORDER
    draw.rectangle([center_x, center_y, center_x + CENTER_SIZE, center_y + CENTER_SIZE], fill=BG_COLOR)

    # 2. Render Corner 0: LOS (Bottom Right)
    los_im = render_corner_los()
    board.paste(los_im, (SIZE - CORNER, SIZE - CORNER))

    # 3. Render Corner 10: Gefängnis (Bottom Left)
    jail_im = render_corner_jail()
    board.paste(jail_im, (0, SIZE - CORNER))

    # 4. Render Corner 20: Frei Parken (Top Left)
    # The text faces players looking at top-left.
    park_im = render_corner_parking()
    board.paste(park_im, (0, 0))

    # 5. Render Corner 30: Gehe ins Gefängnis (Top Right)
    gotojail_im = render_corner_gotojail()
    board.paste(gotojail_im, (SIZE - CORNER, 0))

    # Helper coordinate calculator
    def get_pos(side_index):
        # side_index 0..8
        return CORNER + BORDER + side_index * (PROP_W + BORDER)

    # 6. Bottom Edge (Spaces 1 to 9, Right to Left)
    # Color bar faces up (inwards into board center). Price faces bottom edge.
    for i in range(1, 10):
        space_info = SPACES[i]
        cell_im = render_street_cell(space_info)
        side_idx = 9 - i  # 1 -> 8 (near LOS), 9 -> 0 (near Jail)
        x = get_pos(side_idx)
        y = SIZE - CORNER
        board.paste(cell_im, (x, y))

    # 7. Left Edge (Spaces 11 to 19, Bottom to Top)
    # Looking from outside left edge into the board:
    # Color bar faces right (inward into center), price faces left (outer edge).
    # Street names readable with head tilted to left -> rotate 90 deg clockwise.
    for i in range(11, 20):
        space_info = SPACES[i]
        cell_im = render_street_cell(space_info)
        rot_cell = cell_im.rotate(270, expand=True)
        side_idx = 19 - i  # 11 -> 8 (near Jail), 19 -> 0 (near Parking)
        x = 0
        y = get_pos(side_idx)
        board.paste(rot_cell, (x, y))

    # 8. Top Edge (Spaces 21 to 29, Left to Right)
    # Looking from top outside edge inward:
    # Color bar faces down (inward into center), price faces top (outer edge).
    # Rotate 180 deg.
    for i in range(21, 30):
        space_info = SPACES[i]
        cell_im = render_street_cell(space_info)
        rot_cell = cell_im.rotate(180, expand=True)
        side_idx = i - 21  # 21 -> 0 (near Parking), 29 -> 8 (near GotoJail)
        x = get_pos(side_idx)
        y = 0
        board.paste(rot_cell, (x, y))

    # 9. Right Edge (Spaces 31 to 39, Top to Bottom)
    # Looking from right outside edge inward:
    # Color bar faces left (inward into center), price faces right (outer edge).
    # Rotate 90 deg counter-clockwise.
    for i in range(31, 40):
        space_info = SPACES[i]
        cell_im = render_street_cell(space_info)
        rot_cell = cell_im.rotate(90, expand=True)
        side_idx = i - 31  # 31 -> 0 (near GotoJail), 39 -> 8 (near LOS)
        x = SIZE - CORNER
        y = get_pos(side_idx)
        board.paste(rot_cell, (x, y))

    # 10. Community Chest & Chance Card Slots in Center
    chest_box = Image.new("RGBA", (380, 240), (0,0,0,0))
    chest_draw = ImageDraw.Draw(chest_box)
    chest_draw.rectangle([0, 0, 380, 240], outline=(59, 130, 246), width=4, fill=(239, 246, 255))
    font_slot = get_font(18, bold=True)
    chest_draw.text((45, 105), "GEMEINSCHAFTSKARTEN", fill=(30, 64, 175), font=font_slot)
    chest_rot = chest_box.rotate(45, expand=True, resample=Image.BICUBIC)
    board.paste(chest_rot, (420, 420), chest_rot)

    chance_box = Image.new("RGBA", (380, 240), (0,0,0,0))
    chance_draw = ImageDraw.Draw(chance_box)
    chance_draw.rectangle([0, 0, 380, 240], outline=(249, 115, 22), width=4, fill=(255, 247, 237))
    chance_draw.text((80, 105), "EREIGNISKARTEN", fill=(194, 65, 12), font=font_slot)
    chance_rot = chance_box.rotate(45, expand=True, resample=Image.BICUBIC)
    board.paste(chance_rot, (1160, 1160), chance_rot)

    # Save PNG
    out_dir = "/var/home/lukhicken/AGY/Skribbol/Monopoly/monopoly-master/boards"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "monopoly_classic_de.png")
    board.save(out_path, "PNG")
    print(f"Board successfully saved to {out_path}")

if __name__ == "__main__":
    build_board()
