/**
 * ป้ายชี้จุด (callout) เส้นวัดระยะ (dim) และข้อมูลแอนิเมชันพิเศษของแต่ละขั้น
 *
 * - ตำแหน่งคำนวณจาก geometry.ts ทั้งหมด (พิกัดโลก มม.)
 * - ข้อความใช้ตัวเลขจากสเปกเท่านั้น
 * - เพิ่มป้ายให้ขั้นใด: เพิ่มรายการใน CALLOUTS / DIMS โดยใช้ id ของขั้น
 */
import * as THREE from 'three';
import {
  D,
  DOOR,
  FLOOR,
  GABLE,
  LAYOUT_POINTS,
  MARKERS,
  PITS,
  RAILS,
  RIDGE_TUBE,
  SHAPES,
  boxBetween,
  frameMatrix,
  groundY,
  planeToLocal,
  type BoxPiece,
  type FramePose,
  type V2,
  type V3,
} from '../data/geometry';
import { SPEC } from '../data/spec';

export interface Callout {
  at: V3;
  text: string;
  /** ⚠️ = สีส้มเตือน */
  warn?: boolean;
}

export interface Dim {
  from: V3;
  to: V3;
  label: string;
}

const flat0: FramePose = { kind: 'flat', stack: 0 };
const on = (f: number, pose: FramePose, p: V2, a = 0): V3 => {
  const v = new THREE.Vector3(...planeToLocal(p, a)).applyMatrix4(frameMatrix(f, pose));
  return [v.x, v.y, v.z];
};
const slab = (p: V2, a = 0) => on(1, flat0, p, a);
const lift = (p: V3, h: number): V3 => [p[0], p[1] + h, p[2]];
const m2 = (mm: number) => `${(mm / 1000).toFixed(2)} ม.`;
const thai = (n: number) => n.toLocaleString('en-US');

const L = SPEC.layout;
const W = D.W;
const HALF = D.HALF;
const hw = SPEC.section.rect.wide / 2;
const lowTubeHole = D.postHole('lowTube');
const purlinHole = D.rafterHole('purlin');
const apex: V2 = [HALF, L.ridgeHeight];
const LAST = D.frameX(L.frameCount);
const ropeOff = SPEC.site.guideRopeOffset;
const ropeY = (x: number, z: number) => groundY(x, z) + SPEC.site.guideRopeHeight;
const ft = SPEC.footing;
const cov = SPEC.cover;
const fl = SPEC.floor;
const gableU = SPEC.gablePost.fromNorth;


