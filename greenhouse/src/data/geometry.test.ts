/**
 * ตรวจเรขาคณิตกับสเปก — ถ้า test ไม่ผ่าน แปลว่าตัวเลขใน spec.ts ขัดกันเอง หรืออ่านสเปกผิด
 * เกณฑ์: รูบนชิ้นที่ต่อกันต้องตรงกันภายใน ±1 มม.
 * ค่าที่สเปกปัดเศษ (เช่น "26 ซม." "1.31 ม.") ใช้เกณฑ์ roundTol ใน spec.ts
 */
import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { ASSUMED, DECISIONS, SPEC } from './spec';
import {
  D,
  DOOR,
  FLOOR,
  GABLE,
  JOINTS,
  LAYOUT_POINTS,
  MARKERS,
  MEMBERS,
  MEMBER_BY_ID,
  PITS,
  RIDGE_TUBE,
  ROPES,
  SHAPES,
  SHEETS,
  boltCounts,
  holeWorld,
  jointWorld,
  type V2,
} from './geometry';
import { CAMERAS, PHASES, SCENE_TAGS, STEPS, finalState } from './steps';

const TOL = 1;
const dist2 = (a: V2, b: V2) => Math.hypot(a[0] - b[0], a[1] - b[1]);

describe('ขนาดหลักของโครง', () => {
  it('หลังคาชัน 33.7°', () => {
    expect(Math.abs(D.thetaDeg - SPEC.layout.check.roofPitchDeg)).toBeLessThan(0.05);
  });
  it('ยอดสัน (แนวกึ่งกลางจันทัน) สูง 2,500 อยู่กึ่งกลางกว้าง', () => {
    const apex = [D.HALF, D.H + D.slopeLen * Math.sin(D.theta)];
    expect(Math.abs(apex[1] - SPEC.layout.ridgeHeight)).toBeLessThan(TOL);
  });
  it('จันทันยาวข้างละประมาณ 1.8 ม.', () => {
    expect(Math.abs(D.slopeLen - SPEC.layout.check.rafterNominal)).toBeLessThan(5);
  });
  it('จันทัน: ขอบบน 1,795 · ขอบล่าง 1,761 · ตัดดิ่ง 56°', () => {
    expect(Math.abs(D.rafterTopLen - SPEC.rafter.lengthTop)).toBeLessThan(TOL);
    expect(Math.abs(D.rafterBottomLen - SPEC.rafter.lengthBottom)).toBeLessThan(TOL);
    expect(Math.abs(D.plumbCutDeg - SPEC.rafter.plumbCutDeg)).toBeLessThan(0.5);
  });
  it('ปลายตัดตรงของจันทันไม่ชนปลายบนเสา', () => {
    // มุมล่างของปลายจันทัน ต้องอยู่นอกเสา (u > ผิวในเสา) หรือสูงกว่าปลายเสา
    const [p0, , , p3] = SHAPES.rafter; // ล่าง-ปลายตัดตรง, บน-ปลายตัดตรง
    const corners = [p0, p3];
    for (const c of corners) {
      const insidePostU = c[0] > -SPEC.section.rect.wide / 2 && c[0] < SPEC.section.rect.wide / 2;
      if (insidePostU) expect(c[1]).toBeGreaterThanOrEqual(D.H - 0.01);
    }
    // เช็กขอบปลายตัดตรงที่ผิวในเสา (u = 25)
    const t = (25 - p0[0]) / (p3[0] - p0[0]);
    const yAtFace = p0[1] + t * (p3[1] - p0[1]);
    expect(yAtFace).toBeGreaterThan(D.H);
  });
  it('เส้นทแยงผัง A–E และ B–D = 6.71 ม.', () => {
    const { A, B, D: Dp, E } = LAYOUT_POINTS;
    const ae = Math.hypot(E[0] - A[0], E[2] - A[2]);
    const bd = Math.hypot(Dp[0] - B[0], Dp[2] - B[2]);
    expect(Math.abs(ae - bd)).toBeLessThan(TOL);
    expect(Math.abs(ae - SPEC.layout.check.diagonal)).toBeLessThan(SPEC.layout.check.diagonalTol);
  });
  it('สามเหลี่ยม 3-4-5 ได้ B–C = 5.00 ม.', () => {
    const { B, C } = LAYOUT_POINTS;
    expect(Math.abs(Math.hypot(C[0] - B[0], C[2] - B[2]) - SPEC.site.triangle.c)).toBeLessThan(TOL);
  });
});

