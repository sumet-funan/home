/**
 * พิกัด 3 มิติของทุกชิ้น คำนวณจาก spec.ts ทั้งหมด (หน่วย มม.)
 *
 * แกนโลก (มือขวา):
 *   X = ด้านยาว ตะวันออก → ตะวันตก (โครง 1 อยู่ตะวันออกที่ X = 0)
 *   Y = ขึ้นฟ้า (0 = ระดับอ้างอิง = จุดดินต่ำสุด)
 *   Z = ชี้ไปทางเหนือ (ผนังเหนือ Z = 0 ผนังใต้ Z = −3000) จุดกำเนิด = หมุด A
 *
 * พิกัดในระนาบโครง (u, y): u = ระยะจากกึ่งกลางเสาด้านเหนือของโครงนั้น (ก่อนหมุน)
 *   a = ระยะตั้งฉากระนาบโครง (+ = ด้าน "ใน")
 *   พิกัด three.js ของกลุ่มโครง: x = a, y = y, z = −u
 *   โครง 1–4 ด้าน "ใน" หันไปตะวันตก (+X) · โครง 5 หมุน 180° ด้าน "ใน" หันไปตะวันออก
 */
import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { ASSUMED, DECISIONS, SPEC } from './spec';
import type { PartId } from './parts';

export type V2 = [number, number];
export type V3 = [number, number, number];

// ─────────────────────────── ค่าพื้นฐาน ───────────────────────────
const L = SPEC.layout;
const W = L.width;
const H = L.wallHeight;
const HALF = W / 2;
const WIDE = SPEC.section.rect.wide;
const NARROW = SPEC.section.rect.narrow;
const SQ = SPEC.section.square.size;
const PT = SPEC.section.plateT;
const hw = WIDE / 2; // 25
const hn = NARROW / 2; // 12.5

const run = HALF;
const rise = L.ridgeHeight - H;
const slopeLen = Math.hypot(run, rise);
const theta = Math.atan2(rise, run);
const cos = Math.cos(theta);
const sin = Math.sin(theta);
const tan = Math.tan(theta);

/** ระยะตามแนวจันทัน จากจุดมุมไหล่ ถึงปลายตัดตรงของจันทัน */
const s0 = slopeLen - SPEC.rafter.lengthCenter;
const postBottom = H - SPEC.post.length;

/** ชั้นตามแนว a (ตั้งฉากระนาบโครง) */
export const LAYER = {
  steel: [-hn, hn] as [number, number],
  plateOut: [-hn - PT, -hn] as [number, number],
  plateIn: [hn, hn + PT] as [number, number],
  lapIn: [hn, hn + SQ] as [number, number], // คานรัด ค้ำมุมไหล่ (วางทับด้าน "ใน")
  bracketV: [hn + PT, hn + 2 * PT] as [number, number],
};

// ─────────────────────────── ฟังก์ชันระนาบโครง ───────────────────────────
const add2 = (a: V2, b: V2): V2 => [a[0] + b[0], a[1] + b[1]];
const mul2 = (a: V2, k: number): V2 => [a[0] * k, a[1] * k];
const mirror = (p: V2): V2 => [W - p[0], p[1]];
const mirrorPoly = (ps: V2[]): V2[] => ps.map(mirror).reverse();

/** จุดบนจันทันฝั่งเหนือ: s = ระยะตามแกนจากจุดมุมไหล่, n = ระยะตั้งฉาก (+ = ขึ้น/ด้านนอก) */
export function rafterPt(s: number, n = 0): V2 {
  return add2(add2([0, H], mul2([cos, sin], s)), mul2([-sin, cos], n));
}
/** ผิวบนจันทันฝั่งเหนือ ที่ตำแหน่ง u */
const roofTopY = (u: number) => H + hw / cos + u * tan;
const rafterBottomY = (u: number) => H - hw / cos + u * tan;

const postHole = (key: keyof typeof SPEC.post.holes): V2 => {
  const off = (SPEC.post.offsetHoles as readonly string[]).includes(key);
  return [off ? -hw + SPEC.post.offsetFromOuter : 0, postBottom + SPEC.post.holes[key]];
};
const rafterHole = (key: keyof typeof SPEC.rafter.holes): V2 => {
  const off = (SPEC.rafter.offsetHoles as readonly string[]).includes(key);
  return rafterPt(s0 + SPEC.rafter.holes[key], off ? hw - SPEC.rafter.offsetFromOuter : 0);
};

/** ค่าที่คำนวณได้ — ใช้ทั้งในฉากและใน test */
export const D = {
  W,
  H,
  HALF,
  theta,
  thetaDeg: (theta * 180) / Math.PI,
  slopeLen,
  s0,
  postBottom,
  rafterTopLen: (HALF + hw * sin) / cos - s0,
  rafterBottomLen: (HALF - hw * sin) / cos - s0,
  plumbCutDeg: 90 - (theta * 180) / Math.PI,
  apexTopY: L.ridgeHeight + hw / cos,
  frameX: (f: number) => (f - 1) * L.bay,
  inSign: (f: number) => (f === L.frameCount ? -1 : 1),
  postHole,
  rafterHole,
  roofTopY,
  rafterBottomY,
  tieY: rafterHole('tie')[1],
  foldY: rafterHole('ridgeHigh')[1] + SPEC.ridgeBracket.holeBelowFold,
  bracketFlatHoleA: hn + PT + SPEC.ridgeBracket.flatHoleFromBack,
  lowTubeY: postHole('lowTube')[1],
  shoulderTubeY: postHole('shoulderTube')[1],
  purlinS: s0 + SPEC.rafter.holes.purlin,
  longTubeGap: (L.bay - NARROW - SPEC.longTube.length) / 2,
};

/** ความสูงพื้นดินตัวอย่าง (มม. เหนือระดับอ้างอิง) — ดู ASSUMED.ground */
export function groundY(x: number, z: number): number {
  const u = -z;
  return ASSUMED.ground.riseEast * (1 - x / (L.bay * (L.frameCount - 1))) + ASSUMED.ground.riseNorth * (1 - u / W);
}

// ─────────────────────────── ชนิดข้อมูล ───────────────────────────
export type Material = 'steel' | 'plate' | 'blackSteel';

interface Base {
  id: string;
  part: PartId;
  /** ชิ้นจริงชิ้นเดียวอาจวาดด้วยหลายส่วน (เช่น ฉาก L) → piece เดียวกัน */
  piece: string;
  label: string;
  /** ป้ายที่ steps.ts ใช้สั่งให้ปรากฏ */
  tag: string;
  material: Material;
}

/** ชิ้นที่อยู่ในระนาบโครง วาดด้วยการรีดรูป 2 มิติ (u, y) ตามแนว a */
export interface PlaneMember extends Base {
  kind: 'plane';
  frame: number;
  /** true = ขยับตามท่าของโครง (ประกอบบนพื้น → ตั้ง) · false = ติดตั้งที่ตำแหน่งจริง */
  moves: boolean;
  profile: V2[];
  holes: V2[];
  a: [number, number];
}

export type Space = { kind: 'frame'; frame: number } | { kind: 'world' };

export interface BoxPiece {
  center: V3;
  size: V3;
  rot: V3; // euler XYZ (เรเดียน)
}

/** ชิ้นทรงกล่อง (ท่อแนวยาว ท่อสัน ฉาก L ฯลฯ) */
export interface BoxMember extends Base {
  kind: 'box';
  space: Space;
  boxes: BoxPiece[];
  /** รู: จุดกึ่งกลาง + แกนรู (ในพิกัด space เดียวกัน) */
  holes: { at: V3; axis: V3 }[];
}

export type Member = PlaneMember | BoxMember;

export type BoltKind = 'M8x50' | 'M8x50-8.8' | 'M8x70' | 'M8x70-8.8';

export interface Joint {
  id: string;
  tag: string;
  bolt: BoltKind;
  space: Space;
  /** จุดบนแกนน็อต ที่ผิวชั้นนอกสุดฝั่งหัวน็อต */
  at: V3;
  /** ทิศจากหัวน็อตไปตัวเมีย */
  axis: V3;
  /** ความหนาที่หนีบ (มม.) */
  grip: number;
  holes: { member: string; index: number }[];
  /** ป้ายสำหรับการ์ด */
  label: string;
}

export interface Screw {
  id: string;
  tag: string;
  long: boolean;
  space: Space;
  at: V3; // ตำแหน่งใต้หัว
  axis: V3; // ทิศที่ยิงเข้า
}