// ─────────────────────────── ป้ายชี้จุด ───────────────────────────
export const CALLOUTS: Record<string, Callout[]> = {
  'step-0-1': [{ at: [-300, 2900, 400], text: 'โครง 1 อยู่ด้านตะวันออก นับไปถึงโครง 5 ทางตะวันตก' }],
  'step-1-2': [{ at: lift(LAYOUT_POINTS.A, 400), text: 'หมุด = จุดกึ่งกลางเสา' }],
  'step-1-5': [{ at: [LAST / 2, 300, -HALF], text: `A–E = B–D คลาดไม่เกิน ${L.check.diagonalTol / 10} ซม.` }],
  'step-2-1': [{ at: lift(LAYOUT_POINTS.A, 350), text: 'หมุดอยู่กลางหลุม' }],
  'step-2-3': [{ at: lift(LAYOUT_POINTS.A, 300), text: `คอนกรีตรองก้นหนา ${ft.pad / 10} ซม. ทิ้งไว้ 1 คืน` }],
  'step-3-3': [
    { at: slab([-hw, D.H - 120], 20), text: 'ขอบตรงแผ่นประกับเสมอผิวนอกเสา' },
    { at: slab(lowTubeHole, 20), text: `รูเยื้อง ${thai(SPEC.post.holes.lowTube)} ชิดขอบด้านใน`, warn: true },
    { at: slab(purlinHole, 20), text: `รูเยื้อง ${thai(SPEC.rafter.holes.purlin)} ชิดขอบด้านใน`, warn: true },
    { at: slab(apex, 20), text: 'ปลายตัดดิ่งชนกันที่สัน' },
  ],
  'step-3-4': [{ at: slab([0, D.H + 60], 60), text: 'หัวน็อตอยู่ด้านบน แหวนทั้งหัวและท้าย ขันมือ' }],
  'step-3-7': [{ at: slab(SHAPES.tieHoles[1], 60), text: `รูที่ 2: ขีดตามรูจริง แล้วเจาะ ${SPEC.section.holeDia} มม.` }],
  'step-3-8': [{ at: slab(SHAPES.braceHoles[1], 60), text: `รูที่ 2: ขีดแนวกึ่งกลางผ่านรู ${SPEC.rafter.holes.brace} แล้วเจาะ ${SPEC.section.holeDia} มม.` }],
  'step-3-9': [{ at: slab([HALF, D.foldY], 90), text: 'รอยพับอยู่บนสุด ขานอนชี้ขึ้นฟ้า' }],
  'step-3-10': [{ at: slab([0, 500], 60), text: 'เขียนบนด้านที่มีคานรัด = ด้าน "ใน"' }],
  'step-3-11': [{ at: slab(apex, 600), text: 'ทุกโครงหงายด้านเดียวกัน ขอบตรงกัน คลาดไม่เกิน 5 มม.' }],

  'step-4-1': [{ at: [LAST / 2, ropeY(LAST / 2, ropeOff) + 80, ropeOff], text: `เชือกเยื้องออก ${ropeOff / 10} ซม. สูงจากดินราว ${SPEC.site.guideRopeHeight / 10} ซม. ขีดจุดทุก ${m2(L.bay)}` }],
  'step-4-2': [{ at: [80, D.tieY + 80, -HALF], text: 'ด้าน "ใน" (ด้านคานรัด) หันไปตะวันตก' }],
  'step-4-3': [{ at: [-250, D.H + 350, -HALF], text: `เสาฝังลึกไม่เท่ากันได้ แต่ปลายบนทุกต้นต้องเท่ากัน คลาดไม่เกิน ${ft.topTol / 10} ซม.` }],
  'step-4-5': [{ at: [LAST - 80, D.tieY + 80, -HALF], text: 'โครง 5: ด้าน "ใน" หันไปตะวันออก', warn: true }],
  'step-4-6': [
    { at: [LAST - 60, D.foldY + 260, -HALF], text: 'ฉากสันโครง 5 อยู่ด้านตะวันออก', warn: true },
    { at: [D.frameX(2) + 60, D.foldY + 260, -HALF], text: 'ฉากสันโครง 1–4 อยู่ด้านตะวันตก' },
  ],
  'step-4-7': [
    { at: [D.frameX(3) - 300, D.shoulderTubeY + 120, 60], text: 'ห้ามใช้น็อตทะลุท่อแนวยาว', warn: true },
    { at: [D.frameX(3) + 400, D.lowTubeY + 120, 60], text: 'ฉาก L ยิงสกรู 2 ตัวจากด้านใน' },
  ],
  'step-4-10': [{ at: [0, 420, 300], text: 'เทครึ่งหลุม กระทุ้งไล่ฟอง แล้วเทจนเต็ม ปาดเนินลาดออกจากเสา · เช็กดิ่งอีกครั้งใน 30 นาที' }],
  'step-5-1': [
    { at: [D.frameX(1) + 750, D.H + 120, -W - 60], text: 'ปลายค้ำห่างเสาอย่างน้อย 10 ซม. · สกรูปลายละ 2 ตัวจากด้านใน' },
    { at: [D.frameX(4) + 750, D.H + 120, -W - 60], text: 'ห้ามใช้น็อตทะลุ', warn: true },
  ],
  'step-5-2': [{ at: [LAST + 60, GABLE.topY + 120, -gableU[1]], text: 'ปลายบนเลยคานรัดประมาณ 2 ซม. แต่ยังต่ำกว่าจันทัน' }],
  'step-5-3': [{ at: [DOOR.xF + 60, DOOR.top - 150, -DOOR.openU0], text: `บานพับด้านเหนือ บานเปิดออกด้านนอก · เว้นช่องรอบบานประมาณ ${SPEC.door.gap} มม.` }],
  'step-6-1': [{ at: [LAST / 2, D.shoulderTubeY + 120, 80], text: `ยิงสกรูทุก ${cov.railScrewSpacing / 10} ซม. กลางหน้าเหล็ก` }],
  'step-6-2': [{ at: [RIDGE_TUBE.x0, RIDGE_TUBE.y + 180, -HALF], text: 'ลูบมือผ่าน ถ้าสะดุดมือ พลาสติกจะขาดตรงนั้น' }],
  'step-6-3': [
    { at: [D.frameX(2), D.shoulderTubeY + 140, 90], text: 'ลวดสปริงเส้นที่ 1 กดมุ้งลงราง' },
    { at: [D.frameX(2), 150, 120], text: `ฝังชายมุ้งลงดิน ${cov.sideMesh.buried / 10} ซม.` },
  ],
  'step-6-4': [{ at: [LAST + 120, D.tieY + 250, -HALF], text: 'ปิดถึงจันทัน รวมสามเหลี่ยมเหนือคานรัด · เว้นช่องประตู' }],
  'step-6-5': [
    { at: [-200, D.apexTopY + 150, -HALF], text: `ตัดชายหัวท้ายเหลือ ${cov.roofEndTrim / 10} ซม. ลมตะวันออกจะตีชายที่ยาวจนขาด`, warn: true },
    { at: [D.frameX(3), D.shoulderTubeY + 140, 90], text: 'ลวดเส้นที่ 2 ล็อกพลาสติกทับมุ้ง' },
  ],
  'step-6-6': [{ at: [D.frameX(2) + 750, D.shoulderTubeY - 220, 160], text: 'ม้วนขึ้นใต้ท่อไหล่ แล้วมัดท่อม้วนกับเชือกรัดหลังคาทุกช่อง' }],
  'step-6-7': [{ at: [LAST / 2, D.tieY + 180, -HALF], text: `รัดเคเบิลไทร์ทุก ${cov.saran.tieSpacing / 10} ซม.` }],
  'step-7-1': [{ at: [LAST / 2, 150, -HALF], text: `ทับรอยต่อ ${fl.weedCover.overlap / 10} ซม. ทับขอบด้วยก้อนอิฐ` }],
  'step-7-3': [
    {
      at: [FLOOR.stacks[0].x, FLOOR.stacks[0].ground + fl.stacks.height + 150, -FLOOR.stacks[0].u],
      text: `จุดละ ${fl.stacks.blocks} ก้อน วางนอน สูงประมาณ ${fl.stacks.height / 10} ซม.`,
    },
  ],
  'step-7-4': [{ at: [LAST / 2, FLOOR.beamTop + 220, -HALF], text: 'ระบบ Kratky ต้องได้ระดับน้ำเท่ากันทุกต้น เช็กระดับตลอดแนว' }],
};

