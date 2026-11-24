/** ตรวจข้อมูลแอนิเมชันให้ตรงกับขั้นตอน (กันพิมพ์ id ผิดตอนแก้ไฟล์) */
import { JOINTS } from '../data/geometry';
import { STEPS } from '../data/steps';
import { CALLOUTS, DIMS, TAG_DIMS } from './notes';
import { FINAL, boltsAt, enteringAt, poseChangesAt, sceneAt } from './sceneState';
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

  it('ระยะ 4: ตั้งโครงทั้ง 5 จากท่านอน', () => {
    const frames = STEPS.flatMap((_, i) => poseChangesAt(i).map((c) => c.frame)).sort();
    expect(frames).toEqual([1, 2, 3, 4, 5]);
  });
});
