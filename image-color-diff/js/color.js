// Colour maths for "สีตรงกันไหม?" — no DOM access, so it runs in the browser and in Node tests.

// ---------- sRGB <-> CIELAB (D65) ----------

const WHITE = [0.95047, 1.0, 1.08883];
const EPS = 216 / 24389;
const KAPPA = 24389 / 27;

function toLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function fromLinear(v) {
  const s = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, s)) * 255);
}

export function rgbToLab([r, g, b]) {
  const R = toLinear(r), G = toLinear(g), B = toLinear(b);
  const X = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / WHITE[0];
  const Y = (0.2126729 * R + 0.7151522 * G + 0.072175 * B) / WHITE[1];
  const Z = (0.0193339 * R + 0.119192 * G + 0.9503041 * B) / WHITE[2];
  const f = (t) => (t > EPS ? Math.cbrt(t) : (KAPPA * t + 16) / 116);
  const fx = f(X), fy = f(Y), fz = f(Z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function labToRgb([L, a, b]) {
  const fy = (L + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;
  const inv = (t) => (t ** 3 > EPS ? t ** 3 : (116 * t - 16) / KAPPA);
  const X = inv(fx) * WHITE[0];
  const Y = (L > KAPPA * EPS ? fy ** 3 : L / KAPPA) * WHITE[1];
  const Z = inv(fz) * WHITE[2];
  return [
    fromLinear(3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z),
    fromLinear(-0.969266 * X + 1.8760108 * Y + 0.041556 * Z),
    fromLinear(0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z),
  ];
}

export function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

// ---------- CIEDE2000 ----------

const RAD = Math.PI / 180;

export function deltaE2000([L1, a1, b1], [L2, a2, b2]) {
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cb7 = ((C1 + C2) / 2) ** 7;
  const G = 0.5 * (1 - Math.sqrt(Cb7 / (Cb7 + 25 ** 7)));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const hue = (b, ap) => (b === 0 && ap === 0 ? 0 : (Math.atan2(b, ap) / RAD + 360) % 360);
  const h1p = hue(b1, a1p);
  const h2p = hue(b2, a2p);

  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp * RAD) / 2);

  const Lbp = (L1 + L2) / 2;
  const Cbp = (C1p + C2p) / 2;
  let hbp;
  if (C1p * C2p === 0) hbp = h1p + h2p;
  else if (Math.abs(h1p - h2p) <= 180) hbp = (h1p + h2p) / 2;
  else if (h1p + h2p < 360) hbp = (h1p + h2p + 360) / 2;
  else hbp = (h1p + h2p - 360) / 2;

  const T =
    1 -
    0.17 * Math.cos((hbp - 30) * RAD) +
    0.24 * Math.cos(2 * hbp * RAD) +
    0.32 * Math.cos((3 * hbp + 6) * RAD) -
    0.2 * Math.cos((4 * hbp - 63) * RAD);
  const dTheta = 30 * Math.exp(-(((hbp - 275) / 25) ** 2));
  const Cbp7 = Cbp ** 7;
  const RC = 2 * Math.sqrt(Cbp7 / (Cbp7 + 25 ** 7));
  const SL = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2);
  const SC = 1 + 0.045 * Cbp;
  const SH = 1 + 0.015 * Cbp * T;
  const RT = -Math.sin(2 * dTheta * RAD) * RC;

  const l = dLp / SL, c = dCp / SC, h = dHp / SH;
  return Math.sqrt(l * l + c * c + h * h + RT * c * h);
}

// ---------- Similarity in percent ----------

/** ΔE2000 of 0 is 100 %, ΔE of 50 or more is 0 %, linear in between. */
export const ZERO_PERCENT_DELTA_E = 50;

export function similarityPercent(dE) {
  return Math.round(Math.min(100, Math.max(0, 100 * (1 - dE / ZERO_PERCENT_DELTA_E))));
}

export function colorSimilarity(labA, labB) {
  return similarityPercent(deltaE2000(labA, labB));
}

/**
 * Whole-palette similarity: each colour finds its best match in the other palette,
 * weighted by how much of the product it covers, averaged over both directions.
 */
