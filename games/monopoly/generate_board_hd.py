import os
import math
from PIL import Image, ImageDraw, ImageFont

# ==============================================================================
# EXACT MATHEMATICAL DIMENSIONS (Matching User Specifications 100%)
# ==============================================================================
# Total Size: 2048 x 2048 px
# Corner Cells: 271 x 271 px (2 corners = 542 px)
# Street / Middle Cells: 164 x 271 px (9 cells = 1476 px)
# Border Lines: 3 px between every space (10 borders = 30 px)
# Formula: 2 * 271 + 9 * 164 + 10 * 3 = 542 + 1476 + 30 = 2048 px
# Center Size: 1500 x 1500 px (2048 - 2 * (271 + 3))
# ==============================================================================

SIZE = 2048
CORNER = 271
PROP_W = 164
PROP_H = 271
BORDER = 3
CENTER_START = CORNER + BORDER          # 274
CENTER_END = SIZE - CORNER - BORDER     # 1774
CENTER_SIZE = CENTER_END - CENTER_START # 1500

# Authentic Parker Brothers / Hasbro German Monopoly Colors
BG_COLOR = (218, 231, 214, 255)       # Classic Monopoly Mint/Cream #dae7d6
BORDER_COLOR = (20, 20, 24, 255)      # Deep Black Charcoal #141418
TEXT_DARK = (18, 18, 20, 255)         # Ink Black
TEXT_MUTED = (71, 85, 105, 255)       # Slate Gray
WHITE = (255, 255, 255, 255)

COLORS = {
    "brown": (118, 66, 39, 255),       # Badstraße, Turmstraße
    "lightblue": (157, 213, 243, 255),  # Chausseestraße, Elisenstraße, Poststraße
    "pink": (223, 52, 142, 255),       # Seestraße, Hafenstraße, Neue Straße
    "orange": (247, 147, 30, 255),     # Münchner, Wiener, Berliner Straße
    "red": (237, 27, 36, 255),         # Theaterstraße, Museumstraße, Opernplatz
    "yellow": (254, 242, 0, 255),      # Lessingstraße, Schillerstraße, Goethestraße
    "green": (31, 178, 90, 255),       # Rathausplatz, Hauptstraße, Bahnhofstraße
    "darkblue": (0, 114, 187, 255),    # Parkstraße, Schlossallee
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE_DIR, "images")

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"

def get_font(size, style="bold"):
    path = FONT_REG
    if style == "bold":
        path = FONT_BOLD
    elif style == "black":
        path = FONT_BLACK
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def clean_bg(im, thresh=35):
    """Cleanly removes solid white/light background around icon while preserving internal whites"""
    im = im.convert("RGBA")
    w, h = im.size
    pad = Image.new("RGBA", (w + 4, h + 4), (255, 255, 255, 255))
    pad.paste(im, (2, 2))
    ImageDraw.floodfill(pad, (0, 0), (0, 0, 0, 0), thresh=thresh)
    return pad.crop((2, 2, w + 2, h + 2))

def load_icon(name, max_w=None, max_h=None, make_trans=True):
    p = os.path.join(IMG_DIR, name)
    if not os.path.exists(p):
        return None
    try:
        im = Image.open(p).convert("RGBA")
        if make_trans:
            im = clean_bg(im)
        if max_w and max_h:
            im.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
        elif max_w:
            ratio = max_w / float(im.size[0])
            new_h = int(float(im.size[1]) * ratio)
            im = im.resize((max_w, new_h), Image.Resampling.LANCZOS)
        elif max_h:
            ratio = max_h / float(im.size[1])
            new_w = int(float(im.size[0]) * ratio)
            im = im.resize((new_w, max_h), Image.Resampling.LANCZOS)
        return im
    except Exception as e:
        print(f"Error loading {name}: {e}")
        return None

