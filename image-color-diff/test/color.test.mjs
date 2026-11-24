// Run with: node --test image-color-diff/test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  rgbToLab, labToRgb, deltaE2000, similarityPercent, paletteSimilarity,
  thaiColorName, extractPalette,
} from '../js/color.js';

// G. Sharma, W. Wu, E. N. Dalal (2005), "The CIEDE2000 color-difference formula:
// implementation notes, supplementary test data, and mathematical observations", Table 1.
const SHARMA = [
  [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
  [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615],
  [[50, 2.8361, -74.02], [50, 0, -82.7485], 3.4412],
  [[50, -1.3802, -84.2814], [50, 0, -82.7485], 1.0],
  [[50, -1.1848, -84.8006], [50, 0, -82.7485], 1.0],
  [[50, -0.9009, -85.5211], [50, 0, -82.7485], 1.0],
  [[50, 0, 0], [50, -1, 2], 2.3669],
  [[50, -1, 2], [50, 0, 0], 2.3669],
  [[50, 2.49, -0.001], [50, -2.49, 0.0009], 7.1792],
  [[50, 2.49, -0.001], [50, -2.49, 0.001], 7.1792],
  [[50, 2.49, -0.001], [50, -2.49, 0.0011], 7.2195],
  [[50, 2.49, -0.001], [50, -2.49, 0.0012], 7.2195],
  [[50, -0.001, 2.49], [50, 0.0009, -2.49], 4.8045],
  [[50, -0.001, 2.49], [50, 0.001, -2.49], 4.8045],
  [[50, -0.001, 2.49], [50, 0.0011, -2.49], 4.7461],
  [[50, 2.5, 0], [50, 0, -2.5], 4.3065],
  [[50, 2.5, 0], [73, 25, -18], 27.1492],
  [[50, 2.5, 0], [61, -5, 29], 22.8977],
  [[50, 2.5, 0], [56, -27, -3], 31.903],
  [[50, 2.5, 0], [58, 24, 15], 19.4535],
  [[50, 2.5, 0], [50, 3.1736, 0.5854], 1.0],
  [[50, 2.5, 0], [50, 3.2972, 0], 1.0],
  [[50, 2.5, 0], [50, 1.8634, 0.5757], 1.0],
  [[50, 2.5, 0], [50, 3.2592, 0.335], 1.0],
  [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
  [[63.0109, -31.0961, -5.8663], [62.8187, -29.7946, -4.0864], 1.263],
  [[61.2901, 3.7196, -5.3901], [61.4292, 2.248, -4.962], 1.8731],
  [[35.0831, -44.1164, 3.7933], [35.0232, -40.0716, 1.5901], 1.8645],
  [[22.7233, 20.0904, -46.694], [23.0331, 14.973, -42.5619], 2.0373],
  [[36.4612, 47.858, 18.3852], [36.2715, 50.5065, 21.2231], 1.4146],
  [[90.8027, -2.0831, 1.441], [91.1528, -1.6435, 0.0447], 1.4441],
  [[90.9257, -0.5406, -0.9208], [88.6381, -0.8985, -0.7239], 1.5381],
  [[6.7747, -0.2908, -2.4247], [5.8714, -0.0985, -2.2286], 0.6377],
  [[2.0776, 0.0795, -1.135], [0.9033, -0.0636, -0.5514], 0.9082],
];

test('ΔE2000 matches all 34 Sharma reference pairs', () => {
  SHARMA.forEach(([a, b, expected], i) => {
    const got = deltaE2000(a, b);
    assert.ok(Math.abs(got - expected) < 1e-4, `pair ${i + 1}: got ${got.toFixed(4)}, expected ${expected}`);
    assert.ok(Math.abs(deltaE2000(b, a) - expected) < 1e-4, `pair ${i + 1} reversed`);
  });
});

test('sRGB to Lab uses D65 and round-trips', () => {
  const close = (got, want) => got.forEach((v, i) => assert.ok(Math.abs(v - want[i]) < 0.01, `${got} vs ${want}`));
  close(rgbToLab([255, 255, 255]), [100, 0, 0]);
  close(rgbToLab([0, 0, 0]), [0, 0, 0]);
  close(rgbToLab([255, 0, 0]), [53.2408, 80.0925, 67.2032]);
  close(rgbToLab([0, 0, 255]), [32.297, 79.1875, -107.8602]);
  for (const rgb of [[255, 0, 0], [12, 200, 77], [128, 128, 128], [250, 240, 10], [3, 2, 1]]) {
    assert.deepEqual(labToRgb(rgbToLab(rgb)), rgb);
  }
});

test('percent: ΔE 0 is 100 %, ΔE 50 or more is 0 %, linear in between', () => {
  assert.equal(similarityPercent(0), 100);
  assert.equal(similarityPercent(10), 80);
  assert.equal(similarityPercent(25), 50);
  assert.equal(similarityPercent(50), 0);
  assert.equal(similarityPercent(80), 0);
  assert.equal(similarityPercent(4.4), 91);
});

test('palette similarity is symmetric and 100 % for identical palettes', () => {
  const red = { lab: rgbToLab([220, 20, 30]), share: 0.7 };
  const yellow = { lab: rgbToLab([250, 210, 0]), share: 0.3 };
  const blue = { lab: rgbToLab([20, 40, 200]), share: 1 };
  assert.equal(paletteSimilarity([red, yellow], [red, yellow]), 100);
  assert.equal(paletteSimilarity([red, yellow], [blue]), paletteSimilarity([blue], [red, yellow]));
  assert.ok(paletteSimilarity([red, yellow], [blue]) < 40);
});

test('Thai colour names', () => {
  const cases = {
    แดง: [[230, 20, 30], [180, 0, 0]],
    ส้ม: [[255, 140, 0], [255, 165, 0]],
    เหลือง: [[255, 215, 0], [250, 240, 30]],
    เขียว: [[0, 160, 60], [120, 200, 40]],
    ฟ้า: [[135, 206, 235], [0, 180, 220]],
    น้ำเงิน: [[0, 0, 255], [20, 40, 140]],
    ม่วง: [[128, 0, 128], [120, 60, 200]],
    ชมพู: [[255, 105, 180], [255, 160, 160]],
    น้ำตาล: [[139, 69, 19], [110, 80, 40]],
    ดำ: [[10, 10, 10], [40, 30, 35]],
    เทา: [[128, 128, 128], [170, 172, 175]],
    ขาว: [[255, 255, 255], [240, 238, 232]],
  };
  for (const [name, rgbs] of Object.entries(cases)) {
    for (const rgb of rgbs) assert.equal(thaiColorName(rgb), name, `rgb(${rgb})`);
  }
});

// ---------- extractPalette on synthetic photos ----------

/** Paints a w×h RGBA image: background colour, then rectangles given in 0..1 coordinates. */
function paint(w, h, bg, rects = [], noise = 0) {
  const data = new Uint8ClampedArray(w * h * 4);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 2 * noise;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let c = bg;
      for (const [rx0, ry0, rx1, ry1, rc] of rects) {
        if (x / w >= rx0 && x / w < rx1 && y / h >= ry0 && y / h < ry1) c = rc;
      }
      const i = (y * w + x) * 4;
      data[i] = c[0] + rnd(); data[i + 1] = c[1] + rnd(); data[i + 2] = c[2] + rnd(); data[i + 3] = 255;
    }
  }
  return data;
}