describe('รูบนเสาและจันทัน ตรงกับระยะที่สเปกบอก', () => {
  it('รู 558 → กึ่งกลางท่อล่างสูง 26 ซม. · รู 1,588 → ท่อไหล่ 1.29 ม.', () => {
    const t = SPEC.post.check.roundTol;
    expect(Math.abs(D.lowTubeY - SPEC.post.check.lowTubeAboveRef)).toBeLessThan(t);
    expect(Math.abs(D.shoulderTubeY - SPEC.post.check.shoulderTubeAboveRef)).toBeLessThan(t);
  });
  it('รูเยื้องห่างผิวนอก 37.5 = เยื้องจากกึ่งกลางเข้าด้านใน 12.5', () => {
    const h = D.postHole('lowTube');
    expect(h[0]).toBeCloseTo(12.5, 6);
    const r = D.rafterHole('purlin');
    const plain = D.rafterHole('tie');
    // รูแปอยู่ใต้แนวกึ่งกลาง 12.5 มม. (ตั้งฉากกับจันทัน)
    const n = (r[0] - plain[0]) * -Math.sin(D.theta) + (r[1] - plain[1]) * Math.cos(D.theta);
    expect(n).toBeCloseTo(-12.5, 6);
  });
  it('รู 876 ของจันทัน → คานรัดสูง 2.0 ม. ระยะรูสองฝั่ง ~1.5 ม.', () => {
    expect(Math.abs(D.tieY - SPEC.layout.check.tieHeight)).toBeLessThan(TOL);
    const [n, s] = SHAPES.tieHoles;
    expect(Math.abs(dist2(n, s) - SPEC.layout.check.tieLengthNominal)).toBeLessThan(5);
  });
  it('คานรัดยาว 1,550 รู 25 — รูปลายที่สองยังห่างปลายพอ (≥ 1.5 เท่าของรู)', () => {
    const [n, s] = SHAPES.tieHoles;
    const farEnd = SHAPES.tieU0 + SPEC.tieBeam.length;
    expect(n[0] - SHAPES.tieU0).toBeCloseTo(SPEC.tieBeam.holeFromEnd, 6);
    expect(farEnd - s[0]).toBeGreaterThanOrEqual(1.5 * SPEC.section.holeDia);
  });
  it('ค้ำมุมไหล่: รู 1,300 เสา → รู 576 จันทัน ห่างกันประมาณ 971', () => {
    expect(Math.abs(SHAPES.braceHoleSpacing - SPEC.cornerBrace.check.holeSpacing)).toBeLessThan(TOL);
    expect(SPEC.cornerBrace.length - SPEC.cornerBrace.holeFromEnd - SHAPES.braceHoleSpacing).toBeGreaterThanOrEqual(1.5 * SPEC.section.holeDia);
  });
  it('รู 1,282 → กึ่งกลางแปห่างจุดมุมไหล่ 1.31 ม. ตามแนวจันทัน', () => {
    expect(Math.abs(D.purlinS - SPEC.rafter.check.purlinFromShoulder)).toBeLessThan(SPEC.rafter.check.roundTol);
  });
});