// ─────────────────────────── เส้นวัดระยะ ───────────────────────────
/** หลุมที่หมุด A (ดินสูงสุด) ใช้แสดงตัวอย่างความลึก */
const pitA = PITS.find((p) => p.x === 0 && p.z === 0)!;

const rowDims: Dim[] = [];
{
  let u = 0;
  for (const seg of fl.rows) {
    const x = 150;
    const y = groundY(x, -u) + 40;
    rowDims.push({ from: [x, y, -u], to: [x, y, -(u + seg.size)], label: m2(seg.size) });
    u += seg.size;
  }
}
const beam0 = FLOOR.beams[0];
const beamY = FLOOR.stacks[0].ground + FLOOR.beamTop + 60;
const stack0 = FLOOR.stacks[0];
const stackDimZ = -stack0.u + 300;

export const DIMS: Record<string, Dim[]> = {
  'step-0-4': [{ from: [-3500, 140, 2400], to: [-1700, 140, 2400], label: 'วัดสุ่ม 3 ชิ้นต่อแบบ คลาดไม่เกิน 3 มม.' }],
  'step-1-6': Array.from({ length: L.frameCount - 1 }, (_, i) => ({
    from: [D.frameX(i + 1), 120, 250] as V3,
    to: [D.frameX(i + 2), 120, 250] as V3,
    label: m2(L.bay),
  })),
  'step-3-5': [
    { from: slab([0, D.postBottom], 30), to: slab([W, D.postBottom], 30), label: m2(W) },
    { from: slab([0, D.postBottom], 40), to: slab(apex, 40), label: 'ซ้าย' },
    { from: slab([W, D.postBottom], 40), to: slab(apex, 40), label: '= ขวา' },
  ],
  'step-3-8': [{ from: slab(SHAPES.braceHoles[0], 70), to: slab(SHAPES.braceHoles[1], 70), label: `≈ ${thai(SPEC.cornerBrace.check.holeSpacing)} มม.` }],
  'step-4-2': [{ from: [0, ropeY(0, ropeOff), ropeOff], to: [0, ropeY(0, ropeOff), hw], label: `${SPEC.site.postFaceToRope / 10} ซม.` }],
  'step-4-6': Array.from({ length: L.frameCount - 1 }, (_, i) => ({
    from: [D.frameX(i + 1), RIDGE_TUBE.y + 220, -HALF] as V3,
    to: [D.frameX(i + 2), RIDGE_TUBE.y + 220, -HALF] as V3,
    label: m2(L.bay),
  })),
  'step-4-8': [
    { from: [0, D.H, 0], to: [LAST, D.H, -W], label: m2(L.check.diagonal) },
    { from: [0, D.H, -W], to: [LAST, D.H, 0], label: m2(L.check.diagonal) },
  ],
  'step-7-2': rowDims,
  'step-7-3': [
    { from: [0, stack0.ground + 30, stackDimZ], to: [stack0.x, stack0.ground + 30, stackDimZ], label: m2(fl.stacks.firstFromFrame1) },
    { from: [stack0.x, stack0.ground + 30, stackDimZ], to: [stack0.x + fl.stacks.spacing, stack0.ground + 30, stackDimZ], label: m2(fl.stacks.spacing) },
  ],
  'step-7-4': [{ from: [0, beamY, -beam0.u], to: [beam0.x0, beamY, -beam0.u], label: `${fl.beam.endFromFrame / 10} ซม.` }],
};

