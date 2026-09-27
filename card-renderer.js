// Card Forge — pure Canvas 2D trading-card renderer.
// No AI/image-generation API involved: text, frame, and effects are drawn
// with Canvas primitives; the illustration is whatever image the user uploads.

const CARD_W = 900;
const CARD_H = 1260;

const canvas = document.getElementById('cardCanvas');

const state = {
  name: 'MORDRED',
  subname: 'มอร์เดร็ด',
  cost: 4,
  rarity: 'MYTHIC',
  title: 'The Usurper Prince · เจ้าชายกบฏ',
  showCrown: true,
  ab1Name: 'คมดาบอาชญพิษ:',
  ab1Text: 'ศัตรูที่โดนดีตะติดพิษ พื้นเลือดไม่ได้จนกว่าจะจบรอบของมอร์เดร็ด',
  ab2Name: 'บัญชาทรยศ:',
  ab2Text: 'หากโจมตี "กษัตริย์อาเธอร์" จะได้จั่วการ์ดฟรี 1 ใบก่อนคิดดาเมจ',
  flavor: '"บัลลังก์นี้ควรเป็นของข้าตั้งแต่แรก และข้าจะทวงคืนด้วยเปลวเพลิง"',
  atk: 4,
  def: 4,
  footer: 'CAMELOT • CHAMPION 08',
  frameColor: '#c0392b',
  atkColor: '#c0392b',
  defColor: '#3aa0c8',
  artFocusX: 50,
  artFocusY: 50,
  artImage: null, // HTMLImageElement or null
};

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function roundRectPath(c, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + rr, y);
  c.arcTo(x + w, y, x + w, y + h, rr);
  c.arcTo(x + w, y + h, x, y + h, rr);
  c.arcTo(x, y + h, x, y, rr);
  c.arcTo(x, y, x + w, y, rr);
  c.closePath();
}