/** แผ่นบาง (พลาสติก มุ้ง สแลน ผ้าคลุม) วาดในระนาบ origin + s·ax + t·ay */
export interface Sheet {
  id: string;
  part: PartId;
  tag: string;
  label: string;
  origin: V3;
  ax: V3;
  ay: V3;
  poly: V2[];
  holes: V2[][];
  look: 'plastic' | 'mesh' | 'saran' | 'weed';
}

export interface Rope {
  id: string;
  tag: string;
  points: V3[];
  look: 'layout' | 'guide' | 'roof' | 'tape';
  part?: PartId;
}

export interface Marker {
  id: string;
  tag: string;
  label: string;
  at: V3;
  kind: 'pin' | 'stake' | 'refStake' | 'hook';
}

export interface Pit {
  id: string;
  /** โครง/เสาที่อยู่ในหลุม */
  label: string;
  x: number;
  z: number;
  ground: number;
  depth: number;
  gable: boolean;
  /** ระดับก้นเสา (เพื่อวางอิฐ/หินรอง) */
  postBottomY: number;
}

// ─────────────────────────── ตัวช่วยกล่อง ───────────────────────────


/** กล่องระหว่าง 2 จุด หน้าตัด w×h โดยแกน y ของกล่องหันตาม up */
export function boxBetween(p1: V3, p2: V3, w: number, h: number, up: V3 = [0, 1, 0]): BoxPiece {
  const a = new Vector3(...p1);
  const b = new Vector3(...p2);
  const dir = b.clone().sub(a);
  const len = dir.length();
  dir.normalize();
  const upV = new Vector3(...up);
  const yAxis = upV.sub(dir.clone().multiplyScalar(upV.dot(dir))).normalize();
  const zAxis = new Vector3().crossVectors(dir, yAxis);
  const m = new Matrix4().makeBasis(dir, yAxis, zAxis);
  const e = new Euler().setFromRotationMatrix(m, 'XYZ');
  const c = a.add(b).multiplyScalar(0.5);
  return { center: [c.x, c.y, c.z], size: [len, h, w], rot: [e.x, e.y, e.z] };
}

/** หมุนรอบแกน X ให้แกน y ของกล่องชี้ไปทาง out (out อยู่ในระนาบ YZ) */
const rotXFor = (out: V3) => Math.atan2(out[2], out[1]);

// ─────────────────────────── การแปลงพิกัดโครง ───────────────────────────
export type FramePose = { kind: 'up' } | { kind: 'flat'; stack: number };

const slab = (() => {
  const cx = (L.bay * (L.frameCount - 1)) / 2;
  const cz = 4500; // ลานประกอบอยู่ทางเหนือของแปลง (นอกเขตถางหญ้า 1 ม.)
  const top = groundY(cx, cz) + 60;
  return { cx, cz, top, sizeX: SPEC.site.assemblyArea.z, sizeZ: SPEC.site.assemblyArea.x };
})();
export const ASSEMBLY_SLAB = slab;

/** เมทริกซ์จากพิกัดกลุ่มโครง (x=a, y, z=−u) ไปพิกัดโลก */
export function frameMatrix(frame: number, pose: FramePose = { kind: 'up' }): Matrix4 {
  if (pose.kind === 'up') {
    const m = new Matrix4();
    if (D.inSign(frame) < 0) m.makeRotationY(Math.PI).setPosition(D.frameX(frame), 0, -W);
    else m.makeTranslation(D.frameX(frame), 0, 0);
    return m;
  }
  // นอนหงายบนลาน: ด้าน "ใน" ชี้ขึ้นฟ้า ปลายเสาชี้ไปตะวันออก
  const midY = (postBottom + D.apexTopY) / 2;
  const lift = slab.top + ASSUMED.assemblySupport + hn + PT + pose.stack * 100;
  const rot = new Matrix4().makeRotationZ(Math.PI / 2); // a → +Y, y → −X
  return rot.setPosition(slab.cx + midY, lift, slab.cz + HALF);
}

export function toWorld(space: Space, p: V3): V3 {
  if (space.kind === 'world') return p;
  const v = new Vector3(...p).applyMatrix4(frameMatrix(space.frame));
  return [v.x, v.y, v.z];
}
export function dirToWorld(space: Space, d: V3): V3 {
  if (space.kind === 'world') return d;
  const q = new Quaternion().setFromRotationMatrix(frameMatrix(space.frame));
  const v = new Vector3(...d).applyQuaternion(q);
  return [v.x, v.y, v.z];
}
/** จุด (u, y, a) ในระนาบโครง → พิกัดกลุ่มโครง three.js */
export const planeToLocal = (p: V2, a: number): V3 => [a, p[1], -p[0]];

// ─────────────────────────── สร้างชิ้นส่วน ───────────────────────────
const planes: PlaneMember[] = [];
const boxes: BoxMember[] = [];
const joints: Joint[] = [];
const screws: Screw[] = [];

const rectPoly = (u0: number, u1: number, y0: number, y1: number): V2[] => [
  [u0, y0],
  [u1, y0],
  [u1, y1],
  [u0, y1],
];

/** สี่เหลี่ยมหมุน (จากจุดเริ่มตามทิศ d ยาว len กว้าง w) ลบมุมปลาย c */
function barPoly(start: V2, d: V2, len: number, w: number, c: number): V2[] {
  const q: V2 = [-d[1], d[0]];
  const P = (along: number, across: number): V2 => add2(add2(start, mul2(d, along)), mul2(q, across));
  const h = w / 2;
  return [P(0, -h + c), P(c, -h), P(len - c, -h), P(len, -h + c), P(len, h - c), P(len - c, h), P(c, h), P(0, h - c)];
}

// โครงแต่ละชุด
const SIDES = ['n', 's'] as const;
const sideName = { n: 'เหนือ', s: 'ใต้' };
/** ชื่อทิศตามพิกัดโลก (โครง 5 หมุน 180° ฝั่ง n ในพิกัดโครงจึงอยู่ทางใต้จริง) */
const worldSide = (frame: number, side: 'n' | 's') => (D.inSign(frame) > 0 ? side : side === 'n' ? 's' : 'n');

