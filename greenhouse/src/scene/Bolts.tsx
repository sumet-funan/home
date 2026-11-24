/** น็อต M8 แหวน ตัวเมีย และสกรูปลายสว่าน — วาดแบบ instanced ให้ลื่นบนมือถือ */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Joint, Screw } from '../data/geometry';
import { ASSUMED, SPEC } from '../data/spec';
import { ANIM, boltOf, easeInOut, easeOut, seg } from '../anim/state';
import { MAT } from './materials';

const B = ASSUMED.bolt;
const hexR = B.headAcrossFlats / 2 / Math.cos(Math.PI / 6);
const GEO = {
  shank: new THREE.CylinderGeometry(B.shankDia / 2, B.shankDia / 2, 1, 10),
  hex: new THREE.CylinderGeometry(hexR, hexR, 1, 6),
  washer: new THREE.CylinderGeometry(B.washerOD / 2, B.washerOD / 2, 1, 16),
  screwHead: new THREE.CylinderGeometry(ASSUMED.screw.headDia / 2, ASSUMED.screw.headDia / 2, 1, 10),
};
const Y = new THREE.Vector3(0, 1, 0);
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

export interface BoltParts {
  shank: THREE.Matrix4;
  head: THREE.Matrix4;
  washerHead: THREE.Matrix4;
  washerNut: THREE.Matrix4;
  nut: THREE.Matrix4;
}

/** การเลื่อนชิ้นส่วนน็อตระหว่างแอนิเมชัน (มม. ตามแกนน็อต) */
export interface BoltOffsets {
  /** ตัวน็อต+แหวนหัว (ติดลบ = ยังอยู่ฝั่งหัว) */
  bolt: number;
  washer: number;
  nut: number;
  /** มุมหมุนตัวเมีย (เรเดียน) */
  nutRot: number;
}
const NO_OFFSET: BoltOffsets = { bolt: 0, washer: 0, nut: 0, nutRot: 0 };

export const boltLength = (j: Joint) => (j.bolt.startsWith('M8x70') ? SPEC.bolts.long : SPEC.bolts.short);

/** ตำแหน่งชิ้นส่วนน็อตหนึ่งตัว (พิกัดเดียวกับ joint.space) */
export function boltParts(j: Joint, off: BoltOffsets = NO_OFFSET): BoltParts {
  const A = new THREE.Vector3(...j.axis).normalize();
  const at = new THREE.Vector3(...j.at);
  const q = new THREE.Quaternion().setFromUnitVectors(Y, A);
  const qNut = off.nutRot ? q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(Y, off.nutRot)) : q;
  const len = boltLength(j);
  const p = (k: number) => at.clone().addScaledVector(A, k);
  const m = (c: THREE.Vector3, h: number, qq = q) => new THREE.Matrix4().compose(c, qq, new THREE.Vector3(1, h, 1));
  return {
    head: m(p(off.bolt - B.washerT - B.headHeight / 2), B.headHeight),
    washerHead: m(p(off.bolt - B.washerT / 2), B.washerT),
    shank: m(p(off.bolt - B.washerT + len / 2), len),
    washerNut: m(p(off.washer + j.grip + B.washerT / 2), B.washerT),
    nut: m(p(off.nut + j.grip + B.washerT + B.nutHeight / 2), B.nutHeight, qNut),
  };
}

function Instanced({ geo, mat, mats }: { geo: THREE.BufferGeometry; mat: THREE.Material; mats: THREE.Matrix4[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const im = ref.current;
    if (!im) return;
    mats.forEach((m, i) => im.setMatrixAt(i, m));
    im.count = mats.length;
    im.instanceMatrix.needsUpdate = true;
    im.computeBoundingSphere();
  }, [mats]);
  if (mats.length === 0) return null;
  return <instancedMesh ref={ref} args={[geo, mat, mats.length]} castShadow />;
}

export function BoltSet({ joints }: { joints: Joint[] }) {
  const parts = useMemo(() => joints.map((j) => boltParts(j)), [joints]);
  return (
    <>
      <Instanced geo={GEO.shank} mat={MAT.bolt} mats={parts.map((p) => p.shank)} />
      <Instanced geo={GEO.hex} mat={MAT.bolt} mats={[...parts.map((p) => p.head), ...parts.map((p) => p.nut)]} />
      <Instanced geo={GEO.washer} mat={MAT.bolt} mats={[...parts.map((p) => p.washerHead), ...parts.map((p) => p.washerNut)]} />
    </>
  );
}

