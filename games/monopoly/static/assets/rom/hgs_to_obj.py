#!/usr/bin/env python3
"""
HGS to OBJ Converter
Konvertiert 3D-Modelle aus dem proprietären HGS-Format (Mercury / Venan 3D-Engine)
in das universelle Wavefront OBJ-Format (für Three.js, Babylon.js, Blender etc.).
"""

import sys
import os
import struct
import argparse

TAG_VERTEX_BUFFER = b'\x03\x14\x40\x02'
TAG_INDEX_BUFFER  = b'\x09\x0c\xa0\x00'

def convert_hgs_to_obj(hgs_bytes, model_name="Model"):
    """
    Konvertiert rohe HGS-Bytes in einen OBJ-String.
    Unterstützt sowohl Einzel- als auch Multi-Submesh-Dateien.
    """
    vbs, ibs = [], []
    pos = 0
    while True:
        pos = hgs_bytes.find(TAG_VERTEX_BUFFER, pos)
        if pos == -1:
            break
        vbs.append(pos)
        pos += 4

    pos = 0
    while True:
        pos = hgs_bytes.find(TAG_INDEX_BUFFER, pos)
        if pos == -1:
            break
        ibs.append(pos)
        pos += 4

    if not vbs or len(vbs) != len(ibs):
        return None

    obj_lines = [
        f"# Converted from HGS (Mercury 3D Engine)",
        f"# Model: {model_name}",
        f"o {model_name}",
        ""
    ]

    vert_offset = 1  # OBJ ist 1-basiert

    for sub_idx, (vb, ib) in enumerate(zip(vbs, ibs)):
        # --- 1. Vertex Buffer parsen ---
        num_verts = struct.unpack('<I', hgs_bytes[vb+12:vb+16])[0]
        vb_data_len = struct.unpack('<I', hgs_bytes[vb+36:vb+40])[0]
        if num_verts == 0 or vb_data_len == 0:
            continue

        stride_bytes = vb_data_len // num_verts
        stride_floats = stride_bytes // 4
        vb_start = vb + 40

        obj_lines.append(f"# Submesh {sub_idx}: {num_verts} vertices")
        for i in range(num_verts):
            v_offset = vb_start + i * stride_bytes
            floats = struct.unpack(f'<{stride_floats}f', hgs_bytes[v_offset : v_offset + stride_bytes])
            x, y, z = floats[0], floats[1], floats[2]
            nx, ny, nz = floats[3], floats[4], floats[5]
            u, v = floats[stride_floats-2], floats[stride_floats-1]
            obj_lines.append(f"v {x:.6f} {y:.6f} {z:.6f}")
            obj_lines.append(f"vn {nx:.6f} {ny:.6f} {nz:.6f}")
            obj_lines.append(f"vt {u:.6f} {v:.6f}")

        # --- 2. Index Buffer parsen ---
        tag_i, ver_i, size_i = struct.unpack('<IHI', hgs_bytes[ib:ib+10])
        idx_offset = struct.unpack('<H', hgs_bytes[ib+10:ib+12])[0]
        num_indices = (size_i - idx_offset) // 2
        indices = struct.unpack(f'<{num_indices}H', hgs_bytes[ib+idx_offset : ib+idx_offset+num_indices*2])

        obj_lines.append(f"g {model_name}_part_{sub_idx}")
        obj_lines.append(f"# Submesh {sub_idx}: {num_indices // 3} triangles")
        for t in range(0, num_indices, 3):
            i1 = indices[t] + vert_offset
            i2 = indices[t+1] + vert_offset
            i3 = indices[t+2] + vert_offset
            obj_lines.append(f"f {i1}/{i1}/{i1} {i2}/{i2}/{i2} {i3}/{i3}/{i3}")

        vert_offset += num_verts
        obj_lines.append("")

    return "\n".join(obj_lines)

def convert_file(in_path, out_path, model_name=None):
    if model_name is None:
        model_name = os.path.splitext(os.path.basename(out_path))[0]
    with open(in_path, 'rb') as f:
        data = f.read()
    obj_content = convert_hgs_to_obj(data, model_name)
    if obj_content is None:
        print(f"Fehler: Konnte {in_path} nicht konvertieren (keine passenden Mesh-Buffer gefunden).")
        return False
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(obj_content)
    print(f"Erfolgreich konvertiert: {in_path} -> {out_path}")
    return True