// รูปทรงในระนาบโครง (ฝั่งเหนือ) ใช้ซ้ำทุกโครง
const shapes = (() => {
  const post = rectPoly(-hw, hw, postBottom, H);
  const postHoles = (Object.keys(SPEC.post.holes) as (keyof typeof SPEC.post.holes)[]).map(postHole);

  const tTop = (HALF + hw * sin) / cos;
  const tBot = (HALF - hw * sin) / cos;
  const rafter: V2[] = [
    rafterPt(s0, -hw),
    rafterPt(tBot, -hw),
    rafterPt(tTop, hw),
    rafterPt(s0, hw),
  ];
  const rafterHoles = (Object.keys(SPEC.rafter.holes) as (keyof typeof SPEC.rafter.holes)[]).map(rafterHole);

  // แผ่นประกับมุมไหล่: ขอบตรงเสมอผิวนอกเสา กว้าง 175 สูง 237 ขอบบนขนานหลังคา
  const sp = SPEC.shoulderPlate;
  const uMax = -hw + sp.width;
  const inset = ASSUMED.plateTopInset;
  const topY = (u: number) => roofTopY(u) - inset;
  const pb: V2 = [uMax, rafterBottomY(uMax)];
  const pt = add2(pb, mul2([-sin, cos], WIDE - inset * cos));
  const yb = pt[1] - sp.height;
  const diagFoot: V2 = [hw + 15, yb]; // ขอบล่างยาวเลยผิวในเสา 15 มม. แล้วเฉียงขึ้นตามใต้จันทัน
  const shoulderPlate: V2[] = [[-hw, yb], diagFoot, pb, pt, [-hw, topY(-hw)]];
  const shoulderPlateHoles = [postHole('plateLow'), postHole('plateHigh'), rafterHole('plateLow'), rafterHole('plateHigh')];

  // แผ่นประกับสัน: รูปบ้าน ขอบบนขนานหลังคา กว้าง 239 สูง 121
  const rp = SPEC.ridgePlate;
  const rTop = (du: number) => D.apexTopY - Math.abs(du) * tan - inset;
  const rYb = rTop(0) - rp.height;
  const ridgePlate: V2[] = [
    [HALF - rp.width / 2, rYb],
    [HALF + rp.width / 2, rYb],
    [HALF + rp.width / 2, rTop(rp.width / 2)],
    [HALF, rTop(0)],
    [HALF - rp.width / 2, rTop(rp.width / 2)],
  ];
  const ridgeHoles = [rafterHole('ridgeLow'), rafterHole('ridgeHigh')];
  const ridgePlateHoles = [...ridgeHoles, ...ridgeHoles.map(mirror)];

  // ฉากสัน ขาตั้ง: ขอบบนกว้างเท่าขานอน ขอบเฉียงขนานหลังคา
  const rb = SPEC.ridgeBracket;
  const fw = DECISIONS.ridgeBracketFlat.width / 2;
  const vw = rb.vertical.width / 2;
  const fy = D.foldY;
  const bracketV: V2[] = [
    [HALF - vw, fy - rb.vertical.height],
    [HALF + vw, fy - rb.vertical.height],
    [HALF + vw, fy - (vw - fw) * tan],
    [HALF + fw, fy],
    [HALF - fw, fy],
    [HALF - vw, fy - (vw - fw) * tan],
  ];
  const bracketHoles: V2[] = [
    [HALF - rb.holeSpacing / 2, fy - rb.holeBelowFold],
    [HALF + rb.holeSpacing / 2, fy - rb.holeBelowFold],
  ];

  // คานรัด: รู 25 ตรงรู 876 ฝั่งเหนือ ปลายที่สองเจาะตามรูจริงฝั่งใต้
  const tb = SPEC.tieBeam;
  const tN = rafterHole('tie');
  const tS = mirror(tN);
  const tu0 = tN[0] - tb.holeFromEnd;
  const c = ASSUMED.tieChamfer;
  const ty = tN[1];
  const tie: V2[] = [
    [tu0, ty - SQ / 2],
    [tu0 + tb.length, ty - SQ / 2],
    [tu0 + tb.length, ty + SQ / 2 - c],
    [tu0 + tb.length - c, ty + SQ / 2],
    [tu0 + c, ty + SQ / 2],
    [tu0, ty + SQ / 2 - c],
  ];

  // ค้ำมุมไหล่: รู 15 ตรงรู 1,300 ของเสา แนวกึ่งกลางผ่านรู 576 ของจันทัน
  const cb = SPEC.cornerBrace;
  const p1 = postHole('brace');
  const p2 = rafterHole('brace');
  const dl = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
  const d: V2 = [(p2[0] - p1[0]) / dl, (p2[1] - p1[1]) / dl];
  const braceStart = add2(p1, mul2(d, -cb.holeFromEnd));
  const brace = barPoly(braceStart, d, cb.length, SQ, ASSUMED.braceChamfer);

  return {
    post,
    postHoles,
    rafter,
    rafterHoles,
    shoulderPlate,
    shoulderPlateHoles,
    ridgePlate,
    ridgePlateHoles,
    bracketV,
    bracketHoles,
    tie,
    tieHoles: [tN, tS] as V2[],
    tieU0: tu0,
    brace,
    braceHoles: [p1, p2] as V2[],
    braceHoleSpacing: dl,
  };
})();
export const SHAPES = shapes;

const LOCAL_IN: V3 = [-1, 0, 0]; // หัวน็อตด้าน "ใน" (+a) → ชี้ไปด้านนอก
const frameSpace = (f: number): Space => ({ kind: 'frame', frame: f });

for (let f = 1; f <= L.frameCount; f++) {
  const fs = frameSpace(f);
  const T = (k: string) => `f${f}:${k}`;
  const id = (k: string) => `f${f}.${k}`;
  const P = (m: Omit<PlaneMember, 'kind' | 'frame' | 'moves' | 'piece'> & { piece?: string }) =>
    planes.push({ kind: 'plane', frame: f, moves: true, piece: m.piece ?? m.id, ...m });

  for (const side of SIDES) {
    const mir = side === 's';
    const poly = (ps: V2[]) => (mir ? mirrorPoly(ps) : ps);
    const pts = (ps: V2[]) => (mir ? ps.map(mirror) : ps);
    const ws = sideName[worldSide(f, side)];
    P({ id: id(`post.${side}`), part: 'post', label: `เสาโครง ${f} (${ws})`, tag: T('posts'), material: 'steel', profile: poly(shapes.post), holes: pts(shapes.postHoles), a: LAYER.steel });
    P({ id: id(`rafter.${side}`), part: 'rafter', label: `จันทัน โครง ${f} (${ws})`, tag: T('rafters'), material: 'steel', profile: poly(shapes.rafter), holes: pts(shapes.rafterHoles), a: LAYER.steel });
    for (const layer of ['out', 'in'] as const) {
      P({
        id: id(`splate.${side}.${layer}`),
        part: 'shoulderPlate',
        label: `แผ่นประกับมุมไหล่ โครง ${f} (${ws})`,
        tag: T(layer === 'out' ? 'plates-bottom' : 'plates-top'),
        material: 'blackSteel',
        profile: poly(shapes.shoulderPlate),
        holes: pts(shapes.shoulderPlateHoles),
        a: layer === 'out' ? LAYER.plateOut : LAYER.plateIn,
      });
    }
    P({ id: id(`brace.${side}`), part: 'cornerBrace', label: `ค้ำมุมไหล่ โครง ${f} (${ws})`, tag: T('braces'), material: 'steel', profile: poly(shapes.brace), holes: pts(shapes.braceHoles), a: LAYER.lapIn });
  }
  for (const layer of ['out', 'in'] as const) {
    P({
      id: id(`rplate.${layer}`),
      part: 'ridgePlate',
      label: `แผ่นประกับสัน โครง ${f}`,
      tag: T(layer === 'out' ? 'plates-bottom' : 'plates-top'),
      material: 'blackSteel',
      profile: shapes.ridgePlate,
      holes: shapes.ridgePlateHoles,
      a: layer === 'out' ? LAYER.plateOut : LAYER.plateIn,
    });
  }
  // คานรัด — โครง 1 และ 5 มีรูเสาหน้าจั่วเพิ่ม (เจาะตอนระยะ 5)
  const tieHoles = [...shapes.tieHoles];
  if ((SPEC.gablePost.frames as readonly number[]).includes(f)) {
    for (const uN of SPEC.gablePost.fromNorth) tieHoles.push([D.inSign(f) > 0 ? uN : W - uN, D.tieY]);
  }
  P({ id: id('tie'), part: 'tieBeam', label: `คานรัด โครง ${f}`, tag: T('tie'), material: 'steel', profile: shapes.tie, holes: tieHoles, a: LAYER.lapIn });
  P({ id: id('bracket.v'), piece: id('bracket'), part: 'ridgeBracket', label: `ฉากสัน โครง ${f}`, tag: T('ridge-bracket'), material: 'blackSteel', profile: shapes.bracketV, holes: shapes.bracketHoles, a: LAYER.bracketV });

  // ขานอนฉากสัน
  const flatDepth = DECISIONS.ridgeBracketFlat.depth;
  const a0 = LAYER.bracketV[0];
  boxes.push({
    kind: 'box',
    id: id('bracket.flat'),
    piece: id('bracket'),
    part: 'ridgeBracket',
    label: `ฉากสัน โครง ${f}`,
    tag: T('ridge-bracket'),
    material: 'blackSteel',
    space: fs,
    boxes: [{ center: [a0 + flatDepth / 2, D.foldY - PT / 2, -HALF], size: [flatDepth, PT, DECISIONS.ridgeBracketFlat.width], rot: [0, 0, 0] }],
    holes: [{ at: [D.bracketFlatHoleA, D.foldY - PT / 2, -HALF], axis: [0, 1, 0] }],
  });

  // ── น็อตในโครง (พิกัดกลุ่มโครง) ──
  const J = (j: Omit<Joint, 'space' | 'axis'> & { axis?: V3 }) => joints.push({ space: fs, axis: LOCAL_IN, ...j });
  for (const side of SIDES) {
    const mir = side === 's';
    const pt2 = (p: V2) => (mir ? mirror(p) : p);
    const ws = sideName[worldSide(f, side)];
    // แผ่นประกับมุมไหล่ 4 ตัว
    shapes.shoulderPlateHoles.forEach((h, i) => {
      const onPost = i < 2;
      J({
        id: id(`j.splate.${side}.${i}`),
        tag: T('plate-bolts'),
        bolt: 'M8x50-8.8',
        at: planeToLocal(pt2(h), LAYER.plateIn[1]),
        grip: LAYER.plateIn[1] - LAYER.plateOut[0],
        holes: [
          { member: id(`splate.${side}.out`), index: i },
          // รูเสา: plateLow/High = ลำดับ 4, 5 · รูจันทัน: plateLow/High = ลำดับ 0, 1
          { member: onPost ? id(`post.${side}`) : id(`rafter.${side}`), index: onPost ? 4 + i : i - 2 },
          { member: id(`splate.${side}.in`), index: i },
        ],
        label: `น็อตแผ่นประกับมุมไหล่ M8×50 เกรด 8.8 (โครง ${f} ${ws})`,
      });
    });
    // คานรัด
    J({
      id: id(`j.tie.${side}`),
      tag: T('tie'),
      bolt: 'M8x70',
      at: planeToLocal(pt2(shapes.tieHoles[0]), LAYER.lapIn[1]),
      grip: LAYER.lapIn[1] - LAYER.steel[0],
      holes: [
        { member: id('tie'), index: mir ? 1 : 0 },
        { member: id(`rafter.${side}`), index: 3 },
      ],
      label: `น็อตคานรัด M8×70 (โครง ${f} ${ws})`,
    });
    // ค้ำมุมไหล่ 2 จุด
    shapes.braceHoles.forEach((h, i) => {
      J({
        id: id(`j.brace.${side}.${i}`),
        tag: T('braces'),
        bolt: 'M8x70-8.8',
        at: planeToLocal(pt2(h), LAYER.lapIn[1]),
        grip: LAYER.lapIn[1] - LAYER.steel[0],
        holes: [
          { member: id(`brace.${side}`), index: i },
          i === 0 ? { member: id(`post.${side}`), index: 2 } : { member: id(`rafter.${side}`), index: 2 },
        ],
        label: `น็อตค้ำมุมไหล่ M8×70 เกรด 8.8 (โครง ${f} ${ws})`,
      });
    });
    // น็อตขวางก้นเสา
    J({
      id: id(`j.anchor.${side}`),
      tag: 'anchor-bolts',
      bolt: 'M8x50',
      at: planeToLocal(pt2(shapes.postHoles[0]), LAYER.steel[1]),
      grip: NARROW,
      holes: [{ member: id(`post.${side}`), index: 0 }],
      label: `น็อตขวางก้นเสา M8×50 (โครง ${f} ${ws})`,
    });
  }
  // แผ่นประกับสัน 4 ตัว (2 ตัวบนผ่านฉากสันด้วย)
  shapes.ridgePlateHoles.forEach((h, i) => {
    const throughBracket = i === 1 || i === 3;
    const rafterSide = i < 2 ? 'n' : 's';
    J({
      id: id(`j.rplate.${i}`),
      tag: throughBracket ? T('ridge-bracket') : T('plate-bolts'),
      bolt: 'M8x50-8.8',
      at: planeToLocal(h, throughBracket ? LAYER.bracketV[1] : LAYER.plateIn[1]),
      grip: (throughBracket ? LAYER.bracketV[1] : LAYER.plateIn[1]) - LAYER.plateOut[0],
      holes: [
        { member: id('rplate.out'), index: i },
        { member: id(`rafter.${rafterSide}`), index: 5 + (i % 2) },
        { member: id('rplate.in'), index: i },
        ...(throughBracket ? [{ member: id('bracket.v'), index: i === 1 ? 0 : 1 }] : []),
      ],
      label: throughBracket ? `น็อตฉากสัน M8×50 เกรด 8.8 (โครง ${f})` : `น็อตแผ่นประกับสัน M8×50 เกรด 8.8 (โครง ${f})`,
    });
  });
}

