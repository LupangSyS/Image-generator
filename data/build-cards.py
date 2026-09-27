#!/usr/bin/env python3
"""
Parses data/camelot-source.md (the pasted card database) into data/cards.json,
a flat, structured list the web app can load directly. Re-run this whenever
the source markdown is updated instead of hand-editing the JSON.
"""
import json
import re
import unicodedata

SRC = "camelot-source.md"
OUT = "cards.json"


def slugify(name_en):
    s = name_en.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "card"


def parse_champions(text):
    """Section 2: '#### N. Thai Name (English Name - Title)' blocks."""
    cards = []
    pattern = re.compile(
        r"#### (\d+)\.\s*(.+?)\s*\((.+?)\)\s*\n"
        r"\* \*\*พลังชีวิต:\*\*\s*(.+?)\n"
        r"\* \*\*ความสามารถ:\*\*\s*\n"
        r"((?:\s*\*.+\n)+)"
        r"\* \*\*AI Art Prompt:\*\*\s*\n"
        r"\s*`(.+?)`",
        re.MULTILINE,
    )
    for m in pattern.finditer(text):
        num, name_th, en_part, hp, abilities_block, art_prompt = m.groups()
        if " - " in en_part:
            name_en, title = en_part.split(" - ", 1)
        else:
            name_en, title = en_part, ""
        abilities = []
        for line in abilities_block.strip().split("\n"):
            line = line.strip().lstrip("*").strip()
            am = re.match(r"\*(.+?):\*\s*(.+)", line)
            if am:
                abilities.append({"name": am.group(1).strip() + ":", "text": am.group(2).strip()})
            elif line:
                abilities.append({"name": "", "text": line})
        cards.append({
            "id": slugify(name_en.strip()),
            "category": "champion",
            "number": int(num),
            "nameTh": name_th.strip(),
            "nameEn": name_en.strip(),
            "title": title.strip(),
            "hp": hp.strip(),
            "abilities": abilities,
            "flavor": "",
            "artPrompt": art_prompt.strip(),
        })
    return cards


def parse_roles(text):
    """Section 1: role table + numbered prompt list."""
    table_pat = re.compile(
        r"^\|[ \t]*\*\*(\d+)\.[ \t]*(.+?)[ \t]*\((.+?)\)\*\*[ \t]*\|"
        r"[ \t]*(.+?)[ \t]*\|[ \t]*(.+?)[ \t]*\|[ \t]*$",
        re.MULTILINE,
    )
    prompts = {}
    prompt_pat = re.compile(
        r"\d+\.\s*\*\*(.+?)\s*\((.+?)\)[:\s]*\*\*\s*\n\s*\*\s*\*\*Prompt:\*\*\s*`(.+?)`",
        re.MULTILINE,
    )
    for m in prompt_pat.finditer(text):
        _, en_part, prompt = m.groups()
        key = en_part.split(" - ")[0].strip().lower()
        prompts[key] = prompt.strip()

    cards = []
    for m in table_pat.finditer(text):
        num, name_th, en_part, count, ability = m.groups()
        name_en = en_part.split(" - ")[0].strip()
        cards.append({
            "id": "role-" + slugify(name_en),
            "category": "role",
            "number": int(num),
            "nameTh": name_th.strip(),
            "nameEn": name_en,
            "title": en_part.split(" - ", 1)[1].strip() if " - " in en_part else "",
            "hp": "",
            "abilities": [{"name": "", "text": ability.strip()}],
            "flavor": f"จำนวนในเกม: {count.strip()}",
            "artPrompt": prompts.get(name_en.lower(), ""),
        })
    return cards


def parse_table_section(text, category, name_col_pattern):
    """
    Generic parser for the item/spell/relic tables (ลำดับ | ชื่อ... | จำนวน | ... | ผล/ความสามารถ).
    Captures: number, Thai name, English name, quantity, and the last column as the effect text.
    Then attaches matching AI Art Prompt blocks found afterward in the same section by name.
    """
    row_pat = re.compile(
        r"^\|[ \t]*\*\*(\d+)\*\*[ \t]*\|[ \t]*\*\*(.+?)[ \t]*\((.+?)\)\*\*[ \t]*\|"
        r"[ \t]*(.+?)[ \t]*\|(?:[ \t]*.+?[ \t]*\|)?[ \t]*(.+?)[ \t]*\|[ \t]*$"
    )
    prompt_pat = re.compile(
        r"\*\*(.+?)\s*\((.+?)\)[:\s]*\*\*\s*\n\s*\*\s*\*\*Prompt:\*\*\s*`(.+?)`",
        re.MULTILINE,
    )
    prompts = {}
    for m in prompt_pat.finditer(text):
        en_part, prompt = m.group(2), m.group(3)
        key = en_part.split(" - ")[0].strip().lower()
        prompts[key] = prompt.strip()

    cards = []
    seen = set()
    for line in text.split("\n"):
        m = row_pat.match(line)
        if not m:
            continue
        num, name_th, en_part, count, effect = m.groups()
        name_en = en_part.split(" - ")[0].strip()
        key = (category, name_en.lower())
        if key in seen:
            continue
        seen.add(key)
        cards.append({
            "id": category + "-" + slugify(name_en),
            "category": category,
            "number": int(num),
            "nameTh": name_th.strip(),
            "nameEn": name_en,
            "title": en_part.split(" - ", 1)[1].strip() if " - " in en_part else "",
            "hp": "",
            "abilities": [{"name": "", "text": effect.strip()}],
            "flavor": f"จำนวน: {count.strip()}",
            "artPrompt": prompts.get(name_en.lower(), ""),
        })
    return cards


def main():
    with open(SRC, encoding="utf-8") as f:
        text = f.read()

    sections = re.split(r"\n---\n", text)

    def section_containing(marker):
        for s in sections:
            if marker in s:
                return s
        return ""

    roles = parse_roles(section_containing("การ์ดบทบาทลับ"))
    champions = parse_champions(text)  # spans multiple `---` blocks, use full text

    basic_arts_section = section_containing("Basic Arts")
    relics_section = section_containing("Relics & Equipment")
    spells_section = section_containing("Incantations & Curses")

    basic_arts = parse_table_section(basic_arts_section, "basic-art", None)
    relics = parse_table_section(relics_section, "relic", None)
    spells = parse_table_section(spells_section, "spell", None)

    all_cards = roles + champions + basic_arts + relics + spells

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(all_cards, f, ensure_ascii=False, indent=2)

    print(f"roles={len(roles)} champions={len(champions)} basic_arts={len(basic_arts)} "
          f"relics={len(relics)} spells={len(spells)} total={len(all_cards)}")


if __name__ == "__main__":
    main()
