/** น็อต M8 แหวน ตัวเมีย และสกรูปลายสว่าน — วาดแบบ instanced ให้ลื่นบนมือถือ */
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Joint, Screw } from '../data/geometry';
import { ASSUMED, SPEC } from '../data/spec';
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

export interface BoltParts {
  shank: THREE.Matrix4;
  head: THREE.Matrix4;
  washerHead: THREE.Matrix4;
  washerNut: THREE.Matrix4;
  nut: THREE.Matrix4;
}

/** ตำแหน่งชิ้นส่วนน็อตหนึ่งตัว (พิกัดเดียวกับ joint.space) */
export function boltParts(j: Joint): BoltParts {
  const A = new THREE.Vector3(...j.axis).normalize();
  const at = new THREE.Vector3(...j.at);
  const q = new THREE.Quaternion().setFromUnitVectors(Y, A);
  const len = j.bolt.startsWith('M8x70') ? SPEC.bolts.long : SPEC.bolts.short;
  const p = (k: number) => at.clone().addScaledVector(A, k);
  const m = (c: THREE.Vector3, r: number, h: number) => new THREE.Matrix4().compose(c, q, new THREE.Vector3(r, h, r));
  return {
    head: m(p(-B.washerT - B.headHeight / 2), 1, B.headHeight),
    washerHead: m(p(-B.washerT / 2), 1, B.washerT),
    shank: m(p(-B.washerT + len / 2), 1, len),
    washerNut: m(p(j.grip + B.washerT / 2), 1, B.washerT),
    nut: m(p(j.grip + B.washerT + B.nutHeight / 2), 1, B.nutHeight),
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
  const parts = useMemo(() => joints.map(boltParts), [joints]);
  return (
    <>
      <Instanced geo={GEO.shank} mat={MAT.bolt} mats={parts.map((p) => p.shank)} />
      <Instanced geo={GEO.hex} mat={MAT.bolt} mats={[...parts.map((p) => p.head), ...parts.map((p) => p.nut)]} />
      <Instanced geo={GEO.washer} mat={MAT.bolt} mats={[...parts.map((p) => p.washerHead), ...parts.map((p) => p.washerNut)]} />
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