describe('ท่อแนวยาวและท่อสัน', () => {
  it('ท่อแนวยาว 1,470 สั้นกว่าช่องจริง 5 มม. และเหลือที่ให้ขาฉาก L', () => {
    const clear = SPEC.layout.bay - SPEC.section.rect.narrow;
    expect(clear - SPEC.longTube.length).toBeCloseTo(SPEC.longTube.fitClearance, 6);
    expect(D.longTubeGap).toBeGreaterThanOrEqual(SPEC.lAngle.t);
  });
  it('ฉาก L: รูบนขาที่ทาบเสาห่างรอยพับ 12.5 ตรงรูเยื้องของเสา', () => {
    // รอยพับอยู่ที่ผิวในของท่อ = กึ่งกลางเสา (u = 0) รูเสาอยู่ที่ u = 12.5
    expect(D.postHole('shoulderTube')[0] - 0).toBeCloseTo(SPEC.lAngle.holeFromFold, 6);
  });
  it('ท่อสันยาว 6,000 และรูตรงฉากสันทุกโครง (โครง 5 ฉากอยู่ด้านตะวันออก)', () => {
    SPEC.ridgeTube.holes.forEach((_, i) => {
      const a = holeWorld('ridgeTube', i).at;
      const b = holeWorld(`f${i + 1}.bracket.flat`, 0).at;
      expect(Math.hypot(a[0] - b[0], a[2] - b[2])).toBeLessThan(TOL);
    });
  });
  it('ถ้าติดฉากสันโครง 5 ผิดด้าน รูจะคลาดไปประมาณ 8 ซม.', () => {
    const wrong = D.frameX(5) + D.bracketFlatHoleA;
    const right = RIDGE_TUBE.x0 + SPEC.ridgeTube.holes[4];
    expect(Math.abs(wrong - right)).toBeGreaterThan(75);
    expect(Math.abs(wrong - right)).toBeLessThan(90);
  });
  it('ฉากสัน: รู 2 รูห่าง 66 ตรงรู 1,738 ทั้งสองเส้น และรอยพับระดับเดียวกับยอดจันทัน', () => {
    const hN = D.rafterHole('ridgeHigh');
    const [bN, bS] = SHAPES.bracketHoles;
    expect(dist2(bN, hN)).toBeLessThan(TOL);
    expect(dist2(bS, [D.W - hN[0], hN[1]])).toBeLessThan(TOL);
    expect(Math.abs(D.foldY - D.apexTopY)).toBeLessThan(TOL);
  });
  it('ขานอนฉากสัน: รูห่างผิวหลังขาตั้ง 26.5 อยู่ในขาลึก 40', () => {
    const r = SPEC.section.holeDia / 2;
    expect(SPEC.ridgeBracket.flatHoleFromBack + r).toBeLessThan(DECISIONS.ridgeBracketFlat.depth);
  });
});

describe('แผ่นประกับ', () => {
  const bbox = (ps: V2[]) => {
    const us = ps.map((p) => p[0]);
    const ys = ps.map((p) => p[1]);
    return { w: Math.max(...us) - Math.min(...us), h: Math.max(...ys) - Math.min(...ys), u0: Math.min(...us) };
  };
  const edgeDist = (poly: V2[], p: V2) => {
    let best = Infinity;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const ab: V2 = [b[0] - a[0], b[1] - a[1]];
      const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / (ab[0] ** 2 + ab[1] ** 2)));
      best = Math.min(best, dist2(p, [a[0] + t * ab[0], a[1] + t * ab[1]]));
    }
    return best;
  };
  const inside = (poly: V2[], p: V2) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i];
      const [xj, yj] = poly[j];
      if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const minEdge = 1.5 * SPEC.section.holeDia;

  it('แผ่นประกับมุมไหล่ 175×237 ขอบตรงเสมอผิวนอกเสา', () => {
    const b = bbox(SHAPES.shoulderPlate);
    expect(Math.abs(b.w - SPEC.shoulderPlate.width)).toBeLessThan(TOL);
    expect(Math.abs(b.h - SPEC.shoulderPlate.height)).toBeLessThan(TOL);
    expect(b.u0).toBeCloseTo(-SPEC.section.rect.wide / 2, 6);
  });
  it('แผ่นประกับมุมไหล่: รู 4 รูตรงรู 1,700/1,760 ของเสา และ 40/100 ของจันทัน อยู่ในแผ่นห่างขอบพอ', () => {
    const want = [D.postHole('plateLow'), D.postHole('plateHigh'), D.rafterHole('plateLow'), D.rafterHole('plateHigh')];
    SHAPES.shoulderPlateHoles.forEach((h, i) => {
      expect(dist2(h, want[i])).toBeLessThan(TOL);
      expect(inside(SHAPES.shoulderPlate, h)).toBe(true);
      expect(edgeDist(SHAPES.shoulderPlate, h)).toBeGreaterThanOrEqual(minEdge);
    });
  });
  it('แผ่นประกับสัน 239×121 รูห่างขอบพอ', () => {
    const b = bbox(SHAPES.ridgePlate);
    expect(Math.abs(b.w - SPEC.ridgePlate.width)).toBeLessThan(TOL);
    expect(Math.abs(b.h - SPEC.ridgePlate.height)).toBeLessThan(TOL);
    for (const h of SHAPES.ridgePlateHoles) {
      expect(inside(SHAPES.ridgePlate, h)).toBe(true);
      expect(edgeDist(SHAPES.ridgePlate, h)).toBeGreaterThanOrEqual(minEdge);
    }
  });
  it('แผ่นประกับไม่โผล่เหนือผิวบนจันทัน (พลาสติกไม่เกี่ยว)', () => {
    for (const p of SHAPES.shoulderPlate) if (p[0] > 0) expect(p[1]).toBeLessThanOrEqual(D.roofTopY(p[0]) + 0.01);
    for (const p of SHAPES.ridgePlate) expect(p[1]).toBeLessThanOrEqual(D.apexTopY - Math.abs(p[0] - D.HALF) * Math.tan(D.theta) + 0.01);
  });
  it('ฉากท่อไหล่อยู่ต่ำกว่าแผ่นประกับมุมไหล่', () => {
    const plateBottom = Math.min(...SHAPES.shoulderPlate.map((p) => p[1]));
    expect(D.shoulderTubeY + ASSUMED.lAngleWidth / 2).toBeLessThan(plateBottom);
  });
});