// ─────────────────────────── ท่อสัน ───────────────────────────
const ridgeTubeY = D.foldY + SQ / 2;
const frame1BracketHoleX = toWorld(frameSpace(1), [D.bracketFlatHoleA, 0, 0])[0];
const ridgeX0 = frame1BracketHoleX - SPEC.ridgeTube.holes[0];
boxes.push({
  kind: 'box',
  id: 'ridgeTube',
  piece: 'ridgeTube',
  part: 'ridgeTube',
  label: 'ท่อสัน',
  tag: 'ridge-tube',
  material: 'steel',
  space: { kind: 'world' },
  boxes: [{ center: [ridgeX0 + SPEC.ridgeTube.length / 2, ridgeTubeY, -HALF], size: [SPEC.ridgeTube.length, SQ, SQ], rot: [0, 0, 0] }],
  holes: SPEC.ridgeTube.holes.map((h) => ({ at: [ridgeX0 + h, ridgeTubeY, -HALF] as V3, axis: [0, 1, 0] as V3 })),
});
SPEC.ridgeTube.holes.forEach((_, i) => {
  const f = i + 1;
  joints.push({
    id: `j.ridge.${f}`,
    tag: 'ridge-tube',
    bolt: 'M8x50',
    space: { kind: 'world' },
    at: [ridgeX0 + SPEC.ridgeTube.holes[i], ridgeTubeY + SQ / 2, -HALF],
    axis: [0, -1, 0],
    grip: SQ + PT,
    holes: [
      { member: 'ridgeTube', index: i },
      { member: `f${f}.bracket.flat`, index: 0 },
    ],
    label: `น็อตท่อสัน M8×50 จากบนลงล่าง (โครง ${f})`,
  });
});
export const RIDGE_TUBE = { x0: ridgeX0, y: ridgeTubeY };

// ─────────────────────────── ท่อแนวยาว + ฉาก L ───────────────────────────
type TubeKind = 'low' | 'shoulder' | 'purlin';
const tubeName: Record<TubeKind, string> = { low: 'ท่อล่าง', shoulder: 'ท่อไหล่', purlin: 'แป' };

/** ตำแหน่งท่อในระนาบโครง (ฝั่งเหนือ): จุดกึ่งกลางท่อ และทิศออกนอก */
function tubeSection(kind: TubeKind, side: 'n' | 's'): { c: V2; out: V2; hole: V2 } {
  let c: V2;
  let out: V2;
  let hole: V2;
  if (kind === 'purlin') {
    c = rafterPt(D.purlinS, hw - SQ / 2);
    out = [-sin, cos];
    hole = rafterHole('purlin');
  } else {
    const key = kind === 'low' ? 'lowTube' : 'shoulderTube';
    hole = postHole(key);
    c = [-hw + SQ / 2, hole[1]];
    out = [-1, 0];
  }
  if (side === 's') {
    c = mirror(c);
    hole = mirror(hole);
    out = [-out[0], out[1]];
  }
  return { c, out, hole };
}
/** ระนาบโครง (u, y) ของโครง 1–4 → โลก (ไม่รวม X) */
const uyToWorldYZ = (p: V2): [number, number] => [p[1], -p[0]];

const tubeKinds: TubeKind[] = ['low', 'shoulder', 'purlin'];
const lw = ASSUMED.lAngleWidth;
const LA = SPEC.lAngle;

for (const side of SIDES) {
  for (const kind of tubeKinds) {
    const { c, out } = tubeSection(kind, side);
    const [cy, cz] = uyToWorldYZ(c);
    const outW: V3 = [0, out[1], -out[0]];
    const rx = rotXFor(outW);
    const inner = (k: number): [number, number] => [cy - outW[1] * k, cz - outW[2] * k]; // เลื่อนเข้าด้านในจากแกนท่อ
    for (let b = 1; b < L.frameCount; b++) {
      const x0 = D.frameX(b) + hn + D.longTubeGap;
      const x1 = x0 + SPEC.longTube.length;
      const tid = `long.${kind}.${side}.${b}`;
      const label = `${tubeName[kind]} ผนัง${sideName[side]} ช่อง ${b}–${b + 1}`;
      boxes.push({
        kind: 'box',
        id: tid,
        piece: tid,
        part: 'longTube',
        label,
        tag: 'long-tubes',
        material: 'steel',
        space: { kind: 'world' },
        boxes: [{ center: [(x0 + x1) / 2, cy, cz], size: [SPEC.longTube.length, SQ, SQ], rot: [rx, 0, 0] }],
        holes: [],
      });
      // ฉาก L ที่ปลายทั้งสอง
      for (const end of [0, 1] as const) {
        const xe = end === 0 ? x0 : x1;
        const into = end === 0 ? 1 : -1; // ทิศเข้าเนื้อท่อ
        const postFaceX = end === 0 ? D.frameX(b) + hn : D.frameX(b + 1) - hn;
        const [ay, az] = inner(SQ / 2 + LA.t / 2);
        const [by, bz] = inner(SQ / 2 + LA.leg / 2);
        const [hy, hz] = inner(SQ / 2 + LA.holeFromFold);
        const lid = `L.${kind}.${side}.${b}.${end}`;
        boxes.push({
          kind: 'box',
          id: lid,
          piece: lid,
          part: 'lAngle',
          label: `ฉาก L ${label}`,
          tag: 'long-tubes',
          material: 'steel',
          space: { kind: 'world' },
          boxes: [
            { center: [xe + (into * LA.leg) / 2, ay, az], size: [LA.leg, LA.t, lw], rot: [rx, 0, 0] },
            { center: [postFaceX + (into * LA.t) / 2, by, bz], size: [LA.t, LA.leg, lw], rot: [rx, 0, 0] },
          ],
          holes: [{ at: [postFaceX + (into * LA.t) / 2, hy, hz], axis: [1, 0, 0] }],
        });
        // สกรู 2 ตัวผ่านขาฉากเข้าท่อ ยิงจากด้านใน
        const [sy, sz] = inner(SQ / 2 + LA.t);
        for (const k of [0.25, 0.75]) {
          screws.push({
            id: `${lid}.s${k}`,
            tag: 'long-tubes',
            long: false,
            space: { kind: 'world' },
            at: [xe + into * LA.leg * k, sy, sz],
            axis: outW,
          });
        }
      }
    }
  }
}