function wrapText(c, text, x, y, maxWidth, lineHeight, align) {
  const words = text.split(/\s+/);
  let line = '';
  const lines = [];
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + ' ' + words[i] : words[i];
    if (c.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = words[i];
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  lines.forEach((l, idx) => {
    c.textAlign = align || 'left';
    c.fillText(l, x, y + idx * lineHeight);
  });
  return lines.length * lineHeight;
}

function drawCrown(c, cx, cy, size, color) {
  c.save();
  c.translate(cx, cy);
  c.scale(size / 40, size / 40);
  c.beginPath();
  c.moveTo(-18, 8);
  c.lineTo(-18, -6);
  c.lineTo(-9, 2);
  c.lineTo(0, -10);
  c.lineTo(9, 2);
  c.lineTo(18, -6);
  c.lineTo(18, 8);
  c.closePath();
  c.fillStyle = color;
  c.fill();
  c.restore();
}

function drawDiamondIcon(c, cx, cy, r, color) {
  c.save();
  c.translate(cx, cy);
  c.rotate(Math.PI / 4);
  roundRectPath(c, -r, -r, r * 2, r * 2, r * 0.25);
  c.fillStyle = color;
  c.fill();
  c.restore();
}

function render(targetCtx) {
  const ctx = targetCtx || document.getElementById('cardCanvas').getContext('2d');
  ctx.clearRect(0, 0, CARD_W, CARD_H);

  const frame = state.frameColor;
  const pad = 22;

  // background
  ctx.fillStyle = '#0a0a0d';
  roundRectPath(ctx, 0, 0, CARD_W, CARD_H, 34);
  ctx.fill();

  // outer border glow
  ctx.save();
  roundRectPath(ctx, pad / 2, pad / 2, CARD_W - pad, CARD_H - pad, 30);
  ctx.strokeStyle = hexToRgba(frame, 0.9);
  ctx.lineWidth = 3;
  ctx.shadowColor = hexToRgba(frame, 0.6);
  ctx.shadowBlur = 18;
  ctx.stroke();
  ctx.restore();

  // inner panel background
  roundRectPath(ctx, pad, pad, CARD_W - pad * 2, CARD_H - pad * 2, 24);
  ctx.fillStyle = '#111319';
  ctx.fill();

  // ===== Header row: cost badge, name, rarity pill =====
  const headerY = pad + 46;
  drawDiamondIcon(ctx, pad + 56, headerY, 28, frame);
  ctx.fillStyle = '#fff';
  ctx.font = '700 30px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(state.cost), pad + 56, headerY + 2);

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f2f0e6';
  ctx.font = '700 40px Georgia, serif';
  ctx.fillText(state.name, pad + 100, headerY + 12);

  if (state.subname) {
    ctx.font = '400 18px Georgia, serif';
    ctx.fillStyle = '#c9c6ba';
    ctx.fillText(state.subname, pad + 100, headerY + 38);
  }

  // rarity pill
  ctx.font = '700 14px Arial';
  const rarityText = state.rarity;
  const rw = ctx.measureText(rarityText).width + 32;
  const rx = CARD_W - pad - rw - 10;
  const ry = pad + 18;
  roundRectPath(ctx, rx, ry, rw, 32, 16);
  ctx.strokeStyle = frame;
  ctx.lineWidth = 2;
  ctx.fillStyle = '#1a1c24';
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = frame;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(rarityText, rx + rw / 2, ry + 17);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  // small diamond decorations left/right of header
  drawDiamondIcon(ctx, pad + 24, pad + 24, 8, frame);
  drawDiamondIcon(ctx, CARD_W - pad - 24, pad + 24, 8, frame);

  // ===== Art frame =====
  const artX = pad + 24;
  const artY = pad + 96;
  const artW = CARD_W - pad * 2 - 48;
  const artH = 560;

  roundRectPath(ctx, artX, artY, artW, artH, 10);
  ctx.save();
  ctx.clip();
  if (state.artImage) {
    const img = state.artImage;
    const scale = Math.max(artW / img.width, artH / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const fx = state.artFocusX / 100;
    const fy = state.artFocusY / 100;
    const dx = artX - (dw - artW) * fx;
    const dy = artY - (dh - artH) * fy;
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    const grad = ctx.createLinearGradient(artX, artY, artX, artY + artH);
    grad.addColorStop(0, '#2b2f3a');
    grad.addColorStop(1, '#12131a');
    ctx.fillStyle = grad;
    ctx.fillRect(artX, artY, artW, artH);
    ctx.fillStyle = '#5a5f70';
    ctx.font = '500 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Upload artwork ->', artX + artW / 2, artY + artH / 2);
    ctx.textAlign = 'left';
  }
  ctx.restore();
  roundRectPath(ctx, artX, artY, artW, artH, 10);
  ctx.strokeStyle = hexToRgba(frame, 0.8);
  ctx.lineWidth = 2;
  ctx.stroke();

  // ===== Title bar =====
  const titleY = artY + artH + 30;
  const titleH = 42;
  roundRectPath(ctx, artX, titleY, artW, titleH, 8);
  ctx.fillStyle = hexToRgba(frame, 0.15);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(frame, 0.7);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = frame;
  ctx.font = '600 15px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let titlePrefix = state.showCrown ? '✦  ' : '';
  ctx.fillText(titlePrefix + state.title + (state.showCrown ? '  ✦' : ''), artX + artW / 2, titleY + titleH / 2 + 1);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  if (state.showCrown) {
    drawCrown(ctx, artX + artW - 34, titleY + titleH / 2, 22, frame);
  }

  // ===== Ability box =====
  const abX = artX;
  const abY = titleY + titleH + 18;
  const abW = artW;
  let abH = 214;
  roundRectPath(ctx, abX, abY, abW, abH, 10);
  ctx.fillStyle = '#151720';
  ctx.fill();
  ctx.strokeStyle = hexToRgba(frame, 0.5);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  let textY = abY + 34;
  const textX = abX + 20;
  const textMaxW = abW - 40;

  ctx.font = '700 17px Arial';
  ctx.fillStyle = frame;
  ctx.fillText(state.ab1Name, textX, textY);
  textY += 26;
  ctx.font = '400 16px Arial';
  ctx.fillStyle = '#e6e4dc';
  textY += wrapText(ctx, state.ab1Text, textX, textY, textMaxW, 22);

  textY += 18;
  ctx.font = '700 17px Arial';
  ctx.fillStyle = frame;
  ctx.fillText(state.ab2Name, textX, textY);
  textY += 26;
  ctx.font = '400 16px Arial';
  ctx.fillStyle = '#e6e4dc';
  textY += wrapText(ctx, state.ab2Text, textX, textY, textMaxW, 22);

  // divider
  const dividerY = abY + abH - 46;
  ctx.strokeStyle = hexToRgba(frame, 0.4);
  ctx.beginPath();
  ctx.moveTo(textX, dividerY);
  ctx.lineTo(abX + abW - 20, dividerY);
  ctx.stroke();

  // flavor text
  ctx.font = 'italic 400 14px Georgia, serif';
  ctx.fillStyle = '#9a978c';
  ctx.textAlign = 'center';
  wrapText(ctx, state.flavor, abX + abW / 2, dividerY + 24, abW - 60, 19);
  ctx.textAlign = 'left';

  // ===== Footer: stats + set label =====
  const footY = abY + abH + 34;

  // attack badge (bottom-left)
  drawStatBadge(ctx, artX + 26, footY, state.atk, state.atkColor, '⚔');

  // footer center text
  ctx.font = '600 13px Arial';
  ctx.fillStyle = '#8b8d99';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.footer, CARD_W / 2, footY);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  // defense badge (bottom-right)
  drawStatBadge(ctx, artX + artW - 26, footY, state.def, state.defColor, '❤');
}