export function paletteSimilarity(pa, pb) {
  if (!pa.length || !pb.length) return 0;
  const oneWay = (p, q) => {
    let sum = 0, weight = 0;
    for (const c of p) {
      let best = 0;
      for (const d of q) best = Math.max(best, 100 * (1 - deltaE2000(c.lab, d.lab) / ZERO_PERCENT_DELTA_E));
      sum += c.share * Math.max(0, best);
      weight += c.share;
    }
    return sum / weight;
  };
  return Math.round((oneWay(pa, pb) + oneWay(pb, pa)) / 2);
}

// ---------- Thai colour names ----------

export function thaiColorName([r, g, b]) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  if (v < 0.18) return 'ดำ';
  if (s < 0.15 || (s < 0.25 && v < 0.35)) return v > 0.85 ? 'ขาว' : v < 0.3 ? 'ดำ' : 'เทา';

  let h;
  const R = r / 255, G = g / 255, B = b / 255;
  if (max === R) h = 60 * (((G - B) / d) % 6);
  else if (max === G) h = 60 * ((B - R) / d + 2);
  else h = 60 * ((R - G) / d + 4);
  if (h < 0) h += 360;

  if (h < 15 || h >= 345) return v > 0.85 && s < 0.5 ? 'ชมพู' : 'แดง';
  if (h < 45) return v < 0.6 ? 'น้ำตาล' : 'ส้ม';
  if (h < 70) return v < 0.5 ? 'น้ำตาล' : 'เหลือง';
  if (h < 165) return 'เขียว';
  if (h < 215) return 'ฟ้า';
  if (h < 255) return v > 0.75 && s < 0.55 ? 'ฟ้า' : 'น้ำเงิน';
  if (h < 290) return 'ม่วง';
  return v < 0.6 ? 'ม่วง' : 'ชมพู';
}

// ---------- Main colours of a photo ----------

/** Centre area used for the product: the middle 60 % of width and height. */
export const CENTRE_MARGIN = 0.2;
const BORDER_BAND = 0.1;
const MERGE_DELTA_E = 6;
const MAX_COLOURS = 3;
const MIN_SHARE = 0.05;

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const dist2 = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;

function nearest(p, centroids) {
  let best = 0, bestD = Infinity;
  for (let c = 0; c < centroids.length; c++) {
    const dd = dist2(p, centroids[c]);
    if (dd < bestD) { bestD = dd; best = c; }
  }
  return [best, bestD];
}

/** Weighted k-means in Lab with a seeded k-means++ start, so the same photo always gives the same answer. */
function kmeans(points, weights, k, iterations = 12) {
  const rand = mulberry32(12345);
  const centroids = [points[Math.floor(rand() * points.length)].slice()];
  const d = new Float64Array(points.length);
  while (centroids.length < k) {
    let total = 0;
    for (let i = 0; i < points.length; i++) {
      d[i] = nearest(points[i], centroids)[1] * weights[i];
      total += d[i];
    }
    if (total === 0) break;
    let r = rand() * total, i = 0;
    while (i < points.length - 1 && (r -= d[i]) > 0) i++;
    centroids.push(points[i].slice());
  }
  const assign = new Int32Array(points.length);
  for (let it = 0; it < iterations; it++) {
    const sums = centroids.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < points.length; i++) {
      const c = nearest(points[i], centroids)[0];
      assign[i] = c;
      const w = weights[i], s = sums[c];
      s[0] += points[i][0] * w; s[1] += points[i][1] * w; s[2] += points[i][2] * w; s[3] += w;
    }
    sums.forEach((s, c) => { if (s[3] > 0) centroids[c] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]]; });
  }
  return { centroids, assign };
}

/**
 * Finds the product's main colours in RGBA pixel data.
 * Uses the centre area (weighted towards the middle), ignores white glare unless the
 * product itself is white, and turns down colours that fill the photo's edges more
 * than its centre (the table or wall behind the product).
 * `region` is the product area in 0..1 photo coordinates; it defaults to the middle 60 %.
 * Returns up to 3 colours, main colour first: { lab, rgb, hex, share, name }.
 */
export const DEFAULT_REGION = Object.freeze({ x: CENTRE_MARGIN, y: CENTRE_MARGIN, w: 1 - 2 * CENTRE_MARGIN, h: 1 - 2 * CENTRE_MARGIN });

