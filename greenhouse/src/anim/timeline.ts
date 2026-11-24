/**
 * สร้างไทม์ไลน์ GSAP ของแต่ละขั้นจากข้อมูลใน steps.ts
 *
 * ลำดับในหนึ่งขั้น:
 *   1. กล้องเลื่อนไปมุมของขั้น · ของที่ไม่ใช้แล้วค่อย ๆ หายไป
 *   2. โครงเปลี่ยนท่า (ยกตั้ง) ทีละโครง ตามด้วยไม้ค้ำ/อิฐของโครงนั้น
 *   3. ชิ้นใหม่ปรากฏ (ลอยจากกองวัสดุ / หล่น / ขุด / เท / คลี่ / ลากเส้น) ทีละกลุ่ม
 *   4. โครงเลื่อนเข้าตำแหน่งจริง (ถ้ามี) · แอนิเมชันพิเศษของขั้น
 *   5. ซูมเข้าน็อตทีละจุด → เสียบน็อต ใส่แหวน ขันตัวเมีย
 *   6. ถอยกล้องกลับ → ป้ายชี้จุดและเส้นวัดระยะ → ค้างภาพให้อ่าน
 */
import gsap from 'gsap';
import * as THREE from 'three';
import { JOINTS, MEMBERS, SCREWS, type FramePose, type Joint, type V3 } from '../data/geometry';
import { CAMERAS, STEPS, type CameraView } from '../data/steps';
import { LEAVE, NUDGE, NUDGE_DURATION, TIMING, ZOOM_CLUSTER, ZOOM_DISTANCE, enterMode } from './config';
import { ANIM, resetAnim, type CamProxy } from './state';
import { CALLOUTS, DIMS } from './notes';
import { FINAL, boltsAt, enteringAt, jointCenter, leavingAt, poseChangesAt, sceneAt, tightenAt } from './sceneState';

const JOINT_BY_ID = new Map(JOINTS.map((j) => [j.id, j]));
const SOLID_TAGS = new Set([...MEMBERS.map((m) => m.tag), ...SCREWS.map((s) => s.tag)]);

/**
 * แอนิเมชันพิเศษ (วินาที)
 * - at: เล่นหลังชิ้นใหม่ปรากฏ หรือก่อนใส่น็อตจุดสุดท้าย
 * - after: ป้ายที่รอให้แอนิเมชันพิเศษจบก่อนจึงปรากฏ
 * - leaveAfter: ของที่หายไปในขั้นนี้ รอให้แอนิเมชันพิเศษจบก่อน
 */
export const SPECIAL: Partial<Record<string, { duration: number; at: 'afterEnter' | 'lastStop'; after?: string[]; leaveAfter?: boolean }>> = {
  // ขีดระดับขึ้นหลังน้ำในสายยางนิ่งแล้ว
  waterLevel: { duration: 5.5, at: 'afterEnter', after: ['level-marks'] },
  markDrill: { duration: 2.6, at: 'lastStop' },
  gablePost: { duration: 2.6, at: 'lastStop' },
  shimLevel: { duration: 5, at: 'afterEnter' },
  plumb: { duration: 5, at: 'afterEnter' },
  mixConcrete: { duration: 5.5, at: 'afterEnter' },
  // ถอดไม้ค้ำหลังบ่มครบ 3 วัน
  cure: { duration: 6, at: 'afterEnter', leaveAfter: true },
  door: { duration: 3.5, at: 'afterEnter' },
  springLock: { duration: 3.5, at: 'afterEnter' },
  roofPlastic: { duration: 3.5, at: 'afterEnter' },
  rollCurtain: { duration: 5, at: 'afterEnter' },
};
const TIGHTEN_DURATION = 2.6;
/** หน้าสรุป: หมุนกล้องรอบโรงเรือน 1 รอบ */
const ORBIT_DURATION = 16;