# ==============================================================================
# SPACES DEFINITIONS (Classic German Monopoly Edition)
# ==============================================================================
SPACES = [
    # 0: LOS (Bottom Right)
    {"index": 0, "type": "corner", "name": "LOS"},
    # 1 - 9: South (Bottom) Edge, Right to Left
    {"index": 1, "type": "property", "name": "BADSTRASSE", "price": "60 DM", "color": COLORS["brown"]},
    {"index": 2, "type": "community_chest", "name": "GEMEINSCHAFTS-\nFELD"},
    {"index": 3, "type": "property", "name": "TURMSTRASSE", "price": "60 DM", "color": COLORS["brown"]},
    {"index": 4, "type": "tax_income", "name": "EINKOMMEN-\nSTEUER", "sub": "ZAHLE 200 DM"},
    {"index": 5, "type": "railroad", "name": "SÜDBAHNHOF", "price": "200 DM"},
    {"index": 6, "type": "property", "name": "CHAUSSEE-\nSTRASSE", "price": "100 DM", "color": COLORS["lightblue"]},
    {"index": 7, "type": "chance", "name": "EREIGNISFELD"},
    {"index": 8, "type": "property", "name": "ELISENSTRASSE", "price": "100 DM", "color": COLORS["lightblue"]},
    {"index": 9, "type": "property", "name": "POSTSTRASSE", "price": "120 DM", "color": COLORS["lightblue"]},
    # 10: Gefängnis (Bottom Left)
    {"index": 10, "type": "corner", "name": "GEFÄNGNIS"},
    # 11 - 19: West (Left) Edge, Bottom to Top
    {"index": 11, "type": "property", "name": "SEESTRASSE", "price": "140 DM", "color": COLORS["pink"]},
    {"index": 12, "type": "utility_electric", "name": "ELEKTRIZITÄTS-\nWERK", "price": "150 DM"},
    {"index": 13, "type": "property", "name": "HAFENSTRASSE", "price": "140 DM", "color": COLORS["pink"]},
    {"index": 14, "type": "property", "name": "NEUE STRASSE", "price": "160 DM", "color": COLORS["pink"]},
    {"index": 15, "type": "railroad", "name": "WESTBAHNHOF", "price": "200 DM"},
    {"index": 16, "type": "property", "name": "MÜNCHNER\nSTRASSE", "price": "180 DM", "color": COLORS["orange"]},
    {"index": 17, "type": "community_chest", "name": "GEMEINSCHAFTS-\nFELD"},
    {"index": 18, "type": "property", "name": "WIENER\nSTRASSE", "price": "180 DM", "color": COLORS["orange"]},
    {"index": 19, "type": "property", "name": "BERLINER\nSTRASSE", "price": "200 DM", "color": COLORS["orange"]},
    # 20: Frei Parken (Top Left)
    {"index": 20, "type": "corner", "name": "FREI PARKEN"},
    # 21 - 29: North (Top) Edge, Left to Right
    {"index": 21, "type": "property", "name": "THEATER-\nSTRASSE", "price": "220 DM", "color": COLORS["red"]},
    {"index": 22, "type": "chance", "name": "EREIGNISFELD"},
    {"index": 23, "type": "property", "name": "MUSEUM-\nSTRASSE", "price": "220 DM", "color": COLORS["red"]},
    {"index": 24, "type": "property", "name": "OPERNPLATZ", "price": "240 DM", "color": COLORS["red"]},
    {"index": 25, "type": "railroad", "name": "NORDBAHNHOF", "price": "200 DM"},
    {"index": 26, "type": "property", "name": "LESSING-\nSTRASSE", "price": "260 DM", "color": COLORS["yellow"]},
    {"index": 27, "type": "property", "name": "SCHILLER-\nSTRASSE", "price": "260 DM", "color": COLORS["yellow"]},
    {"index": 28, "type": "utility_water", "name": "WASSERWERK", "price": "150 DM"},
    {"index": 29, "type": "property", "name": "GOETHE-\nSTRASSE", "price": "280 DM", "color": COLORS["yellow"]},
    # 30: Gehe ins Gefängnis (Top Right)
    {"index": 30, "type": "corner", "name": "GEHE INS GEFÄNGNIS"},
    # 31 - 39: East (Right) Edge, Top to Bottom
    {"index": 31, "type": "property", "name": "RATHAUSPLATZ", "price": "300 DM", "color": COLORS["green"]},
    {"index": 32, "type": "property", "name": "HAUPTSTRASSE", "price": "300 DM", "color": COLORS["green"]},
    {"index": 33, "type": "community_chest", "name": "GEMEINSCHAFTS-\nFELD"},
    {"index": 34, "type": "property", "name": "BAHNHOF-\nSTRASSE", "price": "320 DM", "color": COLORS["green"]},
    {"index": 35, "type": "railroad", "name": "HAUPTBAHNHOF", "price": "200 DM"},
    {"index": 36, "type": "chance", "name": "EREIGNISFELD"},
    {"index": 37, "type": "property", "name": "PARKSTRASSE", "price": "350 DM", "color": COLORS["darkblue"]},
    {"index": 38, "type": "tax_luxury", "name": "ZUSATZSTEUER", "sub": "ZAHLE 100 DM"},
    {"index": 39, "type": "property", "name": "SCHLOSSALLEE", "price": "400 DM", "color": COLORS["darkblue"]}
]

# ==============================================================================
# CELL RENDERERS
# ==============================================================================