describe('น็อตทุกตัว: รูทุกชิ้นที่น็อตผ่านตรงกัน ±1 มม.', () => {
  it('มีน็อตครบทุกจุด', () => {
    expect(JOINTS.length).toBeGreaterThan(100);
  });
  for (const j of JOINTS) {
    it(j.id, () => {
      const { at, axis } = jointWorld(j);
      const A = new Vector3(...axis).normalize();
      expect(j.holes.length).toBeGreaterThan(0);
      for (const h of j.holes) {
        const hw = holeWorld(h.member, h.index);
        const d = new Vector3(...hw.at).sub(new Vector3(...at));
        const perp = d.clone().sub(A.clone().multiplyScalar(d.dot(A))).length();
        expect(perp, `${h.member}#${h.index}`).toBeLessThan(TOL);
        // แกนรูต้องขนานกับแกนน็อต
        expect(Math.abs(Math.abs(new Vector3(...hw.axis).normalize().dot(A)) - 1)).toBeLessThan(1e-6);
      }
    });
  }
  it('ความยาวน็อตพอ: ความหนาที่หนีบ + แหวน 2 + ตัวเมีย ≤ ความยาวน็อต', () => {
    const b = ASSUMED.bolt;
    for (const j of JOINTS) {
      const len = j.bolt.startsWith('M8x70') ? SPEC.bolts.long : SPEC.bolts.short;
      expect(j.grip + 2 * b.washerT + b.nutHeight, j.id).toBeLessThanOrEqual(len);
    }
  });
  it('M8×70 ใช้เฉพาะจุดที่วางทับกันแล้วเจาะทะลุ (คานรัด ค้ำมุม เสาหน้าจั่ว)', () => {
    for (const j of JOINTS.filter((x) => x.bolt.startsWith('M8x70'))) {
      expect(j.id).toMatch(/\.j\.tie\.|\.j\.brace\.|^j\.gable\./);
    }
  });
  it('แผ่นประกับและค้ำมุมใช้เกรด 8.8 ทุกตัว', () => {
    for (const j of JOINTS) {
      if (/splate|rplate|\.j\.brace\./.test(j.id)) expect(j.bolt.endsWith('8.8'), j.id).toBe(true);
    }
  });
  it('จำนวนน็อตที่ใช้จริงไม่เกินจำนวนที่ให้ซื้อ', () => {
    const c = boltCounts();
    const b = SPEC.bolts.bought;
    expect(c['M8x50-8.8']).toBeLessThanOrEqual(b.m8x50_88);
    expect(c.M8x50).toBeLessThanOrEqual(b.m8x50);
    expect(c.M8x70).toBeLessThanOrEqual(b.m8x70);
    expect(c['M8x70-8.8']).toBeLessThanOrEqual(b.m8x70_88);
    const total = Object.values(c).reduce((a, x) => a + x, 0);
    expect(total * 2).toBeLessThanOrEqual(b.washers);
  });
  it('น็อตขวางก้นเสา 14 ตัว', () => {
    expect(JOINTS.filter((j) => /anchor|Anchor/.test(j.id)).length).toBe(14);
  });
});

describe('จำนวนชิ้นตรงกับตารางแบบสั่งตัด', () => {
  const pieces = (part: string) => new Set(MEMBERS.filter((m) => m.part === part).map((m) => m.piece)).size;
  const cases: [string, number][] = [
    ['post', SPEC.post.count],
    ['rafter', SPEC.rafter.count],
    ['gablePost', SPEC.gablePost.count],
    ['tieBeam', SPEC.tieBeam.count],
    ['cornerBrace', SPEC.cornerBrace.count],
    ['longTube', SPEC.longTube.count],
    ['ridgeTube', SPEC.ridgeTube.count],
    ['shoulderPlate', SPEC.shoulderPlate.count],
    ['ridgePlate', SPEC.ridgePlate.count],
    ['ridgeBracket', SPEC.ridgeBracket.count],
    ['wallBrace', SPEC.wallBrace.count],
    ['door', SPEC.door.verticals + SPEC.door.horizontals],
  ];
  for (const [part, n] of cases) it(`${part} = ${n}`, () => expect(pieces(part)).toBe(n));
  it('ฉาก L ใช้ 48 + 6 ไม่เกินที่ซื้อ 60', () => {
    const n = pieces('lAngle');
    expect(n).toBe(54);
    expect(n).toBeLessThanOrEqual(SPEC.lAngle.bought);
  });
});