function drawStatBadge(c, cx, cy, value, color, glyph) {
  const r = 30;
  c.save();
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.fillStyle = '#12131a';
  c.fill();
  c.lineWidth = 3;
  c.strokeStyle = color;
  c.stroke();
  c.fillStyle = color;
  c.font = '700 20px Georgia, serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(String(value), cx, cy + 1);
  c.restore();
}

// ===== Wiring UI to state =====

function bindText(id, key, isNumber) {
  const el = document.getElementById(id);
  el.addEventListener('input', () => {
    state[key] = isNumber ? Number(el.value) : el.value;
    render();
  });
}

bindText('f-name', 'name');
bindText('f-subname', 'subname');
bindText('f-cost', 'cost', true);
bindText('f-title', 'title');
bindText('f-ab1-name', 'ab1Name');
bindText('f-ab1-text', 'ab1Text');
bindText('f-ab2-name', 'ab2Name');
bindText('f-ab2-text', 'ab2Text');
bindText('f-flavor', 'flavor');
bindText('f-atk', 'atk', true);
bindText('f-def', 'def', true);
bindText('f-footer', 'footer');
bindText('f-artx', 'artFocusX', true);
bindText('f-arty', 'artFocusY', true);

document.getElementById('f-rarity').addEventListener('change', (e) => {
  state.rarity = e.target.value;
  render();
});
document.getElementById('f-crown').addEventListener('change', (e) => {
  state.showCrown = e.target.value === '1';
  render();
});
document.getElementById('f-color-frame').addEventListener('input', (e) => {
  state.frameColor = e.target.value;
  render();
});
document.getElementById('f-color-atk').addEventListener('input', (e) => {
  state.atkColor = e.target.value;
  render();
});
document.getElementById('f-color-def').addEventListener('input', (e) => {
  state.defColor = e.target.value;
  render();
});

document.getElementById('f-art').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    state.artImage = img;
    render();
    URL.revokeObjectURL(url);
  };
  img.src = url;
});

// export as PNG at 4x resolution
document.getElementById('btn-export').addEventListener('click', () => {
  const scale = 4; // ~3600x5040, "4K"-ish for a card
  const off = document.createElement('canvas');
  off.width = CARD_W * scale;
  off.height = CARD_H * scale;
  const offCtx = off.getContext('2d');
  offCtx.scale(scale, scale);

  render(offCtx);

  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(state.name || 'card').toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  }, 'image/png');
});

document.getElementById('btn-save').addEventListener('click', () => {
  const data = JSON.stringify(state, (k, v) => (k === 'artImage' ? undefined : v), 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${(state.name || 'card').toLowerCase().replace(/\s+/g, '-')}.json`;
  a.click();
});

document.getElementById('btn-load-trigger').addEventListener('click', () => {
  document.getElementById('f-load').click();
});

document.getElementById('f-load').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      Object.assign(state, data);
      syncFormFromState();
      render();
    } catch (err) {
      alert('Invalid card file.');
    }
  };
  reader.readAsText(file);
});

function syncFormFromState() {
  document.getElementById('f-name').value = state.name;
  document.getElementById('f-subname').value = state.subname;
  document.getElementById('f-cost').value = state.cost;
  document.getElementById('f-rarity').value = state.rarity;
  document.getElementById('f-title').value = state.title;
  document.getElementById('f-crown').value = state.showCrown ? '1' : '0';
  document.getElementById('f-ab1-name').value = state.ab1Name;
  document.getElementById('f-ab1-text').value = state.ab1Text;
  document.getElementById('f-ab2-name').value = state.ab2Name;
  document.getElementById('f-ab2-text').value = state.ab2Text;
  document.getElementById('f-flavor').value = state.flavor;
  document.getElementById('f-atk').value = state.atk;
  document.getElementById('f-def').value = state.def;
  document.getElementById('f-footer').value = state.footer;
  document.getElementById('f-color-frame').value = state.frameColor;
  document.getElementById('f-color-atk').value = state.atkColor;
  document.getElementById('f-color-def').value = state.defColor;
  document.getElementById('f-artx').value = state.artFocusX;
  document.getElementById('f-arty').value = state.artFocusY;
}

render();
