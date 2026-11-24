// Draws the result as a PNG for sharing in LINE / Facebook / chat.

const W = 1080;
const PAD = 56;
const ROW = 176;
const MAX_ROWS = 8;
const PLAYER_INK = ['#e0401c', '#0a8f84', '#7a4fd6', '#c27a00', '#d12f7a', '#2f6fd1'];
const FONT = '"Prompt", "Noto Sans Thai", "Leelawadee UI", "Thonburi", sans-serif';

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
  return t + '…';
}

/** Draws one cover-cropped photo with rounded corners. */
function drawThumb(ctx, img, x, y, size) {
  ctx.save();
  roundRect(ctx, x, y, size, size, 22);
  ctx.clip();
  ctx.fillStyle = '#eee';
  ctx.fillRect(x, y, size, size);
  if (img) {
    const s = Math.min(img.width, img.height);
    ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, x, y, size, size);
  }
  ctx.restore();
}

export async function buildShareImage({ pairs, threshold, players, itemName }) {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const matched = pairs.filter((p) => p.main >= threshold);
  const shown = (matched.length ? matched : pairs.slice(0, 3)).slice(0, MAX_ROWS);
  const extra = (matched.length ? matched.length : 0) - shown.length;

  const imgs = new Map();
  await Promise.all(
    shown.flatMap((p) => [p.a.item, p.b.item]).map(async (item) => {
      if (!imgs.has(item.id)) imgs.set(item.id, await loadImage(item.thumb));
    }),
  );

  const headerH = 250;
  const footerH = 110 + (extra > 0 ? 40 : 0);
  const H = headerH + shown.length * ROW + footerH;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // background + header
  ctx.fillStyle = '#fff7ec';
  ctx.fillRect(0, 0, W, H);
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, '#ff5a36');
  grad.addColorStop(1, '#ff9a3c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 200);
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `800 72px ${FONT}`;
  ctx.fillText('สีตรงกันไหม?', PAD, 110);
  ctx.font = `400 34px ${FONT}`;
  ctx.fillText(
    matched.length ? `ตรงกัน ${matched.length} คู่ · เกณฑ์ ${threshold}% ขึ้นไป` : `ยังไม่มีคู่ที่ถึง ${threshold}% · คู่ที่ใกล้ที่สุด`,
    PAD, 165,
  );

  // rows
  const thumb = 120;
  let y = headerH - 20;
  for (const pair of shown) {
    const match = pair.main >= threshold;
    ctx.fillStyle = match ? '#e3f8ea' : '#ffffff';
    roundRect(ctx, PAD - 16, y, W - 2 * (PAD - 16), ROW - 20, 28);
    ctx.fill();
    const cy = y + (ROW - 20) / 2;

    const sides = [
      { s: pair.a, x: PAD, align: 'left' },
      { s: pair.b, x: W - PAD - thumb, align: 'right' },
    ];
    for (const { s, x, align } of sides) {
      drawThumb(ctx, imgs.get(s.item.id), x, cy - thumb / 2, thumb);
      const c = s.item.palette[0];
      ctx.beginPath();
      ctx.arc(align === 'left' ? x + thumb - 8 : x + 8, cy + thumb / 2 - 8, 22, 0, Math.PI * 2);
      ctx.fillStyle = c.hex;
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      const tx = align === 'left' ? x + thumb + 26 : x - 26;
      ctx.textAlign = align;
      ctx.fillStyle = PLAYER_INK[s.pi % PLAYER_INK.length];
      ctx.font = `600 34px ${FONT}`;
      ctx.fillText(fitText(ctx, players[s.pi].name, 230), tx, cy - 6);
      ctx.fillStyle = '#5b5560';
      ctx.font = `400 26px ${FONT}`;
      ctx.fillText(fitText(ctx, `${itemName(s.item, s.slot)} · ${c.name}`, 230), tx, cy + 34);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = match ? '#14874a' : '#2a2530';
    ctx.font = `800 64px ${FONT}`;
    ctx.fillText(`${pair.main}%`, W / 2, cy + 14);
    ctx.fillStyle = '#7a7480';
    ctx.font = `400 24px ${FONT}`;
    ctx.fillText(`ชุดสี ${pair.set}%`, W / 2, cy + 50);
    ctx.textAlign = 'left';
    y += ROW;
  }

  ctx.fillStyle = '#7a7480';
  ctx.font = `400 28px ${FONT}`;
  ctx.textAlign = 'center';
  if (extra > 0) {
    ctx.fillText(`และอีก ${extra} คู่ที่ตรงกัน`, W / 2, y + 30);
    y += 40;
  }
  ctx.fillText('เทียบสีด้วย ΔE2000 · sumet-funan.github.io/home/image-color-diff', W / 2, y + 60);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'),
  );
}
