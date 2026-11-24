/**
 * ชิ้นส่วนแต่ละชนิดถูกใช้ในขั้นไหนบ้าง (สำหรับการ์ดชิ้นส่วน) — คำนวณจาก steps.ts และ geometry.ts
 */
import { JOINTS, MEMBERS, RAILS, ROPES, SCREWS, SHEETS, type BoltKind } from './geometry';
import type { PartId } from './parts';
import { STEPS } from './steps';

const BOLT_PART: Record<BoltKind, PartId> = {
  M8x50: 'boltM8x50',
  'M8x50-8.8': 'boltM8x50g88',
  M8x70: 'boltM8x70',
  'M8x70-8.8': 'boltM8x70g88',
};

/** ป้ายในฉากที่ไม่ได้มาจากชิ้นใน geometry แต่เป็นวัสดุในตาราง */
const EXTRA: Record<string, PartId[]> = {
  'pads-main': ['concrete'],
  'concrete-main': ['concrete'],
  'gable-pits': ['concrete'],
  'gable-concrete': ['concrete'],
  stacks: ['block'],
  'shelf-beams': ['shelfBeam'],
  'foam-boxes': ['foamBox'],
};

const TAG_PARTS = new Map<string, Set<PartId>>();
const add = (tag: string, part: PartId | undefined) => {
  if (!part) return;
  if (!TAG_PARTS.has(tag)) TAG_PARTS.set(tag, new Set());
  TAG_PARTS.get(tag)!.add(part);
};
MEMBERS.forEach((m) => add(m.tag, m.part));
SHEETS.forEach((s) => add(s.tag, s.part));
ROPES.forEach((r) => add(r.tag, r.part));
JOINTS.forEach((j) => add(j.tag, BOLT_PART[j.bolt]));
SCREWS.forEach((s) => add(s.tag, 'screw'));
RAILS.forEach((r) => add(r.tag, 'railLock'));
Object.entries(EXTRA).forEach(([tag, parts]) => parts.forEach((p) => add(tag, p)));

/** PartId → index ของขั้นที่ใช้ชิ้นนั้น (เรียงตามลำดับขั้น) */
export const PART_STEPS: Record<string, number[]> = {};
STEPS.forEach((s, i) => {
  const parts = new Set<PartId>();
  (s.add ?? []).forEach((t) => TAG_PARTS.get(t)?.forEach((p) => parts.add(p)));
  // ขั้นที่ซูมน็อตที่มีอยู่แล้ว (เช่น ขันให้แน่น) นับว่าใช้น็อตชนิดนั้นด้วย
  (s.zoom ?? []).forEach((id) => {
    const j = JOINTS.find((x) => x.id === id);
    if (j) parts.add(BOLT_PART[j.bolt]);
  });
  parts.forEach((p) => (PART_STEPS[p] ??= []).push(i));
});
// หน้าสรุป (index = STEPS.length) วางกล่องโฟมบนชั้นวาง
TAG_PARTS.get('foam-boxes')?.forEach((p) => (PART_STEPS[p] ??= []).push(STEPS.length));