const RED = [210, 25, 35], YELLOW = [250, 205, 20], WOOD = [150, 110, 70], GREY_WALL = [200, 200, 195];

test('product on a table: the product colour wins, not the table', () => {
  const data = paint(120, 90, WOOD, [[0.3, 0.2, 0.7, 0.8, RED]], 8);
  const pal = extractPalette(data, 120, 90);
  assert.equal(pal[0].name, 'แดง');
  assert.ok(deltaE2000(pal[0].lab, rgbToLab(RED)) < 5);
});

test('small product in the middle still beats the background', () => {
  const data = paint(120, 120, GREY_WALL, [[0.38, 0.38, 0.62, 0.62, RED]], 6);
  const pal = extractPalette(data, 120, 120);
  assert.equal(pal[0].name, 'แดง');
  assert.ok(!pal.some((c) => c.name === 'เทา'), 'the wall is not listed as a product colour');
});

test('close-up that fills the photo: packaging colour wins over the logo', () => {
  const data = paint(120, 160, RED, [[0.35, 0.4, 0.65, 0.6, YELLOW]], 8);
  const pal = extractPalette(data, 120, 160);
  assert.equal(pal[0].name, 'แดง');
  assert.ok(pal.some((c) => c.name === 'เหลือง'), 'logo colour is listed second');
});

test('white glare is ignored, but a white product stays white', () => {
  const glare = paint(100, 100, WOOD, [[0.25, 0.25, 0.75, 0.75, RED], [0.45, 0.3, 0.55, 0.7, [255, 255, 255]]]);
  const pal = extractPalette(glare, 100, 100);
  assert.equal(pal[0].name, 'แดง');
  assert.ok(!pal.some((c) => c.name === 'ขาว'));

  const milk = paint(100, 100, WOOD, [[0.2, 0.15, 0.8, 0.85, [250, 250, 250]]]);
  assert.equal(extractPalette(milk, 100, 100)[0].name, 'ขาว');
});

test('palette is deterministic, at most 3 colours, main first', () => {
  const data = paint(80, 80, WOOD, [[0.2, 0.2, 0.8, 0.8, RED], [0.4, 0.45, 0.6, 0.55, YELLOW]], 10);
  const a = extractPalette(data, 80, 80);
  const b = extractPalette(data, 80, 80);
  assert.deepEqual(a, b);
  assert.ok(a.length >= 1 && a.length <= 3);
  for (let i = 1; i < a.length; i++) assert.ok(a[i - 1].share >= a[i].share);
});