describe('เสาหน้าจั่วและประตู', () => {
  it('เสาหน้าจั่ว 2,325: ปลายบนเลยคานรัด 2 ซม. ต่ำกว่าจันทัน ฝังราว 30 ซม.', () => {
    expect(GABLE.topY - (D.tieY + SPEC.section.square.size / 2)).toBeCloseTo(SPEC.gablePost.aboveTie, 6);
    for (const u of SPEC.gablePost.fromNorth) {
      const uu = Math.min(u, D.W - u);
      expect(GABLE.topY).toBeLessThan(D.rafterBottomY(uu));
    }
    expect(Math.abs(-GABLE.bottomY - SPEC.gablePost.check.embedApprox)).toBeLessThan(SPEC.gablePost.check.embedTol);
  });
  it('ช่องประตูระหว่างเสาหน้าจั่วกว้าง 0.9 ม. บาน + ช่อง 10 มม. สองข้างพอดี', () => {
    expect(DOOR.openU1 - DOOR.openU0).toBeCloseTo(SPEC.door.clearWidth, 6);
    expect(DOOR.leafW + 2 * SPEC.door.gap).toBeCloseTo(SPEC.door.clearWidth, 6);
  });
  it('บานประตูไม่ครูดพื้น', () => {
    for (const z of [-DOOR.openU0, -DOOR.openU1]) {
      expect(DOOR.bottom).toBeGreaterThan(PITS[0] ? Math.max(0, ...PITS.filter((p) => p.gable && p.x === DOOR.xF && Math.abs(p.z - z) < 60).map((p) => p.ground)) : 0);
    }
  });
  it('บานประตู 1,940 อยู่ในช่วง "ช่องจริง − 30" ± 20 มม. เมื่อดินอยู่ที่ระดับอ้างอิง', () => {
    const opening = D.tieY - SPEC.section.square.size / 2;
    expect(Math.abs(opening - SPEC.door.shorterThanOpening - DECISIONS.doorVertical)).toBeLessThan(20);
  });
});

describe('ฐานรากและพื้นดิน', () => {
  it('ดินต่างกันไม่เกิน 15 ซม. (ใช้วิธีฝังลึกไม่เท่ากันได้)', () => {
    const gs = PITS.map((p) => p.ground);
    expect(Math.min(...gs)).toBeCloseTo(0, 6);
    expect(Math.max(...gs) - Math.min(...gs)).toBeLessThanOrEqual(SPEC.footing.maxGroundDiff);
  });
  it('ทุกหลุม: ก้นเสาอยู่เหนือคอนกรีตรองก้น (มีที่ให้รองอิฐ) และฝังอย่างน้อย 30 ซม.', () => {
    for (const p of PITS) {
      const padTop = p.ground - p.depth + SPEC.footing.pad;
      expect(p.postBottomY, p.label).toBeGreaterThanOrEqual(padTop);
      expect(p.ground - p.postBottomY, p.label).toBeGreaterThanOrEqual(SPEC.post.embedMin - SPEC.gablePost.check.embedTol);
    }
  });
});

describe('ค้ำยันผนัง', () => {
  it('ปลายค้ำยันห่างผิวเสาอย่างน้อย 10 ซม.', () => {
    for (const m of MEMBERS.filter((x) => x.part === 'wallBrace')) {
      if (m.kind !== 'box') throw new Error();
      const b = m.boxes[0];
      const half = b.size[0] / 2;
      const dirX = Math.cos(b.rot[2]) * Math.cos(b.rot[1]);
      const ends = [b.center[0] - dirX * half, b.center[0] + dirX * half];
      for (const x of ends) {
        const nearest = Math.min(...[1, 2, 3, 4, 5].map((f) => Math.abs(x - D.frameX(f)) - SPEC.section.rect.narrow / 2));
        expect(nearest).toBeGreaterThanOrEqual(SPEC.wallBrace.minFromPost - SPEC.section.square.size);
      }
    }
  });
});