/**
 * น็อตที่กำลังใส่หรือขัน
 * ใส่: เสียบจากฝั่งหัว → ใส่แหวนฝั่งตัวเมีย → หมุนตัวเมียเข้า
 * ขัน: ตัวเมียหมุนจนแนบ แล้วหมุนเพิ่ม 1/4 รอบ
 */
export function AnimatedBolts({ joints }: { joints: Joint[] }) {
  const shank = useRef<THREE.InstancedMesh>(null);
  const hex = useRef<THREE.InstancedMesh>(null);
  const washer = useRef<THREE.InstancedMesh>(null);
  const last = useRef('');
  const n = joints.length;

  useFrame(() => {
    if (!shank.current || !hex.current || !washer.current) return;
    const key = joints.map((j) => `${boltOf(j.id).toFixed(3)}|${(ANIM.tighten[j.id] ?? 1).toFixed(3)}`).join();
    if (key === last.current) return;
    last.current = key;
    joints.forEach((j, i) => {
      const p = boltOf(j.id);
      const tt = ANIM.tighten[j.id];
      const len = boltLength(j);
      const s = easeInOut(seg(p, 0, 0.4));
      const w = easeOut(seg(p, 0.4, 0.58));
      const nn = seg(p, 0.58, 1);
      let nutRot = (1 - nn) * Math.PI * 8;
      let nutOff = (1 - easeOut(nn)) * 40;
      if (tt !== undefined) {
        // หมุนจนแนบ (ขยับเข้า 2 มม.) แล้วหมุนเพิ่ม 1/4 รอบ
        nutRot = -easeInOut(seg(tt, 0, 0.55)) * Math.PI * 2 - easeInOut(seg(tt, 0.65, 1)) * (Math.PI / 2);
        nutOff = (1 - seg(tt, 0, 0.55)) * 2;
      }
      const parts = boltParts(j, { bolt: -(1 - s) * (len + 60), washer: (1 - w) * 60, nut: nutOff, nutRot });
      const show = p > 0.001;
      shank.current!.setMatrixAt(i, show ? parts.shank : ZERO);
      hex.current!.setMatrixAt(i, show ? parts.head : ZERO);
      hex.current!.setMatrixAt(n + i, p >= 0.58 ? parts.nut : ZERO);
      washer.current!.setMatrixAt(i, show ? parts.washerHead : ZERO);
      washer.current!.setMatrixAt(n + i, p >= 0.4 ? parts.washerNut : ZERO);
    });
    for (const r of [shank, hex, washer]) {
      r.current!.instanceMatrix.needsUpdate = true;
      r.current!.computeBoundingSphere();
    }
  });

  if (n === 0) return null;
  return (
    <>
      <instancedMesh ref={shank} args={[GEO.shank, MAT.boltNew, n]} frustumCulled={false} />
      <instancedMesh ref={hex} args={[GEO.hex, MAT.boltNew, n * 2]} frustumCulled={false} />
      <instancedMesh ref={washer} args={[GEO.washer, MAT.boltNew, n * 2]} frustumCulled={false} />
    </>
  );
}

export function ScrewSet({ screws }: { screws: Screw[] }) {
  const { heads, shanks } = useMemo(() => {
    const heads: THREE.Matrix4[] = [];
    const shanks: THREE.Matrix4[] = [];
    for (const s of screws) {
      const A = new THREE.Vector3(...s.axis).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(Y, A);
      const at = new THREE.Vector3(...s.at);
      const len = s.long ? ASSUMED.screw.long : ASSUMED.screw.short;
      heads.push(new THREE.Matrix4().compose(at.clone().addScaledVector(A, -1.5), q, new THREE.Vector3(1, 3, 1)));
      shanks.push(new THREE.Matrix4().compose(at.clone().addScaledVector(A, len / 2), q, new THREE.Vector3(ASSUMED.screw.dia / B.shankDia, len, ASSUMED.screw.dia / B.shankDia)));
    }
    return { heads, shanks };
  }, [screws]);
  return (
    <>
      <Instanced geo={GEO.screwHead} mat={MAT.bolt} mats={heads} />
      <Instanced geo={GEO.shank} mat={MAT.bolt} mats={shanks} />
    </>
  );
}
