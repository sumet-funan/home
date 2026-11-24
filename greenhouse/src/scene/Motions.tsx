/**
 * การเคลื่อนไหวเฉพาะชิ้น: บานประตูเปิด-ปิด (ขั้น 5-3) และม่านม้วนขึ้น (ขั้น 6-6)
 * ทำงานเฉพาะตอนขั้นที่มีแอนิเมชันนั้นกำลังเล่น นอกนั้นชิ้นอยู่ตำแหน่งจริง
 */
import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DOOR, SHEETS } from '../data/geometry';
import { SPEC } from '../data/spec';
import { ANIM, easeInOut, seg } from '../anim/state';

/** มุมเปิดประตูสูงสุดตอนสาธิต (ภาพประกอบ) */
const DOOR_OPEN_DEG = 75;
const hinge = new THREE.Vector3(DOOR.xF, 0, -DOOR.leafU0);

/** บานพับอยู่เสาประตูด้านเหนือ บานเปิดออกด้านนอก (ไปทางตะวันตก) */
export function DoorSwing({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const a = ANIM.stepAnim === 'door' ? -Math.sin(Math.PI * seg(ANIM.special, 0, 1)) * THREE.MathUtils.degToRad(DOOR_OPEN_DEG) : 0;
    g.rotation.y = a;
    // หมุนรอบแกนบานพับ
    g.position.set(hinge.x - (hinge.x * Math.cos(a) + hinge.z * Math.sin(a)), 0, hinge.z - (-hinge.x * Math.sin(a) + hinge.z * Math.cos(a)));
  });
  return <group ref={ref}>{children}</group>;
}

// ม่านฝั่งเหนือ: ในแบบม้วนขึ้นอยู่ใต้ท่อไหล่ — ตอนสาธิตเริ่มจากปล่อยลงแล้วม้วนขึ้น
const curtainN = SHEETS.find((s) => s.id === 'curtain.n')!;
const meshN = SHEETS.find((s) => s.id === 'mesh.n')!;
const ys = (poly: [number, number][]) => poly.map((p) => p[1]);
const upBottom = Math.min(...ys(curtainN.poly));
const top = Math.max(...ys(curtainN.poly));
/** ตอนปล่อยลง ขอบล่างอยู่สูงจากดินเท่าม่านฝั่งใต้ (เหมือน geometry.ts) */
const downBottom = Math.min(...ys(meshN.poly)) + SPEC.cover.sideMesh.buried + 100;

/** 1 = ปล่อยลงสุด · 0 = ม้วนขึ้น (ตามแบบ) */
const rolledDown = () => (ANIM.stepAnim === 'rollCurtain' ? 1 - easeInOut(seg(ANIM.special, 0.1, 0.6)) : 0);

/** แผ่นม่าน: ยืดลงจากขอบบน */
export function CurtainSheet({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const r = rolledDown();
    const s = (top - upBottom + r * (upBottom - downBottom)) / (top - upBottom);
    g.scale.set(1, s, 1);
    g.position.set(0, top * (1 - s), 0);
  });
  return <group ref={ref}>{children}</group>;
}

/** ท่อม้วน: เลื่อนตามขอบล่างม่าน */
export function CurtainPipe({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.position.y = -rolledDown() * (upBottom - downBottom);
  });
  return <group ref={ref}>{children}</group>;
}
