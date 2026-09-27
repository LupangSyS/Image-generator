# Card Forge

A local, offline trading-card generator for the CAMELOT: ARCANE REALM deck. No AI image API is used — layout, frame, stats, and text are drawn with Canvas 2D; illustrations are art you supply yourself.

## Usage

Serve the folder with any static server (needed for `fetch()` to load the card database) and open `index.html`:

```
python3 -m http.server 8765
```

## Project layout

- `index.html`, `card-renderer.js` — the app.
- `data/camelot-source.md` — the original card database (source of truth for card text/stats).
- `data/build-cards.py` — parses `camelot-source.md` into `data/cards.json`. Re-run this after editing the markdown:
  ```
  cd data && python3 build-cards.py
  ```
- `data/cards.json` — structured card list the app loads into the "Card Database" picker.
- `assets/art/` — drop illustration files here named after a card's `id` (e.g. `mordred.png`, `role-holy-knights.png`). When you pick that card from the database dropdown, the app automatically loads the matching file (tries `.png`, `.jpg`, `.jpeg`, `.webp` in that order). No filename match yet → the card renders with the "Upload artwork" placeholder until you add one or upload manually.

## Card IDs

Run this to see every card's id/name pairing (used for naming art files):

```
python3 -c "import json; [print(c['id'], '-', c['nameEn']) for c in json.load(open('data/cards.json', encoding='utf-8'))]"
```
