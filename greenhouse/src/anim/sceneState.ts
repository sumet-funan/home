/**
 * สถานะฉากของแต่ละขั้น (ต่อยอดจาก stateAt ใน steps.ts) + รายการสิ่งที่ "ปรากฏใหม่" ในขั้นนั้น
 */
import * as THREE from 'three';
import { JOINTS, frameMatrix, type FramePose, type Joint, type V3 } from '../data/geometry';
import { STEPS, finalState, stateAt, type SceneState } from '../data/steps';

/** index ของหน้าสรุป (หลังขั้นสุดท้าย) */
export const FINAL = STEPS.length;

/** ป้าย "preview" ในขั้น 0-1 = โครง 1 ตั้งอยู่ให้ดูชื่อชิ้นส่วน */
const PREVIEW_TAGS = ['posts', 'rafters', 'plates-bottom', 'plates-top', 'plate-bolts', 'tie', 'braces', 'ridge-bracket'].map((k) => `f1:${k}`);

const expand = (tags: string[]) => tags.flatMap((t) => (t === 'preview' ? PREVIEW_TAGS : [t]));

export function sceneAt(idx: number): SceneState {
  const s = idx < 0 ? { visible: new Set<string>(), poses: {} } : idx >= FINAL ? finalState() : stateAt(idx);
  if (s.visible.has('preview')) {
    PREVIEW_TAGS.forEach((t) => s.visible.add(t));
    if (!s.poses[1]) s.poses = { ...s.poses, 1: { kind: 'up' } };
  }
  return s;
}

/** ป้ายที่ปรากฏใหม่ในขั้นนี้ เรียงตามลำดับใน add */
export function enteringAt(idx: number): string[] {
  const now = sceneAt(idx);
  const before = sceneAt(idx - 1);
  const order = idx >= FINAL ? ['foam-boxes'] : expand(STEPS[idx]?.add ?? []);
  return order.filter((t) => now.visible.has(t) && !before.visible.has(t));
}

const samePose = (a: FramePose, b: FramePose) => a.kind === b.kind && (a.kind === 'up' || (b.kind === 'flat' && a.stack === b.stack));

/** โครงที่เปลี่ยนท่าในขั้นนี้ (ไม่นับโครงที่เพิ่งปรากฏ) */
export function poseChangesAt(idx: number): { frame: number; from: FramePose }[] {
  const now = sceneAt(idx).poses;
  const before = sceneAt(idx - 1).poses;
  return Object.keys(now)
    .map(Number)
    .filter((f) => before[f] && !samePose(before[f], now[f]))
    .map((f) => ({ frame: f, from: before[f] }));
}

/** น็อตที่ต้องเล่นการใส่ทีละขั้น (เฉพาะขั้นที่มีจุดซูม) */
export function boltsAt(idx: number): Joint[] {
  const step = STEPS[idx];
  if (!step?.zoom) return [];
  const entering = new Set(enteringAt(idx));
  const zoomFirst = new Map(step.zoom.map((id, i) => [id, i]));
  return JOINTS.filter((j) => entering.has(j.tag)).sort((a, b) => (zoomFirst.get(a.id) ?? 99) - (zoomFirst.get(b.id) ?? 99));
}

/** น็อตที่ต้องเล่นการขันแน่น */
export function tightenAt(idx: number): string[] {
  const step = STEPS[idx];
  return step?.anim === 'tighten' ? (step.zoom ?? []) : [];
}

/** จุดบนแกนน็อต (พิกัดโลก มม.) ตามท่าของโครงในขั้นนั้น */
export function jointPoint(j: Joint, poses: Record<number, FramePose>, along = 0): V3 {
  const A = new THREE.Vector3(...j.axis).normalize();
  const p = new THREE.Vector3(...j.at).addScaledVector(A, along);
  if (j.space.kind === 'frame') p.applyMatrix4(frameMatrix(j.space.frame, poses[j.space.frame] ?? { kind: 'up' }));
  return [p.x, p.y, p.z];
}

/** จุดกลางน็อต (กึ่งกลางความหนาที่หนีบ) */
export const jointCenter = (j: Joint, poses: Record<number, FramePose>) => jointPoint(j, poses, j.grip / 2);