// น็อตยึดฉาก L กับเสา/จันทัน: 1 ตัวต่อโครงต่อท่อ (โครงกลางฉาก 2 ช่องประกบกันใช้ตัวเดียว)
for (let f = 1; f <= L.frameCount; f++) {
  const inS = D.inSign(f);
  const x = D.frameX(f);
  for (const side of SIDES) {
    // side ในที่นี้คือทิศจริง (ผนังเหนือ/ใต้)
    const frameSide = worldSide(f, side); // ฝั่งในพิกัดโครง
    for (const kind of tubeKinds) {
      const { hole } = tubeSection(kind, side);
      const [hy, hz] = uyToWorldYZ(hole);
      const legs: { member: string; index: number }[] = [];
      if (f > 1) legs.push({ member: `L.${kind}.${side}.${f - 1}.1`, index: 0 });
      if (f < L.frameCount) legs.push({ member: `L.${kind}.${side}.${f}.0`, index: 0 });
      const westLeg = f < L.frameCount;
      const eastLeg = f > 1;
      const top = inS > 0 ? x + hn + (westLeg ? LA.t : 0) : x - hn - (eastLeg ? LA.t : 0);
      const bottom = inS > 0 ? x - hn - (eastLeg ? LA.t : 0) : x + hn + (westLeg ? LA.t : 0);
      const steelMember = kind === 'purlin' ? `f${f}.rafter.${frameSide}` : `f${f}.post.${frameSide}`;
      const steelIndex = kind === 'purlin' ? 4 : kind === 'low' ? 1 : 3;
      joints.push({
        id: `j.L.${kind}.${side}.${f}`,
        tag: 'long-tubes',
        bolt: 'M8x50',
        space: { kind: 'world' },
        at: [top, hy, hz],
        axis: [-inS, 0, 0],
        grip: Math.abs(top - bottom),
        holes: [{ member: steelMember, index: steelIndex }, ...legs],
        label: `น็อตฉาก${tubeName[kind]} M8×50 (โครง ${f} ผนัง${sideName[side]})`,
      });
    }
  }
}

// ─────────────────────────── ค้ำยันผนัง ───────────────────────────
for (const side of SIDES) {
  for (const [fa, fb] of SPEC.wallBrace.bays) {
    // ปลายบนใกล้โครงหัวท้าย (1 หรือ 5) ปลายล่างใกล้โครงถัดเข้ามา
    const endFrame = fa === 1 ? fa : fb;
    const nextFrame = fa === 1 ? fb : fa;
    const dirX = Math.sign(D.frameX(nextFrame) - D.frameX(endFrame));
    const xTop = D.frameX(endFrame) + dirX * (hn + ASSUMED.wallBraceCrossFromPost);
    const xBot = D.frameX(nextFrame) - dirX * (hn + ASSUMED.wallBraceCrossFromPost);
    const zFace = side === 'n' ? 0 : -W; // ผิวด้านในของท่อผนัง
    const zc = side === 'n' ? zFace - SQ / 2 : zFace + SQ / 2;
    const pTop: V3 = [xTop, D.shoulderTubeY, zc];
    const pBot: V3 = [xBot, D.lowTubeY, zc];
    const dir = new Vector3(...pBot).sub(new Vector3(...pTop)).normalize();
    const ov = SPEC.wallBrace.overshoot;
    const e1: V3 = [pTop[0] - dir.x * ov, pTop[1] - dir.y * ov, zc];
    const e2: V3 = [pBot[0] + dir.x * ov, pBot[1] + dir.y * ov, zc];
    const id = `wallBrace.${side}.${fa}${fb}`;
    boxes.push({
      kind: 'box',
      id,
      piece: id,
      part: 'wallBrace',
      label: `ค้ำยัน ผนัง${sideName[side]} ช่อง ${fa}–${fb}`,
      tag: 'wall-braces',
      material: 'steel',
      space: { kind: 'world' },
      boxes: [boxBetween(e1, e2, SQ, SQ, [0, 0, 1])],
      holes: [],
    });
    const zIn = side === 'n' ? zFace - SQ : zFace + SQ;
    for (const [p, k] of [
      [pTop, 0],
      [pBot, 1],
    ] as const) {
      for (const dx of [-8, 8]) {
        screws.push({
          id: `${id}.s${k}${dx}`,
          tag: 'wall-braces',
          long: true,
          space: { kind: 'world' },
          at: [p[0] + dx, p[1], zIn],
          axis: [0, 0, side === 'n' ? 1 : -1],
        });
      }
    }
  }
}

// ─────────────────────────── เสาหน้าจั่ว ───────────────────────────
const gableTopY = D.tieY + SQ / 2 + SPEC.gablePost.aboveTie;
const gableBottomY = gableTopY - DECISIONS.gablePostLength;
export const GABLE = { topY: gableTopY, bottomY: gableBottomY };
for (const f of SPEC.gablePost.frames) {
  SPEC.gablePost.fromNorth.forEach((uN, i) => {
    const uL = D.inSign(f) > 0 ? uN : W - uN;
    const id = `gable.${f}.${i}`;
    const isDoor = f === SPEC.door.frame;
    const label = `เสาหน้าจั่ว โครง ${f} (${(uN / 1000).toFixed(3)} ม. จากเหนือ)${isDoor ? ' · เสาประตู' : ''}`;
    planes.push({
      kind: 'plane',
      id,
      piece: id,
      part: 'gablePost',
      label,
      tag: 'gable-posts',
      material: 'steel',
      frame: f,
      moves: false,
      profile: rectPoly(uL - hw, uL + hw, gableBottomY, gableTopY),
      holes: [
        [uL, gableBottomY + SPEC.gablePost.anchorHole],
        [uL, D.tieY],
      ],
      a: LAYER.steel,
    });
    const top = toWorld(frameSpace(f), [LAYER.lapIn[1], D.tieY, -uL]);
    joints.push({
      id: `j.gable.${f}.${i}`,
      tag: 'gable-posts',
      bolt: 'M8x70',
      space: { kind: 'world' },
      at: top,
      axis: [-D.inSign(f), 0, 0],
      grip: LAYER.lapIn[1] - LAYER.steel[0],
      holes: [
        { member: id, index: 1 },
        { member: `f${f}.tie`, index: 2 + i },
      ],
      label: `น็อตเสาหน้าจั่ว–คานรัด M8×70 (โครง ${f})`,
    });
    joints.push({
      id: `j.gableAnchor.${f}.${i}`,
      tag: 'gable-posts',
      bolt: 'M8x50',
      space: { kind: 'world' },
      at: toWorld(frameSpace(f), [LAYER.steel[1], gableBottomY + SPEC.gablePost.anchorHole, -uL]),
      axis: [-D.inSign(f), 0, 0],
      grip: NARROW,
      holes: [{ member: id, index: 0 }],
      label: `น็อตขวางก้นเสาหน้าจั่ว M8×50 (โครง ${f})`,
    });
  });
}