/** เส้นวัดที่แสดงตลอดเวลาที่ป้ายนั้นปรากฏ */
export const TAG_DIMS: Record<string, Dim[]> = {
  'pit-depth': [
    {
      from: [pitA.x + 125, pitA.ground - pitA.depth, pitA.z - 125],
      to: [pitA.x + 125, pitA.ground, pitA.z - 125],
      label: `ลึก ${(pitA.depth / 10).toFixed(0)} ซม. = ${ft.depthBase / 10} + ${(pitA.ground / 10).toFixed(0)}`,
    },
  ],
};

/** จุดที่ขีดบนเชือกนำแนวทุก 1.50 ม. (แสดงตลอดเวลาที่มีเชือก) */
export const TAG_MARKS: Record<string, V3[]> = {
  'guide-rope': [ropeOff, -W - ropeOff].flatMap((z) => Array.from({ length: L.frameCount }, (_, i) => [D.frameX(i + 1), ropeY(D.frameX(i + 1), z), z] as V3)),
};

// ─────────────────────────── สายยางระดับน้ำ ───────────────────────────
export interface Hose {
  a: { x: number; z: number };
  b: { x: number; z: number };
  level: number;
  labels: [string, string];
}
const stakeLow = MARKERS.find((m) => m.id === 'stake.9')!; // จุดต่ำสุด (โครง 5 ด้านใต้)
const stakeHigh = MARKERS.find((m) => m.id === 'stake.0')!; // หมุด A
const postFace = -SPEC.section.rect.narrow / 2 - 22; // สายยางทาบผิวตะวันออกของเสาโครง 1
export const HOSES: Record<string, Hose> = {
  'step-1-8': {
    a: { x: stakeLow.at[0] + 30, z: stakeLow.at[2] },
    b: { x: stakeHigh.at[0] + 30, z: stakeHigh.at[2] },
    level: SPEC.site.levelHoseMarkHeight,
    labels: [
      `จุดต่ำสุด: ผิวน้ำสูงจากดิน ${SPEC.site.levelHoseMarkHeight / 10} ซม.`,
      `วัดได้ ${SPEC.site.levelHoseExample.reading / 10} ซม. = ดินสูงกว่าจุดต่ำสุด ${SPEC.site.levelHoseExample.rise / 10} ซม.`,
    ],
  },
  'step-4-3': {
    a: { x: postFace, z: 0 },
    b: { x: postFace, z: -W },
    level: D.H,
    labels: [`ปลายเสาสูง ${m2(D.H)} จากระดับอ้างอิง`, `อีกต้นต้องเท่ากัน คลาดไม่เกิน ${ft.topTol / 10} ซม.`],
  },
};