describe('พื้นและชั้นวาง', () => {
  it('แถวรวมได้ 3.00 ม. และทางเดิน 1.05–1.65 ม. ตรงช่องประตู', () => {
    expect(FLOOR.totalRows).toBe(SPEC.layout.width);
    expect(FLOOR.walk[0].u0).toBe(1050);
    expect(FLOOR.walk[0].u1).toBe(1650);
    expect(Math.abs(FLOOR.walk[0].u0 - DOOR.openU0)).toBeLessThan(5);
  });
  it('สตั๊ก 15 จุด สมมาตรหัวท้าย', () => {
    expect(FLOOR.stacks.length).toBe(15);
    const last = FLOOR.stackX[FLOOR.stackX.length - 1];
    expect(D.frameX(5) - last).toBeCloseTo(SPEC.floor.stacks.firstFromFrame1, 6);
  });
  it('คานชั้นวาง 6 เส้น ยาว 5.50 ปลายห่างโครง 1 และ 5 ด้านละ 25 ซม.', () => {
    expect(FLOOR.beams.length).toBe(6);
    for (const b of FLOOR.beams) expect(b.x1 - b.x0).toBe(SPEC.floor.beam.length);
  });
  it('กล่องโฟม 27 กล่อง วางอยู่ในช่วงคาน และคานวางบนบล็อก 39 ซม. ได้', () => {
    expect(FLOOR.foam.length).toBe(27);
    const fb = SPEC.floor.foamBox;
    const x0 = Math.min(...FLOOR.foam.map((f) => f.x)) - fb.length / 2;
    const x1 = Math.max(...FLOOR.foam.map((f) => f.x)) + fb.length / 2;
    expect(x0).toBeGreaterThanOrEqual(FLOOR.beams[0].x0);
    expect(x1).toBeLessThanOrEqual(FLOOR.beams[0].x1);
    expect(SPEC.floor.beam.spacing + SPEC.section.rect.narrow).toBeLessThanOrEqual(SPEC.floor.block.length);
  });
});

describe('ขั้นตอน (steps.ts)', () => {
  const knownTags = new Set<string>([
    ...MEMBERS.map((m) => m.tag),
    ...JOINTS.map((j) => j.tag),
    ...MARKERS.map((m) => m.tag),
    ...ROPES.map((r) => r.tag),
    ...SHEETS.map((s) => s.tag),
    ...SCENE_TAGS,
    'rails',
  ]);
  it('id ไม่ซ้ำ เรียงตามระยะ และครบระยะ 0–7', () => {
    const ids = STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of STEPS) expect(s.id).toBe(`step-${s.phase}-${s.n}`);
    expect(new Set(STEPS.map((s) => s.phase))).toEqual(new Set(PHASES.map((p) => p.n)));
    const counts = PHASES.map((p) => STEPS.filter((s) => s.phase === p.n).length);
    expect(counts).toEqual([6, 8, 4, 11, 11, 3, 7, 4]);
  });
  it('ทุกป้ายที่อ้างถึงมีอยู่จริง', () => {
    for (const s of STEPS) for (const t of [...(s.add ?? []), ...(s.remove ?? [])]) expect(knownTags.has(t), `${s.id}: ${t}`).toBe(true);
  });
  it('มุมกล้องและน็อตที่ซูมมีอยู่จริง', () => {
    const jointIds = new Set(JOINTS.map((j) => j.id));
    for (const s of STEPS) {
      expect(CAMERAS[s.camera], s.id).toBeDefined();
      for (const z of s.zoom ?? []) expect(jointIds.has(z), `${s.id}: ${z}`).toBe(true);
    }
  });
  it('สถานะสุดท้าย: ทุกโครงตั้งแล้ว และทุกชิ้นเหล็กปรากฏ', () => {
    const f = finalState();
    for (let i = 1; i <= 5; i++) expect(f.poses[i]).toEqual({ kind: 'up' });
    for (const m of MEMBERS) expect(f.visible.has(m.tag), m.id).toBe(true);
    for (const j of JOINTS) expect(f.visible.has(j.tag), j.id).toBe(true);
  });
  it('ไม้ค้ำชั่วคราวถูกถอดหลังบ่มปูน', () => {
    const f = finalState();
    for (let i = 1; i <= 5; i++) expect(f.visible.has(`temp-${i}`)).toBe(false);
  });
});

it('ทุกชิ้นใน MEMBER_BY_ID มี id ไม่ซ้ำ', () => {
  expect(MEMBER_BY_ID.size).toBe(MEMBERS.length);
});