// ─────────────────────────── บานประตู ───────────────────────────
const door = (() => {
  const f = SPEC.door.frame;
  const [uA, uB] = SPEC.gablePost.fromNorth;
  const openU0 = uA + hw; // ผิวเสาประตูด้านเหนือ
  const openU1 = uB - hw;
  const leafW = SPEC.door.horizontal + 2 * SQ;
  const leafU0 = openU0 + SPEC.door.gap;
  const top = D.tieY - SQ / 2 - ASSUMED.doorTopGap;
  const bottom = top - DECISIONS.doorVertical;
  const xF = D.frameX(f);
  // บานอยู่ในระนาบโครง (x = ตำแหน่งโครง) วาดในพิกัดโลก
  const zOf = (uN: number) => -uN;
  const pieces: BoxPiece[] = [];
  const vert = (u: number): BoxPiece => ({ center: [xF, (top + bottom) / 2, zOf(u)], size: [SQ, DECISIONS.doorVertical, SQ], rot: [0, 0, 0] });
  pieces.push(vert(leafU0 + SQ / 2), vert(leafU0 + leafW - SQ / 2));
  const ys = [top - SQ / 2, (top + bottom) / 2, bottom + SQ / 2];
  for (const y of ys) pieces.push({ center: [xF, y, zOf(leafU0 + leafW / 2)], size: [SQ, SQ, SPEC.door.horizontal], rot: [0, 0, 0] });
  return { f, openU0, openU1, leafW, leafU0, top, bottom, xF, pieces, ys };
})();
export const DOOR = door;
door.pieces.forEach((p, i) => {
  const isV = i < 2;
  boxes.push({
    kind: 'box',
    id: `door.${i}`,
    piece: `door.${i}`,
    part: 'door',
    label: isV ? `บานประตู เหล็กตั้ง ${DECISIONS.doorVertical.toLocaleString()}` : `บานประตู เหล็กนอน ${SPEC.door.horizontal}`,
    tag: 'door',
    material: 'steel',
    space: { kind: 'world' },
    boxes: [p],
    holes: [],
  });
});
// ฉาก L ที่มุมบาน (ด้านใน = ตะวันออก)
door.ys.forEach((y, yi) => {
  for (const end of [0, 1] as const) {
    const uEdge = end === 0 ? door.leafU0 + SQ : door.leafU0 + door.leafW - SQ;
    const into = end === 0 ? 1 : -1; // ไปทางกลางบาน (u)
    const xIn = door.xF - SQ / 2 - LA.t / 2;
    const id = `door.L.${yi}.${end}`;
    const yDir = yi === 0 ? -1 : 1; // ขาตั้งไปทางกลางบาน
    boxes.push({
      kind: 'box',
      id,
      piece: id,
      part: 'lAngle',
      label: 'ฉาก L บานประตู',
      tag: 'door',
      material: 'steel',
      space: { kind: 'world' },
      boxes: [
        { center: [xIn, y, -(uEdge + (into * LA.leg) / 2)], size: [LA.t, lw, LA.leg], rot: [0, 0, 0] },
        { center: [xIn, y + (yDir * LA.leg) / 2, -(uEdge - (into * SQ) / 2)], size: [LA.t, LA.leg, lw], rot: [0, 0, 0] },
      ],
      holes: [],
    });
  }
});

// ─────────────────────────── ไม้ค้ำชั่วคราว ───────────────────────────
export interface TempBrace {
  id: string;
  frame: number;
  piece: BoxPiece;
}
export const TEMP_BRACES: TempBrace[] = [];
for (let f = 1; f <= L.frameCount; f++) {
  const outDir = -D.inSign(f); // ค้ำออกไปด้านนอกของโครง
  for (const side of SIDES) {
    const z = side === 'n' ? 0 : -W;
    const x = D.frameX(f) + outDir * hn;
    const p1: V3 = [x, ASSUMED.tempBrace.attachHeight, z];
    const xg = x + outDir * ASSUMED.tempBrace.reachOut;
    const p2: V3 = [xg, groundY(xg, z) - 100, z];
    TEMP_BRACES.push({ id: `temp.${f}.${side}`, frame: f, piece: boxBetween(p1, p2, ASSUMED.tempBrace.size, ASSUMED.tempBrace.size, [0, 0, 1]) });
  }
}

// ─────────────────────────── ผัง หมุด หลุม ───────────────────────────
const lastX = D.frameX(L.frameCount);
const markers: Marker[] = [];
const gx = (x: number, z: number): V3 => [x, groundY(x, z), z];
markers.push({ id: 'pin.A', tag: 'pin-A', label: 'A', at: gx(0, 0), kind: 'pin' });
markers.push({ id: 'pin.B', tag: 'pin-B', label: 'B', at: gx(0, -SPEC.site.triangle.a), kind: 'pin' });
markers.push({ id: 'pin.C', tag: 'pin-C', label: 'C', at: gx(SPEC.site.triangle.b, 0), kind: 'pin' });
markers.push({ id: 'pin.D', tag: 'pin-D', label: 'D', at: gx(lastX, 0), kind: 'pin' });
markers.push({ id: 'pin.E', tag: 'pin-E', label: 'E', at: gx(lastX, -W), kind: 'pin' });
for (let f = 2; f < L.frameCount; f++) {
  for (const side of SIDES) {
    markers.push({ id: `pin.${f}.${side}`, tag: 'pins-posts', label: '', at: gx(D.frameX(f), side === 'n' ? 0 : -W), kind: 'pin' });
  }
}
for (const f of SPEC.gablePost.frames) {
  for (const uN of SPEC.gablePost.fromNorth) markers.push({ id: `pin.g.${f}.${uN}`, tag: 'pins-gable', label: '', at: gx(D.frameX(f), -uN), kind: 'pin' });
}
const refX = [-SPEC.site.refStakeBeyond, lastX + SPEC.site.refStakeBeyond];
for (const x of refX) {
  for (const z of [0, -W]) markers.push({ id: `ref.${x}.${z}`, tag: 'ref-stakes', label: 'หลักอ้างอิง', at: gx(x, z), kind: 'refStake' });
}
const ropeOff = SPEC.site.guideRopeOffset;
for (const x of refX) {
  for (const z of [ropeOff, -W - ropeOff]) markers.push({ id: `guide.${x}.${z}`, tag: 'guide-rope', label: '', at: gx(x, z), kind: 'refStake' });
}
// หลักไม้ข้างหมุดทุกตัว (14 จุด) สำหรับขีดระดับน้ำ
const postPoints: { x: number; z: number; gable: boolean; label: string }[] = [];
for (let f = 1; f <= L.frameCount; f++) {
  for (const side of SIDES) postPoints.push({ x: D.frameX(f), z: side === 'n' ? 0 : -W, gable: false, label: `เสาโครง ${f} (${sideName[side]})` });
}
for (const f of SPEC.gablePost.frames) {
  for (const uN of SPEC.gablePost.fromNorth) postPoints.push({ x: D.frameX(f), z: -uN, gable: true, label: `เสาหน้าจั่ว โครง ${f}` });
}
postPoints.forEach((p, i) => markers.push({ id: `stake.${i}`, tag: 'side-stakes', label: '', at: gx(p.x + 150, p.z + (p.z === 0 ? 150 : p.z === -W ? -150 : 0)), kind: 'stake' }));

export const PITS: Pit[] = postPoints.map((p) => {
  const g = groundY(p.x, p.z);
  return {
    id: `pit.${p.x}.${p.z}`,
    label: p.label,
    x: p.x,
    z: p.z,
    ground: g,
    depth: SPEC.footing.depthBase + g,
    gable: p.gable,
    postBottomY: p.gable ? gableBottomY : postBottom,
  };
});

