/**
 * ป้ายชี้จุด (callout) และเส้นวัดระยะ (dim) ที่ขึ้นในแต่ละขั้น
 *
 * - ตำแหน่งคำนวณจาก geometry.ts ทั้งหมด (พิกัดโลก มม.)
 * - ข้อความใช้ตัวเลขจากสเปกเท่านั้น
 * - เพิ่มป้ายให้ขั้นใด: เพิ่มรายการใน CALLOUTS / DIMS โดยใช้ id ของขั้น
 */
import * as THREE from 'three';
import { D, LAYOUT_POINTS, PITS, SHAPES, frameMatrix, planeToLocal, type FramePose, type V2, type V3 } from '../data/geometry';
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
const hw = SPEC.section.rect.wide / 2;
const lowTubeHole = D.postHole('lowTube');
const purlinHole = D.rafterHole('purlin');
const apex: V2 = [D.HALF, L.ridgeHeight];
const LAST = D.frameX(L.frameCount);

export const CALLOUTS: Record<string, Callout[]> = {
  'step-0-1': [{ at: [-300, 2900, 400], text: 'โครง 1 อยู่ด้านตะวันออก นับไปถึงโครง 5 ทางตะวันตก' }],
  'step-1-2': [{ at: lift(LAYOUT_POINTS.A, 400), text: 'หมุด = จุดกึ่งกลางเสา' }],
  'step-1-5': [{ at: [LAST / 2, 300, -D.HALF], text: `A–E = B–D คลาดไม่เกิน ${SPEC.layout.check.diagonalTol / 10} ซม.` }],
  'step-2-1': [{ at: lift(LAYOUT_POINTS.A, 350), text: 'หมุดอยู่กลางหลุม' }],
  'step-2-3': [{ at: lift(LAYOUT_POINTS.A, 300), text: `คอนกรีตรองก้นหนา ${SPEC.footing.pad / 10} ซม. ทิ้งไว้ 1 คืน` }],
  'step-3-3': [
    { at: slab([-hw, D.H - 120], 20), text: 'ขอบตรงแผ่นประกับเสมอผิวนอกเสา' },
    { at: slab(lowTubeHole, 20), text: `รูเยื้อง ${thai(SPEC.post.holes.lowTube)} ชิดขอบด้านใน`, warn: true },
    { at: slab(purlinHole, 20), text: `รูเยื้อง ${thai(SPEC.rafter.holes.purlin)} ชิดขอบด้านใน`, warn: true },
    { at: slab(apex, 20), text: 'ปลายตัดดิ่งชนกันที่สัน' },
  ],
  'step-3-4': [{ at: slab([0, D.H + 60], 60), text: 'หัวน็อตอยู่ด้านบน แหวนทั้งหัวและท้าย ขันมือ' }],
  'step-3-7': [{ at: slab(SHAPES.tieHoles[1], 60), text: 'รูที่ 2: ขีดตามรูจริง แล้วเจาะ 8.5 มม.' }],
  'step-3-8': [{ at: slab(SHAPES.braceHoles[1], 60), text: 'รูที่ 2: ขีดแนวกึ่งกลางผ่านรู 576 แล้วเจาะ 8.5 มม.' }],
  'step-3-9': [{ at: slab([D.HALF, D.foldY], 90), text: 'รอยพับอยู่บนสุด ขานอนชี้ขึ้นฟ้า' }],
  'step-3-10': [{ at: slab([0, 500], 60), text: 'เขียนบนด้านที่มีคานรัด = ด้าน "ใน"' }],
  'step-3-11': [{ at: slab(apex, 600), text: 'ทุกโครงหงายด้านเดียวกัน ขอบตรงกัน คลาดไม่เกิน 5 มม.' }],
};

/** หลุมที่หมุด A (ดินสูงสุด) ใช้แสดงตัวอย่างความลึก */
const pitA = PITS.find((p) => p.x === 0 && p.z === 0)!;

export const DIMS: Record<string, Dim[]> = {
  'step-0-4': [{ from: [-3500, 140, 2400], to: [-1700, 140, 2400], label: 'วัดสุ่ม 3 ชิ้นต่อแบบ คลาดไม่เกิน 3 มม.' }],
  'step-1-6': Array.from({ length: L.frameCount - 1 }, (_, i) => ({
    from: [D.frameX(i + 1), 120, 250] as V3,
    to: [D.frameX(i + 2), 120, 250] as V3,
    label: m2(L.bay),
  })),
  'step-3-5': [
    { from: slab([0, D.postBottom], 30), to: slab([D.W, D.postBottom], 30), label: m2(D.W) },
    { from: slab([0, D.postBottom], 40), to: slab(apex, 40), label: 'ซ้าย' },
    { from: slab([D.W, D.postBottom], 40), to: slab(apex, 40), label: '= ขวา' },
  ],
  'step-3-8': [{ from: slab(SHAPES.braceHoles[0], 70), to: slab(SHAPES.braceHoles[1], 70), label: `≈ ${thai(SPEC.cornerBrace.check.holeSpacing)} มม.` }],
  'step-4-8': [
    { from: [0, D.H, 0], to: [LAST, D.H, -D.W], label: m2(SPEC.layout.check.diagonal) },
    { from: [0, D.H, -D.W], to: [LAST, D.H, 0], label: m2(SPEC.layout.check.diagonal) },
  ],
};

/** เส้นวัดที่แสดงตลอดเวลาที่ป้ายนั้นปรากฏ */
export const TAG_DIMS: Record<string, Dim[]> = {
  'pit-depth': [
    {
      from: [pitA.x + 125, pitA.ground - pitA.depth, pitA.z - 125],
      to: [pitA.x + 125, pitA.ground, pitA.z - 125],
      label: `ลึก ${(pitA.depth / 10).toFixed(0)} ซม. = ${SPEC.footing.depthBase / 10} + ${(pitA.ground / 10).toFixed(0)}`,
    },
  ],
};