def main():
    parser = argparse.ArgumentParser(description="Konvertiert Monopoly HGS 3D-Modelle zu OBJ")
    parser.add_argument("input", nargs="?", help="Pfad zur .hgs Eingabedatei oder Verzeichnis")
    parser.add_argument("output", nargs="?", help="Pfad zur .obj Ausgabedatei oder Verzeichnis")
    parser.add_argument("--batch", action="store_true", help="Batch-Konvertierung aller Modelle")
    args = parser.parse_args()

    if args.input and args.output and not args.batch:
        convert_file(args.input, args.output)
    else:
        # Standard: Batch-Konvertierung der bekannten Modelle im Assets-Ordner
        script_dir = os.path.dirname(os.path.abspath(__file__))
        hgs_base = os.path.join(script_dir, "10_3D_Modelle")
        out_base = os.path.join(script_dir, "11_3D_Modelle_OBJ")

        targets = [
            # Gebäude
            ("Gebaeude/house_static.hgs", "Gebaeude/haus.obj", "Haus"),
            ("Gebaeude/hotel_static.hgs", "Gebaeude/hotel.obj", "Hotel"),
            ("Gebaeude/jail_model.hgs", "Gebaeude/gefaengnis.obj", "Gefaengnis"),
            # Würfel
            ("Wuerfel/dice.hgs", "Wuerfel/wuerfel.obj", "Wuerfel"),
            # Spielfiguren High-Poly & Low-Poly
            ("Spielfiguren/Zylinder/models/token_hat_model.hgs", "Spielfiguren/zylinder.obj", "Zylinder"),
            ("Spielfiguren/Zylinder/models/token_hat_model_low.hgs", "Spielfiguren/zylinder_low.obj", "Zylinder_Low"),
            ("Spielfiguren/Schlachtschiff/models/token_battleship_model.hgs", "Spielfiguren/schlachtschiff.obj", "Schlachtschiff"),
            ("Spielfiguren/Schlachtschiff/models/token_battleship_model_low.hgs", "Spielfiguren/schlachtschiff_low.obj", "Schlachtschiff_Low"),
            ("Spielfiguren/Rennwagen/models/token_car_model.hgs", "Spielfiguren/rennwagen.obj", "Rennwagen"),
            ("Spielfiguren/Rennwagen/models/token_car_model_low.hgs", "Spielfiguren/rennwagen_low.obj", "Rennwagen_Low"),
            ("Spielfiguren/Hund/models/token_dog_model.hgs", "Spielfiguren/hund.obj", "Hund"),
            ("Spielfiguren/Hund/models/token_dog_model_low.hgs", "Spielfiguren/hund_low.obj", "Hund_Low"),
            ("Spielfiguren/Buegeleisen/models/token_iron_model.hgs", "Spielfiguren/buegeleisen.obj", "Buegeleisen"),
            ("Spielfiguren/Buegeleisen/models/token_iron_model_low.hgs", "Spielfiguren/buegeleisen_low.obj", "Buegeleisen_Low"),
            ("Spielfiguren/Schuh/models/token_shoe_model.hgs", "Spielfiguren/schuh.obj", "Schuh"),
            ("Spielfiguren/Schuh/models/token_shoe_model_low.hgs", "Spielfiguren/schuh_low.obj", "Schuh_Low"),
            ("Spielfiguren/Fingerhut/models/token_thimble_model.hgs", "Spielfiguren/fingerhut.obj", "Fingerhut"),
            ("Spielfiguren/Fingerhut/models/token_thimble_model_low.hgs", "Spielfiguren/fingerhut_low.obj", "Fingerhut_Low"),
            ("Spielfiguren/Schubkarre/models/token_wheelbarrow_model.hgs", "Spielfiguren/schubkarre.obj", "Schubkarre"),
            ("Spielfiguren/Schubkarre/models/token_wheelbarrow_model_low.hgs", "Spielfiguren/schubkarre_low.obj", "Schubkarre_Low"),
        ]

        print(f"Starte Konvertierung von {len(targets)} 3D-Modellen...")
        count = 0
        for src_rel, dst_rel, name in targets:
            src = os.path.join(hgs_base, src_rel)
            dst = os.path.join(out_base, dst_rel)
            if os.path.exists(src):
                if convert_file(src, dst, name):
                    count += 1
            else:
                print(f"Warnung: {src} existiert nicht.")
        print(f"\nFertig! {count} Modelle erfolgreich nach {out_base} konvertiert.")

if __name__ == "__main__":
    main()