/** จอแนวตั้งถอยกล้องออกให้เห็นทั้งภาพ */
const distanceFactor = () => Math.min(2, Math.max(1, Math.sqrt(1.5 / ANIM.aspect)));

export function viewOf(cam: CameraView): CamProxy {
  const t = new THREE.Vector3(...cam.target);
  const p = new THREE.Vector3(...cam.pos).sub(t).multiplyScalar(distanceFactor()).add(t);
  return { px: p.x / 1000, py: p.y / 1000, pz: p.z / 1000, tx: t.x / 1000, ty: t.y / 1000, tz: t.z / 1000 };
}

function zoomView(center: V3, base: CameraView): CamProxy {
  const dir = new THREE.Vector3(...base.pos).sub(new THREE.Vector3(...base.target)).normalize();
  const p = new THREE.Vector3(...center).addScaledVector(dir, ZOOM_DISTANCE * distanceFactor());
  return { px: p.x / 1000, py: p.y / 1000, pz: p.z / 1000, tx: center[0] / 1000, ty: center[1] / 1000, tz: center[2] / 1000 };
}

export const stepCamera = (idx: number): CameraView => CAMERAS[STEPS[idx]?.camera ?? 'overview'];

/** รวมน็อตที่อยู่ใกล้กันเป็นจุดซูมเดียว */
function zoomStops(ids: string[], poses: Record<number, FramePose>) {
  const stops: { center: V3; joints: Joint[] }[] = [];
  for (const id of ids) {
    const j = JOINT_BY_ID.get(id);
    if (!j) continue;
    const c = jointCenter(j, poses);
    const near = stops.find((s) => Math.hypot(s.center[0] - c[0], s.center[1] - c[1], s.center[2] - c[2]) < ZOOM_CLUSTER);
    if (near) {
      near.joints.push(j);
      const n = near.joints.length;
      near.center = near.center.map((v, i) => (v * (n - 1) + c[i]) / n) as V3;
    } else stops.push({ center: c, joints: [j] });
  }
  return stops;
}

/** จัดกลุ่มป้ายที่ปรากฏพร้อมกัน (ขั้นทำซ้ำโครง: ทั้งโครงมาพร้อมกัน) */
function groupTags(tags: string[], byFrame: boolean): string[][] {
  if (!byFrame) return tags.map((t) => [t]);
  const groups = new Map<string, string[]>();
  for (const t of tags) {
    const key = /^f\d:/.test(t) ? t.slice(0, 2) : t;
    groups.set(key, [...(groups.get(key) ?? []), t]);
  }
  return [...groups.values()];
}

const enterDuration = (tag: string) => {
  const mode = enterMode(tag);
  if (mode === 'none') return 0.01;
  if (mode === 'pour') return TIMING.fly + TIMING.groupSpread * 1.5;
  if (mode === 'unroll') return TIMING.fly * 1.3;
  return mode === 'fly' ? TIMING.fly : TIMING.fly + TIMING.groupSpread * 0.5;
};

