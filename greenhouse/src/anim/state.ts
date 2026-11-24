/**
 * ค่าที่ไทม์ไลน์ GSAP ปรับทุกเฟรม — ฉาก 3 มิติอ่านค่าเหล่านี้ใน useFrame
 * (ไม่ผ่าน React state เพื่อไม่ให้ render ใหม่ทุกเฟรม)
 */
import type { FramePose } from '../data/geometry';

export interface CamProxy {
  px: number;
  py: number;
  pz: number;
  tx: number;
  ty: number;
  tz: number;
}

export const ANIM = {
  /** ป้ายที่กำลังปรากฏ → ความคืบหน้า 0..1 (ป้ายที่ไม่อยู่ในนี้ถือว่าเสร็จแล้ว = 1) */
  enter: {} as Record<string, number>,
  /** น็อตที่กำลังใส่ (id ของ joint) → 0..1 */
  bolts: {} as Record<string, number>,
  /** น็อตที่กำลังขันแน่น → 0..1 */
  tighten: {} as Record<string, number>,
  /** โครงที่กำลังเปลี่ยนท่า → 0..1 */
  pose: {} as Record<number, number>,
  /** ท่าเดิมของโครงที่กำลังเปลี่ยนท่า */
  poseFrom: {} as Record<number, FramePose>,
  /** แอนิเมชันพิเศษของขั้น 0..1 */
  special: 0,
  /** ป้ายชี้จุด (callout) 0..1 */
  callout: 0,
  /** กล้อง (เมตร) — ไทม์ไลน์ปรับค่า แล้ว CameraRig นำไปใช้ */
  cam: { px: -6.5, py: 5.2, pz: 6.5, tx: 3, ty: 0.9, tz: -1.5 } as CamProxy,
  /** true = ไทม์ไลน์คุมกล้อง · false = ผู้ใช้หมุนกล้องเอง */
  camDriven: true,
  /** สัดส่วนจอ (กว้าง/สูง) ใช้ถอยกล้องบนจอแนวตั้ง */
  aspect: 1.6,
};

export const enterOf = (tag: string) => ANIM.enter[tag] ?? 1;
export const boltOf = (id: string) => ANIM.bolts[id] ?? 1;

export function resetAnim() {
  ANIM.enter = {};
  ANIM.bolts = {};
  ANIM.tighten = {};
  ANIM.pose = {};
  ANIM.poseFrom = {};
  ANIM.special = 0;
  ANIM.callout = 0;
}

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
/** ส่วนของ t ในช่วง [a, b] → 0..1 */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
