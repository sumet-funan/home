/** ชิ้นเหล็กทั้งหมด (เสา จันทัน แผ่นประกับ ท่อ ฉาก ...) และน็อต */
import { useMemo } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { MEMBERS, JOINTS, SCREWS, frameMatrix, type BoxMember, type FramePose, type Member, type PlaneMember } from '../data/geometry';
import { SPEC } from '../data/spec';
import { MAT, MAT_X } from './materials';
import { boxMatrix, planeGeometry, UNIT_BOX } from './geom3';
import { BoltSet, ScrewSet } from './Bolts';

export interface ViewOpts {
  visible: Set<string>;
  poses: Record<number, FramePose>;
  highlight: Set<string>;
  selected: string | null;
  xray: boolean;
  onSelect: (id: string) => void;
}

function materialFor(m: Member, o: ViewOpts) {
  if (o.selected === m.piece) return MAT.selected;
  if (o.highlight.has(m.tag)) return MAT.highlight;
  const set = o.xray ? MAT_X : MAT;
  return m.material === 'steel' ? set.steel : set.plate;
}

const click = (o: ViewOpts, m: Member) => (e: ThreeEvent<MouseEvent>) => {
  e.stopPropagation();
  o.onSelect(m.piece);
};

function PlaneMesh({ m, o }: { m: PlaneMember; o: ViewOpts }) {
  const g = useMemo(() => planeGeometry(m), [m]);
  return <mesh geometry={g} material={materialFor(m, o)} castShadow receiveShadow onClick={click(o, m)} userData={{ piece: m.piece }} />;
}

function BoxMesh({ m, o }: { m: BoxMember; o: ViewOpts }) {
  const mats = useMemo(() => m.boxes.map(boxMatrix), [m]);
  const mat = materialFor(m, o);
  return (
    <>
      {mats.map((mx, i) => (
        <mesh key={i} geometry={UNIT_BOX} material={mat} matrix={mx} matrixAutoUpdate={false} castShadow receiveShadow onClick={click(o, m)} />
      ))}
    </>
  );
}

const FRAMES = Array.from({ length: SPEC.layout.frameCount }, (_, i) => i + 1);

export function Members({ o }: { o: ViewOpts }) {
  const vis = (tag: string) => o.visible.has(tag);
  const shown = MEMBERS.filter((m) => vis(m.tag));
  const frameJoints = (f: number) => JOINTS.filter((j) => j.space.kind === 'frame' && j.space.frame === f && vis(j.tag));
  const worldJoints = JOINTS.filter((j) => j.space.kind === 'world' && vis(j.tag));

  return (
    <>
      {FRAMES.map((f) => {
        const pose = o.poses[f];
        const moving = shown.filter((m): m is PlaneMember => m.kind === 'plane' && m.frame === f && m.moves);
        const local = shown.filter((m): m is BoxMember => m.kind === 'box' && m.space.kind === 'frame' && m.space.frame === f);
        if (!pose || (moving.length === 0 && local.length === 0)) return null;
        return (
          <group key={f} matrix={frameMatrix(f, pose)} matrixAutoUpdate={false}>
            {moving.map((m) => (
              <PlaneMesh key={m.id} m={m} o={o} />
            ))}
            {local.map((m) => (
              <BoxMesh key={m.id} m={m} o={o} />
            ))}
            <BoltSet joints={frameJoints(f)} />
          </group>
        );
      })}
      {/* ชิ้นที่ติดตั้งในตำแหน่งจริง (เสาหน้าจั่ว) */}
      {FRAMES.map((f) => {
        const fixed = shown.filter((m): m is PlaneMember => m.kind === 'plane' && m.frame === f && !m.moves);
        if (fixed.length === 0) return null;
        return (
          <group key={`fixed${f}`} matrix={frameMatrix(f)} matrixAutoUpdate={false}>
            {fixed.map((m) => (
              <PlaneMesh key={m.id} m={m} o={o} />
            ))}
          </group>
        );
      })}
      {shown
        .filter((m): m is BoxMember => m.kind === 'box' && m.space.kind === 'world')
        .map((m) => (
          <BoxMesh key={m.id} m={m} o={o} />
        ))}
      <BoltSet joints={worldJoints} />
      <ScrewSet screws={SCREWS.filter((s) => vis(s.tag))} />
    </>
  );
}

export const tmpObj = new THREE.Object3D();
