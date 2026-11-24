/** ตรวจข้อมูลแอนิเมชันให้ตรงกับขั้นตอน (กันพิมพ์ id ผิดตอนแก้ไฟล์) */
import { JOINTS, RAILS } from '../data/geometry';
import { STEPS } from '../data/steps';
import { CALLOUTS, DIMS, HOSES, SPRINGS, TAG_DIMS } from './notes';
import { NUDGE } from './config';
import { PARTS } from '../data/parts';
import { PART_STEPS } from '../data/usage';
import { ANIM } from './state';
import { FINAL, boltsAt, enteringAt, leavingAt, poseChangesAt, sceneAt } from './sceneState';
import { buildTimeline } from './timeline';

const stepIds = new Set(STEPS.map((s) => s.id));

describe('แอนิเมชัน', () => {
  it('ป้ายชี้จุดและเส้นวัดอ้าง id ของขั้นที่มีจริง', () => {
    for (const id of [...Object.keys(CALLOUTS), ...Object.keys(DIMS)]) expect(stepIds.has(id), id).toBe(true);
  });

  it('ตำแหน่งป้ายและเส้นวัดเป็นตัวเลขจริง', () => {
    const pts = [
      ...Object.values(CALLOUTS).flatMap((cs) => cs.map((c) => c.at)),
      ...[...Object.values(DIMS), ...Object.values(TAG_DIMS)].flatMap((ds) => ds.flatMap((d) => [d.from, d.to])),
    ];
    for (const p of pts) for (const v of p) expect(Number.isFinite(v)).toBe(true);
  });

  it('ทุกขั้นสร้างไทม์ไลน์ได้ ยาวไม่เกิน 30 วินาที', () => {
    for (let i = 0; i <= FINAL; i++) {
      const tl = buildTimeline(i);
      const d = tl.duration();
      tl.kill();
      expect(d, STEPS[i]?.id ?? 'summary').toBeGreaterThan(1);
      expect(d, STEPS[i]?.id ?? 'summary').toBeLessThan(30);
    }
  });

  it('น็อตที่ซูมเป็นน็อตที่ปรากฏในขั้นนั้น หรือเป็นขั้นขันแน่น', () => {
    for (let i = 0; i < STEPS.length; i++) {
      const s = STEPS[i];
      if (!s.zoom || s.anim === 'tighten') continue;
      const ids = new Set(boltsAt(i).map((j) => j.id));
      for (const z of s.zoom) expect(ids.has(z), `${s.id} ${z}`).toBe(true);
    }
  });

  it('น็อตที่ขันแน่นมีอยู่แล้วก่อนขั้นนั้น', () => {
    STEPS.forEach((s, i) => {
      if (s.anim !== 'tighten') return;
      const before = sceneAt(i - 1).visible;
      for (const z of s.zoom ?? []) {
        const j = JOINTS.find((x) => x.id === z)!;
        expect(before.has(j.tag), z).toBe(true);
      }
    });
  });

  it('ระยะ 0–3: ทุกขั้นที่มี add มีของปรากฏใหม่ และโครงไม่เปลี่ยนท่า', () => {
    STEPS.forEach((s, i) => {
      if (s.phase > 3) return;
      if (s.add?.length) expect(enteringAt(i).length, s.id).toBeGreaterThan(0);
      expect(poseChangesAt(i), s.id).toEqual([]);
    });
  });

  it('ข้อมูลแอนิเมชันระยะ 4–7 อ้างขั้นและรางที่มีจริง', () => {
    for (const id of [...Object.keys(HOSES), ...Object.keys(SPRINGS), ...Object.keys(NUDGE)]) expect(stepIds.has(id), id).toBe(true);
    const rails = new Set(RAILS.map((r) => r.id));
    for (const ids of Object.values(SPRINGS)) {
      expect(ids.length).toBeGreaterThan(0);
      for (const r of ids) expect(rails.has(r), r).toBe(true);
    }
  });

  it('ขั้นที่หายไปเล่นแอนิเมชันออก และไม่หายซ้ำในขั้นถัดไป', () => {
    for (let i = 1; i <= FINAL; i++) {
      const leaving = leavingAt(i);
      const before = sceneAt(i - 1).visible;
      for (const t of leaving) expect(before.has(t), `${STEPS[i]?.id} ${t}`).toBe(true);
      for (const t of leavingAt(i + 1)) expect(leaving.includes(t), t).toBe(false);
    }
  });

  it('ระยะ 4: โครง 5 ตั้งก่อนโครง 2, 3, 4', () => {
    const i = STEPS.findIndex((s) => s.id === 'step-4-5');
    const tl = buildTimeline(i);
    const starts = tl
      .getChildren()
      .filter((c) => (c as gsap.core.Tween).targets?.()[0] === ANIM.pose)
      .map((c) => ({ frame: Object.keys((c as gsap.core.Tween).vars).find((k) => /^\d$/.test(k)), at: c.startTime() }))
      .sort((a, b) => a.at - b.at)
      .map((x) => x.frame);
    tl.kill();
    expect(starts).toEqual(['5', '2', '3', '4']);
  });

  it('การ์ดชิ้นส่วน: ทุกชิ้นในตารางมีขั้นที่ใช้', () => {
    const unused = Object.keys(PARTS).filter((p) => !PART_STEPS[p]?.length);
    expect(unused).toEqual([]);
  });

  it('ระยะ 4: ตั้งโครงทั้ง 5 จากท่านอน', () => {
    const frames = STEPS.flatMap((_, i) => poseChangesAt(i).map((c) => c.frame)).sort();
    expect(frames).toEqual([1, 2, 3, 4, 5]);
  });
});