export function extractPalette(data, width, height, region = DEFAULT_REGION) {
  const x0 = Math.max(0, Math.floor(width * region.x));
  const x1 = Math.min(width, Math.max(x0 + 1, Math.ceil(width * (region.x + region.w))));
  const y0 = Math.max(0, Math.floor(height * region.y));
  const y1 = Math.min(height, Math.max(y0 + 1, Math.ceil(height * (region.y + region.h))));
  const midX = region.x + region.w / 2, midY = region.y + region.h / 2;
  const sx = 0.25 * (region.w / 0.6), sy = 0.25 * (region.h / 0.6);
  const band = Math.max(1, Math.round(Math.min(width, height) * BORDER_BAND));
  let centre = [], weights = [];
  const border = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 128) continue;
      const inCentre = x >= x0 && x < x1 && y >= y0 && y < y1;
      const inBorder = x < band || y < band || x >= width - band || y >= height - band;
      if (!inCentre && !inBorder) continue;
      const lab = rgbToLab([data[i], data[i + 1], data[i + 2]]);
      if (inBorder) border.push(lab);
      if (inCentre) {
        const dx = (x + 0.5) / width - midX, dy = (y + 0.5) / height - midY;
        centre.push(lab);
        weights.push(Math.exp(-((dx * dx) / (2 * sx * sx) + (dy * dy) / (2 * sy * sy))));
      }
    }
  }
  if (!centre.length) return [];

  // Drop bright, colourless glare, unless most of the centre is like that (a white product).
  const isGlare = (p) => p[0] > 92 && Math.hypot(p[1], p[2]) < 10;
  const glare = centre.filter(isGlare).length;
  if (glare > 0 && glare <= centre.length * 0.5) {
    const keep = centre.map((p) => !isGlare(p));
    weights = weights.filter((_, i) => keep[i]);
    centre = centre.filter((_, i) => keep[i]);
  }

  const k = Math.min(6, centre.length);
  const { centroids, assign } = kmeans(centre, weights, k);
  let clusters = centroids.map((lab) => ({ lab, weight: 0, count: 0 }));
  centre.forEach((p, i) => { clusters[assign[i]].weight += weights[i]; clusters[assign[i]].count++; });
  clusters = clusters.filter((c) => c.count > 0);

  // Merge shades that a person would call the same colour.
  for (let merged = true; merged;) {
    merged = false;
    outer: for (let a = 0; a < clusters.length; a++) {
      for (let b = a + 1; b < clusters.length; b++) {
        if (deltaE2000(clusters[a].lab, clusters[b].lab) < MERGE_DELTA_E) {
          const A = clusters[a], B = clusters[b], w = A.weight + B.weight;
          A.lab = A.lab.map((v, j) => (v * A.weight + B.lab[j] * B.weight) / w);
          A.weight = w;
          A.count += B.count;
          clusters.splice(b, 1);
          merged = true;
          break outer;
        }
      }
    }
  }

  // How much of the photo's edge each colour covers (unmatched edge pixels count for nobody).
  const borderCount = new Array(clusters.length).fill(0);
  const labs = clusters.map((c) => c.lab);
  for (const p of border) {
    const [c, dd] = nearest(p, labs);
    if (dd < 20 * 20) borderCount[c]++;
  }
  const totalWeight = clusters.reduce((s, c) => s + c.weight, 0);
  clusters.forEach((c, i) => {
    const centreShare = c.count / centre.length;
    const borderShare = border.length ? borderCount[i] / border.length : 0;
    const background = Math.max(0, borderShare - centreShare);
    // Walls and tables are usually neutral; packaging is usually colourful.
    const neutralEdge = borderShare > 0.5 && Math.hypot(c.lab[1], c.lab[2]) < 15 ? 0.35 : 1;
    c.score = (c.weight / totalWeight) * (1 - Math.min(0.85, 2 * background)) * neutralEdge;
    c.background = background > 0.1;
  });

  // The main colour always stays; other colours that look like background are left out.
  clusters.sort((a, b) => b.score - a.score);
  const kept = clusters.filter((c, i) => i === 0 || !c.background);
  const totalScore = kept.reduce((s, c) => s + c.score, 0) || 1;
  return kept
    .filter((c, i) => i === 0 || c.score / totalScore >= MIN_SHARE)
    .slice(0, MAX_COLOURS)
    .map((c) => {
      const rgb = labToRgb(c.lab);
      return {
        lab: c.lab.map((v) => Math.round(v * 100) / 100),
        rgb,
        hex: rgbToHex(rgb),
        share: Math.round((c.score / totalScore) * 100) / 100,
        name: thaiColorName(rgb),
      };
    });
}