const ropes: Rope[] = [];
const ropeY = (x: number, z: number, h = 30) => groundY(x, z) + h;
ropes.push({ id: 'rope.AD', tag: 'rope-layout', look: 'layout', points: [[refX[0], ropeY(refX[0], 0), 0], [refX[1], ropeY(refX[1], 0), 0]] });
ropes.push({ id: 'rope.BE', tag: 'rope-layout', look: 'layout', points: [[refX[0], ropeY(refX[0], -W), -W], [refX[1], ropeY(refX[1], -W), -W]] });
for (const z of [ropeOff, -W - ropeOff]) {
  ropes.push({
    id: `guide.${z}`,
    tag: 'guide-rope',
    look: 'guide',
    points: [
      [refX[0], ropeY(refX[0], z, SPEC.site.guideRopeHeight), z],
      [refX[1], ropeY(refX[1], z, SPEC.site.guideRopeHeight), z],
    ],
  });
}
// เทปวัด 3-4-5 และเส้นทแยง
const A = markers.find((m) => m.id === 'pin.A')!.at;
const B = markers.find((m) => m.id === 'pin.B')!.at;
const C = markers.find((m) => m.id === 'pin.C')!.at;
const Dp = markers.find((m) => m.id === 'pin.D')!.at;
const E = markers.find((m) => m.id === 'pin.E')!.at;
const up = (p: V3, h = 20): V3 => [p[0], p[1] + h, p[2]];
ropes.push({ id: 'tape.AB', tag: 'tape-345', look: 'tape', points: [up(A), up(B)] });
ropes.push({ id: 'tape.AC', tag: 'tape-345', look: 'tape', points: [up(A), up(C)] });
ropes.push({ id: 'tape.BC', tag: 'tape-345', look: 'tape', points: [up(B), up(C)] });
ropes.push({ id: 'tape.AE', tag: 'tape-diag', look: 'tape', points: [up(A), up(E)] });
ropes.push({ id: 'tape.BD', tag: 'tape-diag', look: 'tape', points: [up(B), up(Dp)] });

export const LAYOUT_POINTS = { A, B, C, D: Dp, E };

// ─────────────────────────── หุ้มโครง ───────────────────────────
const sheets: Sheet[] = [];
const cov = SPEC.cover;
const railT = ASSUMED.rail.height;
const roofLift = 2; // ลอยเหนือผิวเหล็กเล็กน้อย ไม่ให้ภาพกระพริบ

// มุ้งผนังข้าง และม่าน
for (const side of SIDES) {
  const zOut = side === 'n' ? hw + railT : -W - hw - railT;
  const sgn = side === 'n' ? 1 : -1;
  const x0 = -hn;
  const x1 = lastX + hn;
  const yTop = D.shoulderTubeY + SQ / 2;
  const gy = Math.min(groundY(x0, zOut), groundY(x1, zOut));
  sheets.push({
    id: `mesh.${side}`,
    part: 'sideMesh',
    tag: 'mesh-side',
    label: `มุ้งผนังข้าง (${sideName[side]})`,
    origin: [x0, 0, zOut],
    ax: [1, 0, 0],
    ay: [0, 1, 0],
    poly: rectPoly(0, x1 - x0, gy - cov.sideMesh.buried, yTop),
    holes: [],
    look: 'mesh',
  });
  // ม่าน: ฝั่งเหนือม้วนขึ้น (เปิดระบายลม) ฝั่งใต้ปล่อยลง (ตามรูปในสเปก "ฝั่งซ้ายม้วนขึ้น ฝั่งขวาปล่อยลง")
  const rolledUp = side === 'n';
  const curtainBottom = rolledUp ? yTop - 120 : gy + 100;
  sheets.push({
    id: `curtain.${side}`,
    part: 'curtain',
    tag: 'curtains',
    label: `ม่านม้วน (${sideName[side]})${rolledUp ? ' · ม้วนขึ้น' : ' · ปล่อยลง'}`,
    origin: [0, 0, zOut + sgn * 8],
    ax: [1, 0, 0],
    ay: [0, 1, 0],
    poly: rectPoly(x0 - 250, x1 + 250, curtainBottom, yTop),
    holes: [],
    look: 'plastic',
  });
  boxes.push({
    kind: 'box',
    id: `rollPipe.${side}`,
    piece: `rollPipe.${side}`,
    part: 'curtain',
    label: 'ท่อม้วนม่าน 1/2"',
    tag: 'curtains',
    material: 'steel',
    space: { kind: 'world' },
    boxes: [{ center: [lastX / 2, curtainBottom, zOut + sgn * (8 + cov.rollPipeDia / 2 + (rolledUp ? 30 : 0))], size: [SPEC.ridgeTube.length, rolledUp ? cov.rollPipeDia + 60 : cov.rollPipeDia, rolledUp ? cov.rollPipeDia + 60 : cov.rollPipeDia], rot: [0, 0, 0] }],
    holes: [],
  });
}

// พลาสติกหลังคา 2 ฝั่ง: จากท่อไหล่ ขึ้นตามผิวบนจันทัน ถึงท่อสัน
const roofX0 = -hn - cov.roofEndTrim;
const roofX1 = lastX + hn + cov.roofEndTrim;
for (const side of SIDES) {
  const eave: V2 = [-hw - railT, D.shoulderTubeY - SQ / 2 - cov.roofEaveTrim];
  const shoulderEdge: V2 = [-hw - railT, roofTopY(-hw) + railT];
  const ridge: V2 = [HALF, RIDGE_TUBE.y + SQ / 2 + roofLift];
  const path = [eave, shoulderEdge, ridge].map((p) => (side === 's' ? mirror(p) : p));
  for (let i = 0; i < path.length - 1; i++) {
    const p = path[i];
    const q = path[i + 1];
    const o: V3 = [roofX0, p[1], -p[0]];
    const dy = q[1] - p[1];
    const dz = -(q[0] - p[0]);
    const len = Math.hypot(dy, dz);
    sheets.push({
      id: `roof.${side}.${i}`,
      part: 'roofPlastic',
      tag: 'roof-plastic',
      label: 'พลาสติกหลังคา',
      origin: o,
      ax: [1, 0, 0],
      ay: [0, dy / len, dz / len],
      poly: rectPoly(0, roofX1 - roofX0, 0, len),
      holes: [],
      look: 'plastic',
    });
  }
}

// มุ้งหน้าจั่ว 2 ด้าน (ปิดดินถึงจันทัน เว้นช่องประตูที่โครง 5)
for (const f of [1, L.frameCount]) {
  const xOut = D.frameX(f) - D.inSign(f) * (hn + PT + 4);
  const gMin = Math.min(groundY(xOut, 0), groundY(xOut, -W));
  const poly: V2[] = [
    [-hw, gMin - cov.sideMesh.buried],
    [W + hw, gMin - cov.sideMesh.buried],
    [W + hw, roofTopY(-hw)],
    [HALF, D.apexTopY],
    [-hw, roofTopY(-hw)],
  ];
  const holes: V2[][] = f === SPEC.door.frame ? [rectPoly(door.openU0, door.openU1, gMin - 50, D.tieY - SQ / 2).reverse()] : [];
  sheets.push({
    id: `gableMesh.${f}`,
    part: 'gableMesh',
    tag: 'mesh-gable',
    label: `มุ้งหน้าจั่ว โครง ${f}`,
    origin: [xOut, 0, 0],
    ax: [0, 0, -1],
    ay: [0, 1, 0],
    poly,
    holes,
    look: 'mesh',
  });
}
// มุ้งบานประตู
sheets.push({
  id: 'doorMesh',
  part: 'gableMesh',
  tag: 'door',
  label: 'มุ้งบานประตู',
  origin: [door.xF + SQ / 2 + 2, 0, 0],
  ax: [0, 0, -1],
  ay: [0, 1, 0],
  poly: rectPoly(door.leafU0, door.leafU0 + door.leafW, door.bottom, door.top),
  holes: [],
  look: 'mesh',
});

// สแลนบนคานรัด
{
  const y = D.tieY + SQ / 2 + 3;
  const tN = shapes.tieHoles[0][0];
  const tS = shapes.tieHoles[1][0];
  const mid = (tN + tS) / 2;
  sheets.push({
    id: 'saran',
    part: 'saran',
    tag: 'saran',
    label: 'สแลน (พาดบนคานรัด)',
    origin: [0, y, 0],
    ax: [1, 0, 0],
    ay: [0, 0, -1],
    poly: rectPoly(0, SPEC.cover.saran.length, mid - cov.saran.width / 2, mid + cov.saran.width / 2),
    holes: [],
    look: 'saran',
  });
}

// ผ้าคลุมวัชพืช
{
  const wc = SPEC.floor.weedCover;
  sheets.push({
    id: 'weed',
    part: 'weedCover',
    tag: 'weed-cover',
    label: 'พลาสติกคลุมวัชพืช',
    origin: [0, 0, 0],
    ax: [1, 0, 0],
    ay: [0, 0, -1],
    poly: rectPoly(lastX / 2 - wc.length / 2, lastX / 2 + wc.length / 2, HALF - wc.width / 2, HALF + wc.width / 2),
    holes: [],
    look: 'weed',
  });
}