def render_street_cell(info):
    """Renders upright 164 x 271 px cell with color bar, street name and price"""
    w, h = PROP_W, PROP_H
    cell = Image.new("RGBA", (w, h), BG_COLOR)
    draw = ImageDraw.Draw(cell)

    # 1. Color Bar at top (58 px)
    color = info["color"]
    bar_h = 58
    draw.rectangle([0, 0, w, bar_h], fill=color)
    draw.line([(0, bar_h), (w, bar_h)], fill=BORDER_COLOR, width=3)

    # 2. Street Name
    name = info["name"]
    lines = name.split('\n')
    font_name = get_font(17 if len(lines) == 1 else 16, style="bold")
    
    start_y = 80 if len(lines) == 1 else 70
    line_spacing = 22
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font_name)
        lw = bbox[2] - bbox[0]
        draw.text(((w - lw) // 2, start_y + i * line_spacing), line, fill=TEXT_DARK, font=font_name)

    # 3. Price at bottom
    price = info.get("price", "")
    if price:
        font_price = get_font(16, style="bold")
        bbox = draw.textbbox((0, 0), price, font=font_price)
        pw = bbox[2] - bbox[0]
        draw.text(((w - pw) // 2, h - 35), price, fill=TEXT_DARK, font=font_price)

    return cell

def render_railroad_cell(info):
    """Renders Railroad (Bahnhof) cell with steam locomotive icon and price"""
    w, h = PROP_W, PROP_H
    cell = Image.new("RGBA", (w, h), BG_COLOR)
    draw = ImageDraw.Draw(cell)

    # Name at top
    name = info["name"]
    font_name = get_font(17, style="bold")
    bbox = draw.textbbox((0, 0), name, font=font_name)
    draw.text(((w - (bbox[2] - bbox[0])) // 2, 22), name, fill=TEXT_DARK, font=font_name)

    # Locomotive Icon
    train_icon = load_icon("train_icon.png", max_w=95, max_h=85, make_trans=True)
    if train_icon:
        x = (w - train_icon.size[0]) // 2
        y = 85
        cell.paste(train_icon, (x, y), train_icon)

    # Price at bottom
    price = info.get("price", "200 DM")
    font_price = get_font(16, style="bold")
    bbox = draw.textbbox((0, 0), price, font=font_price)
    pw = bbox[2] - bbox[0]
    draw.text(((w - pw) // 2, h - 35), price, fill=TEXT_DARK, font=font_price)

    return cell

def render_utility_cell(info):
    """Renders Utility (Elektrizitätswerk / Wasserwerk) cell"""
    w, h = PROP_W, PROP_H
    cell = Image.new("RGBA", (w, h), BG_COLOR)
    draw = ImageDraw.Draw(cell)

    name = info["name"]
    lines = name.split('\n')
    font_name = get_font(16 if len(lines) > 1 else 17, style="bold")
    start_y = 20
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font_name)
        lw = bbox[2] - bbox[0]
        draw.text(((w - lw) // 2, start_y + i * 22), line, fill=TEXT_DARK, font=font_name)

    icon_name = "electric_icon.png" if "ELEKTRIZITÄTS" in name else "water_icon.png"
    icon = load_icon(icon_name, max_w=90, max_h=85, make_trans=True)
    if icon:
        x = (w - icon.size[0]) // 2
        y = 95
        cell.paste(icon, (x, y), icon)

    price = info.get("price", "150 DM")
    font_price = get_font(16, style="bold")
    bbox = draw.textbbox((0, 0), price, font=font_price)
    pw = bbox[2] - bbox[0]
    draw.text(((w - pw) // 2, h - 35), price, fill=TEXT_DARK, font=font_price)

    return cell

def render_community_cell(info):
    """Renders Gemeinschaftsfeld with treasure chest icon without white background"""
    w, h = PROP_W, PROP_H
    cell = Image.new("RGBA", (w, h), BG_COLOR)
    draw = ImageDraw.Draw(cell)

    font_name = get_font(16, style="bold")
    lines = ["GEMEINSCHAFTS-", "FELD"]
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font_name)
        lw = bbox[2] - bbox[0]
        draw.text(((w - lw) // 2, 20 + i * 22), line, fill=TEXT_DARK, font=font_name)

    chest = load_icon("community_chest_icon.png", max_w=95, max_h=85, make_trans=True)
    if chest:
        x = (w - chest.size[0]) // 2
        y = 95
        cell.paste(chest, (x, y), chest)

    font_sub = get_font(11, style="bold")
    sub_lines = ["FOLGE DEN", "ANWEISUNGEN"]
    for i, line in enumerate(sub_lines):
        bbox = draw.textbbox((0, 0), line, font=font_sub)
        lw = bbox[2] - bbox[0]
        draw.text(((w - lw) // 2, 215 + i * 16), line, fill=TEXT_MUTED, font=font_sub)

    return cell

def render_chance_cell(info):
    """Renders Ereignisfeld with crisp question mark"""
    w, h = PROP_W, PROP_H
    cell = Image.new("RGBA", (w, h), BG_COLOR)
    draw = ImageDraw.Draw(cell)

    font_name = get_font(17, style="bold")
    bbox = draw.textbbox((0, 0), "EREIGNISFELD", font=font_name)
    draw.text(((w - (bbox[2] - bbox[0])) // 2, 22), "EREIGNISFELD", fill=TEXT_DARK, font=font_name)

    font_qm = get_font(95, style="black")
    bbox = draw.textbbox((0, 0), "?", font=font_qm)
    qw = bbox[2] - bbox[0]
    draw.text(((w - qw) // 2, 80), "?", fill=(0, 114, 187, 255), font=font_qm)

    font_sub = get_font(11, style="bold")
    sub_lines = ["FOLGE DEN", "ANWEISUNGEN"]
    for i, line in enumerate(sub_lines):
        bbox = draw.textbbox((0, 0), line, font=font_sub)
        lw = bbox[2] - bbox[0]
        draw.text(((w - lw) // 2, 215 + i * 16), line, fill=TEXT_MUTED, font=font_sub)

    return cell

def render_income_tax_cell(info):
    """Renders authentic Income Tax cell with diamond icon and 10% / 200 DM"""
    w, h = PROP_W, PROP_H
    cell = Image.new("RGBA", (w, h), BG_COLOR)
    draw = ImageDraw.Draw(cell)

    name = info["name"]
    lines = name.split('\n')
    font_name = get_font(16 if len(lines) > 1 else 17, style="bold")
    start_y = 20
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font_name)
        lw = bbox[2] - bbox[0]
        draw.text(((w - lw) // 2, start_y + i * 22), line, fill=TEXT_DARK, font=font_name)

    # Classic Income Tax Diamond (Rhombus)
    cx, cy = w // 2, 134
    dw, dh = 46, 44
    diamond_pts = [
        (cx, cy - dh),
        (cx + dw, cy),
        (cx, cy + dh),
        (cx - dw, cy)
    ]
    draw.polygon(diamond_pts, fill=WHITE, outline=BORDER_COLOR, width=3)

    # "10%" centered inside diamond
    font_pct = get_font(23, style="black")
    bp = draw.textbbox((0, 0), "10%", font=font_pct)
    pw = bp[2] - bp[0]
    ph = bp[3] - bp[1]
    draw.text((cx - pw // 2, cy - ph // 2 - 2), "10%", fill=TEXT_DARK, font=font_pct)

    sub = info.get("sub", "ZAHLE 200 DM")
    if sub:
        font_sub = get_font(15, style="bold")
        bbox = draw.textbbox((0, 0), sub, font=font_sub)
        sw = bbox[2] - bbox[0]
        draw.text(((w - sw) // 2, h - 35), sub, fill=TEXT_DARK, font=font_sub)

    return cell

def render_tax_cell(info):
    """Renders Luxury Tax (Zusatzsteuer) cell with sparkling diamond ring"""
    w, h = PROP_W, PROP_H
    cell = Image.new("RGBA", (w, h), BG_COLOR)
    draw = ImageDraw.Draw(cell)

    name = info["name"]
    lines = name.split('\n')
    font_name = get_font(16 if len(lines) > 1 else 17, style="bold")
    start_y = 20
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font_name)
        lw = bbox[2] - bbox[0]
        draw.text(((w - lw) // 2, start_y + i * 22), line, fill=TEXT_DARK, font=font_name)

    tax_icon = load_icon("tax_icon.png", max_w=90, max_h=80, make_trans=True)
    if tax_icon:
        x = (w - tax_icon.size[0]) // 2
        y = 95
        cell.paste(tax_icon, (x, y), tax_icon)

    sub = info.get("sub", "")
    if sub:
        font_sub = get_font(15, style="bold")
        bbox = draw.textbbox((0, 0), sub, font=font_sub)
        sw = bbox[2] - bbox[0]
        draw.text(((w - sw) // 2, h - 35), sub, fill=TEXT_DARK, font=font_sub)

    return cell

def render_special_space(info):
    stype = info.get("type")
    if stype == "property":
        return render_street_cell(info)
    elif stype == "railroad":
        return render_railroad_cell(info)
    elif stype == "utility_electric" or stype == "utility_water":
        return render_utility_cell(info)
    elif stype == "community_chest":
        return render_community_cell(info)
    elif stype == "chance":
        return render_chance_cell(info)
    elif stype == "tax_income":
        return render_income_tax_cell(info)
    elif stype == "tax" or stype == "tax_luxury":
        return render_tax_cell(info)
    return render_street_cell(info)

# ==============================================================================
# CORNER RENDERERS (Exact 271 x 271 px)
# ==============================================================================

def render_corner_los():
    """Corner 0: LOS (Bottom Right) with giant bold red LOS and authentic Parker Brothers red arrow"""
    w, h = CORNER, CORNER
    cell = Image.new("RGBA", (w, h), BG_COLOR)
    draw = ImageDraw.Draw(cell)

    font_sub = get_font(13, style="bold")
    t1 = "ZIEHE IM VORBEIGEHEN"
    t2 = "200 DM EIN"
    
    b1 = draw.textbbox((0, 0), t1, font=font_sub)
    draw.text(((w - (b1[2] - b1[0])) // 2, 22), t1, fill=TEXT_DARK, font=font_sub)
    
    b2 = draw.textbbox((0, 0), t2, font=font_sub)
    draw.text(((w - (b2[2] - b2[0])) // 2, 42), t2, fill=TEXT_DARK, font=font_sub)

    # Giant LOS text in authentic Red, rotated 45 degrees
    los_layer = Image.new("RGBA", (200, 100), (0, 0, 0, 0))
    los_draw = ImageDraw.Draw(los_layer)
    font_los = get_font(68, style="black")
    b_los = los_draw.textbbox((0, 0), "LOS", font=font_los)
    los_w = b_los[2] - b_los[0]
    los_draw.text(((200 - los_w) // 2, 8), "LOS", fill=(220, 38, 38, 255), font=font_los)
    los_rot = los_layer.rotate(45, expand=True, resample=Image.Resampling.BICUBIC)
    lx = (w - los_rot.size[0]) // 2 + 25
    ly = 40
    cell.paste(los_rot, (lx, ly), los_rot)

    # Authentic Parker Brothers / Hasbro red arrow pointing left
    arrow_color = (220, 38, 38, 255)
    arrow_pts = [
        (24, 216),    # Head tip pointing left
        (80, 184),    # Upper barb
        (80, 204),    # Upper neck
        (238, 204),   # Shaft top right
        (258, 186),   # Upper tail fin tip
        (240, 216),   # Tail center notch
        (258, 246),   # Lower tail fin tip
        (238, 228),   # Shaft bottom right
        (80, 228),    # Lower neck
        (80, 248),    # Lower barb
    ]
    draw.polygon(arrow_pts, fill=arrow_color, outline=BORDER_COLOR, width=3)

    return cell

def render_corner_jail():
    """Corner 10: Gefängnis (Bottom Left) with L-shaped 'Nur zu Besuch' and orange cell"""
    w, h = CORNER, CORNER
    cell = Image.new("RGBA", (w, h), BG_COLOR)
    draw = ImageDraw.Draw(cell)

    # Inner prison box: x: 70..271, y: 0..201
    box_x0, box_y0, box_x1, box_y1 = 70, 0, w, 201
    draw.rectangle([box_x0, box_y0, box_x1, box_y1], fill=(249, 115, 22, 255))
    draw.line([(box_x0, box_y0), (box_x0, box_y1)], fill=BORDER_COLOR, width=3)
    draw.line([(box_x0, box_y1), (box_x1, box_y1)], fill=BORDER_COLOR, width=3)

    # Header centered horizontally in orange box (x=70 to 271, width=201)
    font_jail = get_font(18, style="bold")
    b1 = draw.textbbox((0, 0), "IM", font=font_jail)
    draw.text(((201 - (b1[2] - b1[0])) // 2 + 70, 16), "IM", fill=WHITE, font=font_jail)
    b2 = draw.textbbox((0, 0), "GEFÄNGNIS", font=font_jail)
    draw.text(((201 - (b2[2] - b2[0])) // 2 + 70, 38), "GEFÄNGNIS", fill=WHITE, font=font_jail)

    # Prison Window with crisp white background and dark border
    win_x0, win_y0, win_x1, win_y1 = 106, 68, 234, 186
    win_w, win_h = win_x1 - win_x0, win_y1 - win_y0
    draw.rectangle([win_x0, win_y0, win_x1, win_y1], fill=WHITE, outline=BORDER_COLOR, width=2)
    
    # Jake behind bars (cleanly centered inside the white window)
    jake = Image.open(os.path.join(IMG_DIR, "jake_icon.png")).convert("RGBA")
    jake.thumbnail((120, 114), Image.Resampling.LANCZOS)
    jx = win_x0 + (win_w - jake.size[0]) // 2
    jy = win_y0 + (win_h - jake.size[1]) // 2
    cell.paste(jake, (jx, jy), jake)

    # "NUR" vertical on left (x: 0..70)
    font_visit = get_font(21, style="black")
    nur_layer = Image.new("RGBA", (100, 40), (0, 0, 0, 0))
    ImageDraw.Draw(nur_layer).text((5, 5), "NUR", fill=TEXT_DARK, font=font_visit)
    nur_rot = nur_layer.rotate(-90, expand=True)
    cell.paste(nur_rot, (18, 70), nur_rot)

    # "ZU BESUCH" horizontal on bottom (y: 201..271)
    b_vis = draw.textbbox((0, 0), "ZU BESUCH", font=font_visit)
    bw = b_vis[2] - b_vis[0]
    draw.text(((w + 70 - bw) // 2, 224), "ZU BESUCH", fill=TEXT_DARK, font=font_visit)

    return cell

def render_corner_parking():
    """Corner 20: Frei Parken (Top Left) with red car icon and angled typography"""
    w, h = CORNER, CORNER
    cell = Image.new("RGBA", (w, h), BG_COLOR)
    draw = ImageDraw.Draw(cell)

    layer = Image.new("RGBA", (280, 280), (0, 0, 0, 0))
    ldraw = ImageDraw.Draw(layer)

    font_park = get_font(27, style="black")
    t1 = "FREI"
    b1 = ldraw.textbbox((0, 0), t1, font=font_park)
    ldraw.text(((280 - (b1[2] - b1[0])) // 2, 32), t1, fill=(220, 38, 38, 255), font=font_park)

    car = load_icon("free_parking_icon.png", max_w=125, max_h=100, make_trans=True)
    if car:
        cx = (280 - car.size[0]) // 2
        layer.paste(car, (cx, 80), car)

    t2 = "PARKEN"
    b2 = ldraw.textbbox((0, 0), t2, font=font_park)
    ldraw.text(((280 - (b2[2] - b2[0])) // 2, 195), t2, fill=(220, 38, 38, 255), font=font_park)

    rot = layer.rotate(-45, expand=True, resample=Image.Resampling.BICUBIC)
    rx = (rot.size[0] - w) // 2
    ry = (rot.size[1] - h) // 2
    cropped = rot.crop((rx, ry, rx + w, ry + h))
    cell.paste(cropped, (0, 0), cropped)

    return cell

def render_corner_gotojail():
    """Corner 30: Gehe ins Gefängnis (Top Right) with Officer Mallory illustration"""
    w, h = CORNER, CORNER
    cell = Image.new("RGBA", (w, h), BG_COLOR)
    draw = ImageDraw.Draw(cell)

    layer = Image.new("RGBA", (280, 280), (0, 0, 0, 0))
    ldraw = ImageDraw.Draw(layer)

    font_title = get_font(23, style="black")
    lines = ["GEHE IN DAS", "GEFÄNGNIS"]
    for i, line in enumerate(lines):
        b = ldraw.textbbox((0, 0), line, font=font_title)
        ldraw.text(((280 - (b[2] - b[0])) // 2, 24 + i * 28), line, fill=TEXT_DARK, font=font_title)

    # Clean Officer illustration
    # Draw Police cap
    cap_x, cap_y = 140, 100
    ldraw.ellipse([cap_x - 38, cap_y - 20, cap_x + 38, cap_y + 10], fill=(30, 58, 138, 255), outline=BORDER_COLOR, width=2)
    ldraw.arc([cap_x - 42, cap_y - 10, cap_x + 42, cap_y + 18], start=0, end=180, fill=BORDER_COLOR, width=4)
    # Gold badge on cap
    ldraw.rectangle([cap_x - 8, cap_y - 12, cap_x + 8, cap_y + 4], fill=(234, 179, 8, 255))

    # Face
    ldraw.ellipse([cap_x - 26, cap_y, cap_x + 26, cap_y + 45], fill=(254, 215, 170, 255), outline=BORDER_COLOR, width=2)
    # Mustache
    ldraw.chord([cap_x - 18, cap_y + 20, cap_x + 18, cap_y + 36], start=0, end=180, fill=(30, 41, 59, 255))
    # Whistle
    ldraw.rectangle([cap_x - 32, cap_y + 24, cap_x - 12, cap_y + 32], fill=(203, 213, 225, 255), outline=BORDER_COLOR, width=1)
    
    # Body with pointing arm
    # Torso
    ldraw.polygon([(cap_x - 30, cap_y + 45), (cap_x + 30, cap_y + 45), (cap_x + 40, cap_y + 100), (cap_x - 40, cap_y + 100)], fill=(30, 58, 138, 255), outline=BORDER_COLOR, width=2)
    # Pointing Arm pointing down-left
    ldraw.line([(cap_x - 28, cap_y + 55), (cap_x - 65, cap_y + 90)], fill=(30, 58, 138, 255), width=14)
    # Pointing hand
    ldraw.polygon([(cap_x - 65, cap_y + 88), (cap_x - 82, cap_y + 102), (cap_x - 70, cap_y + 108)], fill=(254, 215, 170, 255), outline=BORDER_COLOR, width=2)

    font_sub = get_font(12, style="bold")
    sub = "BEGIB DICH DIREKT DORTHIN"
    bs = ldraw.textbbox((0, 0), sub, font=font_sub)
    ldraw.text(((280 - (bs[2] - bs[0])) // 2, 228), sub, fill=TEXT_MUTED, font=font_sub)

    rot = layer.rotate(45, expand=True, resample=Image.Resampling.BICUBIC)
    rx = (rot.size[0] - w) // 2
    ry = (rot.size[1] - h) // 2
    cropped = rot.crop((rx, ry, rx + w, ry + h))
    cell.paste(cropped, (0, 0), cropped)

    return cell

# ==============================================================================
# CENTER ARTWORK (Iconic MONOPOLY Red Banner & Card Slots)
# ==============================================================================

def render_center_artwork(board):
    """Draws the iconic center elements into the 1500x1500 center area"""

    # 1. GEMEINSCHAFTSKARTEN (Community Chest) Card Slot in top-left diagonal
    # Shifted outward to avoid colliding with banner
    chest_box = Image.new("RGBA", (390, 240), (0, 0, 0, 0))
    ch_draw = ImageDraw.Draw(chest_box)
    ch_draw.rounded_rectangle([4, 4, 386, 236], radius=16, fill=(239, 246, 255, 255), outline=(37, 99, 235, 255), width=5)
    
    ch_icon = load_icon("community_chest_icon.png", max_w=70, max_h=60, make_trans=True)
    if ch_icon:
        chest_box.paste(ch_icon, (160, 45), ch_icon)

    font_slot = get_font(19, style="black")
    t = "GEMEINSCHAFTSKARTEN"
    tb = ch_draw.textbbox((0, 0), t, font=font_slot)
    ch_draw.text(((390 - (tb[2] - tb[0])) // 2, 150), t, fill=(29, 78, 216, 255), font=font_slot)

    chest_rot = chest_box.rotate(45, expand=True, resample=Image.Resampling.BICUBIC)
    board.paste(chest_rot, (390, 390), chest_rot)

    # 2. EREIGNISKARTEN (Chance) Card Slot in bottom-right diagonal
    chance_box = Image.new("RGBA", (390, 240), (0, 0, 0, 0))
    ca_draw = ImageDraw.Draw(chance_box)
    ca_draw.rounded_rectangle([4, 4, 386, 236], radius=16, fill=(255, 247, 237, 255), outline=(234, 88, 12, 255), width=5)

    font_qm = get_font(60, style="black")
    qb = ca_draw.textbbox((0, 0), "?", font=font_qm)
    ca_draw.text(((390 - (qb[2] - qb[0])) // 2, 35), "?", fill=(234, 88, 12, 255), font=font_qm)

    t = "EREIGNISKARTEN"
    tb = ca_draw.textbbox((0, 0), t, font=font_slot)
    ca_draw.text(((390 - (tb[2] - tb[0])) // 2, 150), t, fill=(194, 65, 12, 255), font=font_slot)

    chance_rot = chance_box.rotate(45, expand=True, resample=Image.Resampling.BICUBIC)
    board.paste(chance_rot, (1230, 1230), chance_rot)

    # 3. GIANT ICONIC "MONOPOLY" RED BANNER
    # Runs diagonally across the center at -45 degrees
    banner_w, banner_h = 780, 170
    banner = Image.new("RGBA", (banner_w + 50, banner_h + 50), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(banner)

    # Shadow
    shadow_box = [26, 26, banner_w + 24, banner_h + 24]
    bdraw.rounded_rectangle(shadow_box, radius=24, fill=(0, 0, 0, 95))

    # Outer Red Box
    box = [20, 20, banner_w + 20, banner_h + 20]
    bdraw.rounded_rectangle(box, radius=22, fill=(220, 38, 38, 255), outline=WHITE, width=7)

    # Inner decorative border
    inner_box = [28, 28, banner_w + 12, banner_h + 12]
    bdraw.rounded_rectangle(inner_box, radius=18, outline=(185, 28, 28, 255), width=3)

    # White Letters "MONOPOLY"
    font_mono = get_font(110, style="black")
    mono_txt = "MONOPOLY"
    mt_bbox = bdraw.textbbox((0, 0), mono_txt, font=font_mono)
    tw = mt_bbox[2] - mt_bbox[0]
    tx = (banner_w + 50 - tw) // 2
    ty = 40

    # Drop shadow on letters
    bdraw.text((tx + 4, ty + 6), mono_txt, fill=(15, 23, 42, 220), font=font_mono)
    # White text
    bdraw.text((tx, ty), mono_txt, fill=WHITE, font=font_mono)

    # ® Symbol
    font_r = get_font(22, style="bold")
    bdraw.text((tx + tw + 10, ty + 12), "®", fill=WHITE, font=font_r)

    # Rotate banner -45 degrees
    banner_rot = banner.rotate(-45, expand=True, resample=Image.Resampling.BICUBIC)
    
    # Place dead center: center of board is (1024, 1024)
    bx = (SIZE - banner_rot.size[0]) // 2
    by = (SIZE - banner_rot.size[1]) // 2
    board.paste(banner_rot, (bx, by), banner_rot)

# ==============================================================================
# MAIN BOARD BUILDER
# ==============================================================================

def generate_board():
    print("=== Generating Perfect HD Monopoly Board (2048 x 2048 px) ===")
    
    # 1. Base canvas filled with 3px border color
    board = Image.new("RGBA", (SIZE, SIZE), BORDER_COLOR)
    draw = ImageDraw.Draw(board)

    # 2. Fill center area with authentic mint background
    draw.rectangle([CENTER_START, CENTER_START, CENTER_END, CENTER_END], fill=BG_COLOR)

    def get_coord(side_idx):
        return CORNER + BORDER + side_idx * (PROP_W + BORDER)

    # 3. Corners
    print("Rendering Corner 0: LOS...")
    board.paste(render_corner_los(), (SIZE - CORNER, SIZE - CORNER))

    print("Rendering Corner 10: Gefängnis...")
    board.paste(render_corner_jail(), (0, SIZE - CORNER))

    print("Rendering Corner 20: Frei Parken...")
    board.paste(render_corner_parking(), (0, 0))

    print("Rendering Corner 30: Gehe ins Gefängnis...")
    board.paste(render_corner_gotojail(), (SIZE - CORNER, 0))

    # 4. Bottom Edge (Spaces 1 to 9, Right to Left)
    print("Rendering Bottom Edge (Spaces 1 to 9)...")
    for i in range(1, 10):
        space_info = SPACES[i]
        cell_im = render_special_space(space_info)
        side_idx = 9 - i
        x = get_coord(side_idx)
        y = SIZE - CORNER
        board.paste(cell_im, (x, y))

    # 5. Left Edge (Spaces 11 to 19, Bottom to Top)
    print("Rendering Left Edge (Spaces 11 to 19)...")
    for i in range(11, 20):
        space_info = SPACES[i]
        cell_im = render_special_space(space_info)
        rot_cell = cell_im.rotate(270, expand=True)
        side_idx = 19 - i
        x = 0
        y = get_coord(side_idx)
        board.paste(rot_cell, (x, y))

    # 6. Top Edge (Spaces 21 to 29, Left to Right)
    print("Rendering Top Edge (Spaces 21 to 29)...")
    for i in range(21, 30):
        space_info = SPACES[i]
        cell_im = render_special_space(space_info)
        rot_cell = cell_im.rotate(180, expand=True)
        side_idx = i - 21
        x = get_coord(side_idx)
        y = 0
        board.paste(rot_cell, (x, y))

    # 7. Right Edge (Spaces 31 to 39, Top to Bottom)
    print("Rendering Right Edge (Spaces 31 to 39)...")
    for i in range(31, 40):
        space_info = SPACES[i]
        cell_im = render_special_space(space_info)
        rot_cell = cell_im.rotate(90, expand=True)
        side_idx = i - 31
        x = SIZE - CORNER
        y = get_coord(side_idx)
        board.paste(rot_cell, (x, y))

    # 8. Center Artwork (MONOPOLY logo & Card slots)
    print("Rendering Center Artwork (MONOPOLY logo & Card slots)...")
    render_center_artwork(board)

    # 9. Draw outer and inner borders (exact 3px)
    draw.rectangle([0, 0, SIZE - 1, SIZE - 1], outline=BORDER_COLOR, width=3)
    draw.rectangle([CENTER_START - BORDER, CENTER_START - BORDER, CENTER_END + BORDER - 1, CENTER_END + BORDER - 1], outline=BORDER_COLOR, width=BORDER)

    # Save to monopoly boards folder
    out_path = os.path.join(BASE_DIR, "boards", "monopoly_classic_de.png")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    board.save(out_path, "PNG", optimize=True)
    print(f"✅ Board successfully generated and saved to:\n{out_path}")
    print(f"File size: {os.path.getsize(out_path)} bytes")

if __name__ == "__main__":
    generate_board()