/** ระดับน้ำแบบลูกน้ำ (ขั้น 4-4): ทาบเสาโครง 1 ด้านเหนือ ด้านกว้าง (หันไปตะวันออก) แล้วด้านแคบ (หันไปเหนือ) */
export const PLUMB = [
  { at: [-SPEC.section.rect.narrow / 2 - 16, 950, 0] as V3, normal: [-1, 0, 0] as V3, label: 'ด้านกว้าง: ฟองอยู่กลาง' },
  { at: [0, 950, hw + 16] as V3, normal: [0, 0, 1] as V3, label: 'ด้านแคบ: ฟองอยู่กลาง' },
];

/** ลวดสปริงที่กดลงรางในแต่ละขั้น (id ราง) */
export const SPRINGS: Record<string, string[]> = {
  'step-6-3': ['rail.shoulder.n', 'rail.low.n', 'rail.shoulder.s', 'rail.low.s'],
  'step-6-4': RAILS.filter((r) => /^rail\.(rafter|corner)\.(1|5)\./.test(r.id)).map((r) => r.id),
  'step-6-5': ['rail.shoulder.n', 'rail.shoulder.s'],
};

/** เทปพันขอบคม (ขั้น 6-2): ปลายท่อสัน แผ่นประกับมุมไหล่ และแผ่นประกับสัน — frame = null คือพิกัดโลก */
export const TAPE_BANDS: { frame: number | null; piece: BoxPiece }[] = (() => {
  const out: { frame: number | null; piece: BoxPiece }[] = [];
  const q = SPEC.section.square.size;
  const x0 = RIDGE_TUBE.x0;
  for (const [x, dx] of [
    [x0, 25],
    [x0 + SPEC.ridgeTube.length, -25],
  ])
    out.push({ frame: null, piece: { center: [x + dx, RIDGE_TUBE.y, -HALF], size: [50, q + 6, q + 6], rot: [0, 0, 0] } });
  const p1 = D.rafterHole('plateLow');
  const p2 = D.rafterHole('plateHigh');
  const mid: V2 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
  const d: V2 = [Math.cos(D.theta), Math.sin(D.theta)];
  const thick = 2 * (SPEC.section.rect.narrow / 2 + SPEC.section.plateT) + 6;
  for (let f = 1; f <= L.frameCount; f++) {
    for (const s of [1, -1]) {
      const m: V2 = s > 0 ? mid : [W - mid[0], mid[1]];
      const dd: V2 = s > 0 ? d : [-d[0], d[1]];
      const a = planeToLocal([m[0] - dd[0] * 70, m[1] - dd[1] * 70], 0);
      const b = planeToLocal([m[0] + dd[0] * 70, m[1] + dd[1] * 70], 0);
      out.push({ frame: f, piece: boxBetween(a, b, SPEC.section.rect.wide + 8, thick, [1, 0, 0]) });
    }
    const top = D.apexTopY - 40;
    out.push({ frame: f, piece: boxBetween(planeToLocal([HALF - 130, top], 0), planeToLocal([HALF + 130, top], 0), 90, thick, [1, 0, 0]) });
  }
  return out;
})();

// ─────────────────────────── เส้นวัดหลัก (สวิตช์ "ระยะ") ───────────────────────────
const out = 300; // ระยะที่เส้นวัดยื่นออกนอกโรงเรือน (ภาพประกอบ)
/** ขนาดหลักของโรงเรือน — แสดงเมื่อโครง 1 ตั้งแล้ว */
export const FRAME_DIMS: Dim[] = [
  { from: [-out, 150, 0], to: [-out, 150, -W], label: 'กว้าง ' + m2(W) },
  { from: [0, 150, out], to: [LAST, 150, out], label: 'ยาว ' + m2(LAST) },
  { from: [-out, 0, out], to: [-out, D.H, out], label: 'เสา ' + m2(D.H) },
  { from: [-out, 0, -HALF], to: [-out, L.ridgeHeight, -HALF], label: 'ยอด ' + m2(L.ridgeHeight) },
  { from: [0, D.H + 200, out], to: [L.bay, D.H + 200, out], label: 'ช่อง ' + m2(L.bay) },
];
/** ผังหมุด — แสดงเมื่อตอกหมุด D แล้ว แต่ยังไม่มีโครงตั้ง */
export const LAYOUT_DIMS: Dim[] = [
  { from: lift(LAYOUT_POINTS.A, 60), to: lift(LAYOUT_POINTS.B, 60), label: m2(W) },
  { from: lift(LAYOUT_POINTS.A, 60), to: lift(LAYOUT_POINTS.D, 60), label: m2(LAST) },
];