export function buildTimeline(idx: number): gsap.core.Timeline {
  resetAnim();
  const tl = gsap.timeline({ paused: true });
  const step = STEPS[idx];
  const poses = sceneAt(idx).poses;
  const base = stepCamera(idx);
  const special = step?.anim ? SPECIAL[step.anim] : undefined;
  ANIM.camDriven = true;
  ANIM.stepAnim = step?.anim ?? (idx >= FINAL ? 'final' : '');
  tl.to(ANIM.cam, { ...viewOf(base), duration: TIMING.cam, ease: 'power2.inOut' }, 0);
  let t = TIMING.cam * 0.6;

  // 1. ของที่ไม่ใช้แล้วหายไป
  const leaving = leavingAt(idx);
  leaving.forEach((tag) => (ANIM.leave[tag] = 0));
  const playLeave = (at: number) => leaving.forEach((tag, k) => tl.to(ANIM.leave, { [tag]: 1, duration: LEAVE.duration, ease: 'none' }, at + k * 0.08));
  if (!special?.leaveAfter) playLeave(LEAVE.start);

  // ชิ้นที่เลื่อนจากตำแหน่งจริงชั่วคราว
  const nudge = step ? NUDGE[step.id] : undefined;
  if (nudge) {
    ANIM.nudge = nudge.frames;
    ANIM.nudgeK = 1;
  }

  // 2. โครงเปลี่ยนท่า ตามลำดับในสเปก (ลำดับไม้ค้ำใน add) แล้วไม้ค้ำ/อิฐของโครงนั้นตามมา
  const entering = enteringAt(idx);
  const order = (f: number) => {
    const i = step?.add?.indexOf(`temp-${f}`) ?? -1;
    return i < 0 ? 100 + f : i;
  };
  const changes = poseChangesAt(idx).sort((a, b) => order(a.frame) - order(b.frame));
  const withFrame = new Set<string>();
  const poseGap = TIMING.pose * 0.7;
  changes.forEach(({ frame, from }, k) => {
    const start = t + k * poseGap;
    ANIM.pose[frame] = 0;
    ANIM.poseFrom[frame] = from;
    tl.to(ANIM.pose, { [frame]: 1, duration: TIMING.pose, ease: 'none' }, start);
    for (const tag of [`temp-${frame}`, `bricks-${frame}`]) {
      if (!entering.includes(tag)) continue;
      withFrame.add(tag);
      ANIM.enter[tag] = 0;
      tl.to(ANIM.enter, { [tag]: 1, duration: TIMING.fly * 0.8, ease: 'none' }, start + TIMING.pose * 0.85);
    }
  });
  if (changes.length) t += (changes.length - 1) * poseGap + TIMING.pose + (withFrame.size ? TIMING.fly * 0.7 : 0);

  // 3. ชิ้นใหม่ปรากฏ
  const later = new Set(special?.after ?? []);
  const hasBoltAnim = !!step?.zoom;
  const main = entering
    .filter((tag) => !later.has(tag) && !withFrame.has(tag))
    .filter((tag) => !(hasBoltAnim && !SOLID_TAGS.has(tag) && JOINTS.some((j) => j.tag === tag)));
  const groups = groupTags(main, step?.anim === 'repeatFrames');
  let enterEnd = t;
  groups.forEach((g, k) => {
    const start = t + k * TIMING.flyStagger;
    for (const tag of g) {
      ANIM.enter[tag] = 0;
      const d = enterDuration(tag);
      tl.to(ANIM.enter, { [tag]: 1, duration: d, ease: 'none' }, start);
      enterEnd = Math.max(enterEnd, start + d);
    }
  });
  t = enterEnd;

  // 4. โครงเลื่อนเข้าตำแหน่งจริง แล้วแอนิเมชันพิเศษ
  if (nudge?.mode === 'settle') {
    tl.to(ANIM, { nudgeK: 0, duration: NUDGE_DURATION, ease: 'power2.inOut' }, t);
    t += NUDGE_DURATION;
  }
  if (special?.at === 'afterEnter') {
    tl.to(ANIM, { special: 1, duration: special.duration, ease: 'none' }, t);
    t += special.duration;
  }
  const deferred = entering.filter((tag) => later.has(tag));
  deferred.forEach((tag) => {
    ANIM.enter[tag] = 0;
    tl.to(ANIM.enter, { [tag]: 1, duration: enterDuration(tag), ease: 'none' }, t - 0.6);
  });
  if (deferred.length) t += enterDuration(deferred[0]) - 0.6;
  if (special?.leaveAfter && leaving.length) {
    playLeave(t);
    t += LEAVE.duration + leaving.length * 0.08;
  }

  // 5. ซูมน็อต
  const bolts = boltsAt(idx);
  const boltIds = new Set(bolts.map((j) => j.id));
  const tightenIds = new Set(tightenAt(idx));
  const stops = zoomStops(step?.zoom ?? [], poses);
  const done = new Set<string>();
  // ซูมน็อตของโครงที่นอนบนลาน: ตัวเมียอยู่ใต้โครง → ทำเหล็กและลานโปร่งชั่วคราว
  const underSlab = (stop: { joints: Joint[] }) => stop.joints.some((j) => j.space.kind === 'frame' && poses[j.space.frame]?.kind === 'flat');
  let xrayOn = false;
  stops.forEach((stop, si) => {
    if (underSlab(stop) !== xrayOn) {
      xrayOn = !xrayOn;
      tl.set(ANIM, { autoXray: xrayOn ? 1 : 0 }, t + TIMING.zoom * 0.6);
    }
    tl.to(ANIM.cam, { ...zoomView(stop.center, base), duration: TIMING.zoom, ease: 'power2.inOut' }, t);
    t += TIMING.zoom;
    if (special?.at === 'lastStop' && si === stops.length - 1) {
      tl.to(ANIM, { special: 1, duration: special.duration, ease: 'none' }, t);
      t += special.duration;
    }
    const inStop = stop.joints.filter((j) => boltIds.has(j.id));
    inStop.forEach((j, k) => {
      ANIM.bolts[j.id] = 0;
      tl.to(ANIM.bolts, { [j.id]: 1, duration: TIMING.bolt, ease: 'none' }, t + k * TIMING.boltStagger);
      done.add(j.id);
    });
    if (inStop.length) t += TIMING.bolt + (inStop.length - 1) * TIMING.boltStagger;
    const tight = stop.joints.filter((j) => tightenIds.has(j.id));
    tight.forEach((j) => {
      ANIM.tighten[j.id] = 0;
      tl.to(ANIM.tighten, { [j.id]: 1, duration: TIGHTEN_DURATION, ease: 'none' }, t);
    });
    if (tight.length) t += TIGHTEN_DURATION;
    t += 0.3;
  });

  // น็อตที่ไม่ได้ซูม ใส่พร้อมกันตอนถอยกล้อง
  const rest = bolts.filter((j) => !done.has(j.id));
  rest.forEach((j, k) => {
    ANIM.bolts[j.id] = 0;
    tl.to(ANIM.bolts, { [j.id]: 1, duration: TIMING.boltQuick, ease: 'none' }, t + (k / Math.max(1, rest.length)) * TIMING.boltQuick);
  });
  if (xrayOn) tl.set(ANIM, { autoXray: 0 }, t + TIMING.zoom * 0.4);
  if (stops.length) tl.to(ANIM.cam, { ...viewOf(base), duration: TIMING.zoom, ease: 'power2.inOut' }, t);
  if (stops.length || rest.length) t += Math.max(stops.length ? TIMING.zoom : 0, rest.length ? TIMING.boltQuick * 2 : 0);

  // 6. ป้ายชี้จุดและเส้นวัด
  const id = step?.id ?? '';
  if (CALLOUTS[id] || DIMS[id]) {
    tl.to(ANIM, { callout: 1, duration: 0.9, ease: 'none' }, t);
    t += TIMING.callout;
  } else ANIM.callout = 1;

  // หน้าสรุป: หมุนรอบโรงเรือน 1 รอบ
  if (idx >= FINAL) {
    const v = viewOf(base);
    const orbit = { a: 0 };
    const dx = v.px - v.tx;
    const dz = v.pz - v.tz;
    tl.to(
      orbit,
      {
        a: Math.PI * 2,
        duration: ORBIT_DURATION,
        ease: 'none',
        onUpdate: () => {
          const c = Math.cos(orbit.a);
          const s = Math.sin(orbit.a);
          ANIM.cam.px = v.tx + dx * c - dz * s;
          ANIM.cam.pz = v.tz + dx * s + dz * c;
        },
      },
      t,
    );
    t += ORBIT_DURATION;
  }

  tl.to({}, { duration: TIMING.hold }, t);
  return tl;
}