// รางล็อก
export const RAILS: { id: string; piece: BoxPiece; tag: string }[] = [];
{
  const rw = ASSUMED.rail.width;
  for (const side of SIDES) {
    const zc = side === 'n' ? hw + railT / 2 : -W - hw - railT / 2;
    for (const [k, y] of [
      ['shoulder', D.shoulderTubeY],
      ['low', D.lowTubeY],
    ] as const) {
      RAILS.push({ id: `rail.${k}.${side}`, tag: 'rails', piece: { center: [lastX / 2, y, zc], size: [lastX + NARROW, rw, railT], rot: [0, 0, 0] } });
    }
    // เสามุม (แนวตั้ง) 4 ต้น
    for (const f of [1, L.frameCount]) {
      const x = D.frameX(f);
      const g = groundY(x, zc);
      const yTop = D.shoulderTubeY + SQ / 2;
      RAILS.push({ id: `rail.corner.${f}.${side}`, tag: 'rails', piece: { center: [x, (g + yTop) / 2, zc], size: [NARROW, yTop - g, railT], rot: [0, 0, 0] } });
    }
  }
  // ผิวบนจันทันโครง 1 และ 5
  for (const f of [1, L.frameCount]) {
    for (const side of SIDES) {
      const p1 = rafterPt(s0, hw + railT / 2);
      const p2 = rafterPt(slopeLen, hw + railT / 2);
      const [q1, q2] = side === 's' ? [mirror(p1), mirror(p2)] : [p1, p2];
      const w1 = toWorld(frameSpace(f), planeToLocal(q1, 0));
      const w2 = toWorld(frameSpace(f), planeToLocal(q2, 0));
      RAILS.push({ id: `rail.rafter.${f}.${side}`, tag: 'rails', piece: boxBetween(w1, w2, NARROW, railT, [0, 1, 0]) });
    }
  }
  // รอบช่องประตู: ผิวนอกเสาประตูทั้งสอง
  const xo = door.xF + hn + railT / 2;
  for (const u of [door.openU0 - hw, door.openU1 + hw]) {
    const g = groundY(xo, -u);
    const yTop = D.tieY - SQ / 2;
    RAILS.push({ id: `rail.door.${u}`, tag: 'rails', piece: { center: [xo, (g + yTop) / 2, -u], size: [railT, yTop - g, rw], rot: [0, 0, 0] } });
  }
}

// สกรูรางล็อกทุก 30 ซม. (เฉพาะรางผนังยาว ใช้นับจำนวนและวาดแบบ instanced)
for (const r of RAILS) {
  const [len] = r.piece.size;
  if (!r.id.startsWith('rail.shoulder') && !r.id.startsWith('rail.low')) continue;
  const n = Math.floor(len / cov.railScrewSpacing);
  const zSign = r.piece.center[2] > -HALF ? -1 : 1;
  for (let i = 0; i <= n; i++) {
    screws.push({
      id: `${r.id}.s${i}`,
      tag: 'rails',
      long: false,
      space: { kind: 'world' },
      at: [r.piece.center[0] - len / 2 + i * cov.railScrewSpacing, r.piece.center[1], r.piece.center[2] - (zSign * railT) / 2],
      axis: [0, 0, zSign],
    });
  }
}

// เชือกรัดหลังคา + หมุดตะขอ
{
  const rr = cov.roofRope;
  for (let b = 1; b < L.frameCount; b++) {
    const x = (D.frameX(b) + D.frameX(b + 1)) / 2;
    const zN = rr.hookOut;
    const zS = -W - rr.hookOut;
    markers.push({ id: `hook.${b}.n`, tag: 'roof-ropes', label: '', at: gx(x, zN), kind: 'hook' });
    markers.push({ id: `hook.${b}.s`, tag: 'roof-ropes', label: '', at: gx(x, zS), kind: 'hook' });
    const lift = 18;
    const pathN: V2[] = [
      [-rr.hookOut, groundY(x, zN)],
      [-hw - railT - lift, D.lowTubeY],
      [-hw - railT - lift, D.shoulderTubeY + SQ / 2],
      [-hw, roofTopY(-hw) + lift],
      [HALF, RIDGE_TUBE.y + SQ / 2 + lift],
    ];
    const full = [...pathN, ...pathN.slice(0, -1).reverse().map(mirror)];
    ropes.push({ id: `roofRope.${b}`, tag: 'roof-ropes', look: 'roof', part: 'roofRope', points: full.map((p) => [x, p[1], -p[0]] as V3) });
  }
}

// ─────────────────────────── พื้นและชั้นวาง ───────────────────────────
export const FLOOR = (() => {
  const fl = SPEC.floor;
  // แถวกล่อง: หาเส้นกึ่งกลางของแต่ละแถวกล่อง (แถวคู่ = 2 แถวกล่อง)
  let u = 0;
  const boxRows: { u0: number; u1: number }[] = [];
  const walk: { u0: number; u1: number }[] = [];
  for (const seg of fl.rows) {
    if (seg.kind === 'row') {
      const each = seg.size / seg.boxes;
      for (let i = 0; i < seg.boxes; i++) boxRows.push({ u0: u + i * each, u1: u + (i + 1) * each });
    }
    if (seg.kind === 'walk') walk.push({ u0: u, u1: u + seg.size });
    u += seg.size;
  }
  const stackX = Array.from({ length: fl.stacks.perLine }, (_, i) => fl.stacks.firstFromFrame1 + i * fl.stacks.spacing);
  const blockT = ASSUMED.blockThickness;
  const stacks = boxRows.flatMap((r, ri) =>
    stackX.map((x) => ({ id: `stack.${ri}.${x}`, x, u: (r.u0 + r.u1) / 2, ground: groundY(x, -(r.u0 + r.u1) / 2) })),
  );
  const beamTop = fl.stacks.blocks * blockT + WIDE;
  const beams = boxRows.flatMap((r, ri) =>
    [-1, 1].map((s) => ({
      id: `beam.${ri}.${s}`,
      x0: fl.beam.endFromFrame,
      x1: lastX - fl.beam.endFromFrame,
      u: (r.u0 + r.u1) / 2 + (s * fl.beam.spacing) / 2,
    })),
  );
  const boxX0 = (lastX - fl.foamBox.perRow * fl.foamBox.length) / 2;
  const foam = boxRows.flatMap((r, ri) =>
    Array.from({ length: fl.foamBox.perRow }, (_, i) => ({
      id: `foam.${ri}.${i}`,
      x: boxX0 + (i + 0.5) * fl.foamBox.length,
      u: (r.u0 + r.u1) / 2,
    })),
  );
  return { boxRows, walk, stackX, stacks, beams, beamTop, blockT, foam, totalRows: u };
})();

// ─────────────────────────── ผลลัพธ์ ───────────────────────────
export const MEMBERS: Member[] = [...planes, ...boxes];
export const JOINTS: Joint[] = joints;
export const SCREWS: Screw[] = screws;
export const SHEETS: Sheet[] = sheets;
export const ROPES: Rope[] = ropes;
export const MARKERS: Marker[] = markers;
export const MEMBER_BY_ID = new Map(MEMBERS.map((m) => [m.id, m]));

/** จุดกึ่งกลางรู (พิกัดโลก ท่าตั้งโครง) */
export function holeWorld(memberId: string, index: number): { at: V3; axis: V3 } {
  const m = MEMBER_BY_ID.get(memberId);
  if (!m) throw new Error(`ไม่มีชิ้น ${memberId}`);
  if (m.kind === 'plane') {
    const h = m.holes[index];
    if (!h) throw new Error(`${memberId} ไม่มีรูที่ ${index}`);
    const space = frameSpace(m.frame);
    return { at: toWorld(space, planeToLocal(h, (m.a[0] + m.a[1]) / 2)), axis: dirToWorld(space, [1, 0, 0]) };
  }
  const h = m.holes[index];
  if (!h) throw new Error(`${memberId} ไม่มีรูที่ ${index}`);
  return { at: toWorld(m.space, h.at), axis: dirToWorld(m.space, h.axis) };
}

export function jointWorld(j: Joint): { at: V3; axis: V3 } {
  return { at: toWorld(j.space, j.at), axis: dirToWorld(j.space, j.axis) };
}

/** สรุปจำนวนน็อตที่ใช้จริงตามแบบ */
export function boltCounts(): Record<BoltKind, number> {
  const c: Record<BoltKind, number> = { M8x50: 0, 'M8x50-8.8': 0, M8x70: 0, 'M8x70-8.8': 0 };
  for (const j of JOINTS) c[j.bolt]++;
  return c;
}


