/** ชิ้นเหล็กทั้งหมด (เสา จันทัน แผ่นประกับ ท่อ ฉาก ...) และน็อต */
import { useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { MEMBERS, JOINTS, SCREWS, frameMatrix, type BoxMember, type FramePose, type Joint, type Member, type PlaneMember, type Screw, type V3 } from '../data/geometry';
import { SPEC } from '../data/spec';
import { ANIM, easeInOut } from '../anim/state';
import { FLY_AS_ONE, enterMode, memberGroup } from '../anim/config';
import { MAT, MAT_X } from './materials';
import { boxMatrix, planeGeometry, UNIT_BOX } from './geom3';
import { AnimatedBolts, BoltSet, ScrewSet } from './Bolts';
import { Enter } from './Enter';
import { CurtainPipe, DoorSwing } from './Motions';

export interface ViewOpts {
  visible: Set<string>;
  poses: Record<number, FramePose>;
  highlight: Set<string>;
  selected: string | null;
  xray: boolean;
  /** น็อตที่เล่นแอนิเมชันใส่/ขันในขั้นนี้ */
  animBolts: Set<string>;
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

const MemberMesh = ({ m, o }: { m: Member; o: ViewOpts }) => (m.kind === 'plane' ? <PlaneMesh m={m} o={o} /> : <BoxMesh m={m} o={o} />);

/** ชิ้นบางชิ้นมีการเคลื่อนไหวเฉพาะ (ท่อม้วนม่านเลื่อนตามม่าน) */
const MemberWithMotion = ({ m, o }: { m: Member; o: ViewOpts }) =>
  m.id === 'rollPipe.n' ? (
    <CurtainPipe>
      <MemberMesh m={m} o={o} />
    </CurtainPipe>
  ) : (
    <MemberMesh m={m} o={o} />
  );

/** จุดกลางของชิ้นทั้งหมดในป้ายเดียวกัน (พิกัดกลุ่มแม่) — ใช้เป็นจุดอ้างอิงตอนลอยเข้า */
function centerOf(members: Member[], joints: Joint[], screws: Screw[]): V3 {
  const pts: THREE.Vector3[] = [];
  for (const m of members) {
    if (m.kind === 'plane') {
      const g = planeGeometry(m);
      if (!g.boundingBox) g.computeBoundingBox();
      pts.push(g.boundingBox!.getCenter(new THREE.Vector3()));
    } else m.boxes.forEach((b) => pts.push(new THREE.Vector3(...b.center)));
  }
  joints.forEach((j) => pts.push(new THREE.Vector3(...j.at)));
  screws.forEach((s) => pts.push(new THREE.Vector3(...s.at)));
  if (pts.length === 0) return [0, 0, 0];
  const c = pts.reduce((a, b) => a.add(b), new THREE.Vector3()).multiplyScalar(1 / pts.length);
  return [c.x, c.y, c.z];
}

/** แยกชิ้นตามป้าย แล้วห่อแต่ละป้ายด้วย Enter */
function TagGroups({ members, joints, screws, parent, o }: { members: Member[]; joints: Joint[]; screws: Screw[]; parent?: THREE.Matrix4; o: ViewOpts }) {
  const tags = [...new Set([...members.map((m) => m.tag), ...joints.map((j) => j.tag), ...screws.map((s) => s.tag)])];
  return (
    <>
      {tags.map((tag) => {
        const body = <TagGroup tag={tag} ms={members.filter((m) => m.tag === tag)} js={joints.filter((j) => j.tag === tag)} ss={screws.filter((s) => s.tag === tag)} parent={parent} o={o} />;
        return tag === 'door' ? <DoorSwing key={tag}>{body}</DoorSwing> : <group key={tag}>{body}</group>;
      })}
    </>
  );
}

/**
 * ป้ายเดียว: ถ้ามีหลายชุด (เช่น ท่อแนวยาว 24 ท่อน) ให้ทยอยลอยเข้าทีละชุด
 * น็อตและสกรูของป้ายปรากฏตอนท้าย
 */
function TagGroup({ tag, ms, js, ss, parent, o }: { tag: string; ms: Member[]; js: Joint[]; ss: Screw[]; parent?: THREE.Matrix4; o: ViewOpts }) {
  const key = `${ms.map((m) => m.id).join()}|${js.length}|${ss.length}`;
  const groups = useMemo(() => {
    const map = new Map<string, Member[]>();
    for (const m of ms) {
      const g = FLY_AS_ONE(tag) ? tag : memberGroup(m.id);
      map.set(g, [...(map.get(g) ?? []), m]);
    }
    return [...map.values()].map((list) => ({ list, center: centerOf(list, [], []) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag, key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const center = useMemo(() => centerOf(ms, js, ss), [tag, key]);
  const staggered = groups.length > 1 && enterMode(tag) === 'fly';
  if (!staggered)
    return (
      <Enter tag={tag} center={center} parent={parent}>
        {ms.map((m) => (
          <MemberWithMotion key={m.id} m={m} o={o} />
        ))}
        <BoltSet joints={js} />
        <ScrewSet screws={ss} />
      </Enter>
    );
  const n = groups.length + 1;
  return (
    <>
      {groups.map((g, k) => (
        <Enter key={g.list[0].id} tag={tag} center={g.center} parent={parent} k={k} n={n}>
          {g.list.map((m) => (
            <MemberWithMotion key={m.id} m={m} o={o} />
          ))}
        </Enter>
      ))}
      <Enter tag={tag} mode="pop" center={center} k={n - 1} n={n}>
        <BoltSet joints={js} />
        <ScrewSet screws={ss} />
      </Enter>
    </>
  );
}

const FRAMES = Array.from({ length: SPEC.layout.frameCount }, (_, i) => i + 1);

const pa = new THREE.Vector3();
const pb = new THREE.Vector3();
const qa = new THREE.Quaternion();
const qb = new THREE.Quaternion();
const sc = new THREE.Vector3();
const shift = new THREE.Matrix4();

/**
 * กลุ่มโครงหนึ่งชุด
 * - กำลังเปลี่ยนท่า (ยกจากลานไปตั้ง): ไล่ตำแหน่งระหว่างท่าเดิมกับท่าใหม่ ยกโค้งขึ้นกลางทาง
 * - ถูกเลื่อนชั่วคราว (ANIM.nudge): เช่น นั่งบนฐานก่อนสอดอิฐ หรือระยะคลาดก่อนใส่ท่อสัน
 */
function FrameGroup({ f, pose, children }: { f: number; pose: FramePose; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const target = useMemo(() => frameMatrix(f, pose), [f, pose]);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = ANIM.pose[f];
    const from = ANIM.poseFrom[f];
    if (t === undefined || t >= 1 || !from) g.matrix.copy(target);
    else {
      const e = easeInOut(t);
      frameMatrix(f, from).decompose(pa, qa, sc);
      target.decompose(pb, qb, sc);
      pa.lerp(pb, e);
      pa.y += Math.sin(Math.PI * e) * 1200;
      qa.slerp(qb, e);
      g.matrix.compose(pa, qa, sc.set(1, 1, 1));
    }
    const nd = ANIM.nudge[f];
    if (nd && ANIM.nudgeK) g.matrix.premultiply(shift.makeTranslation(nd[0] * ANIM.nudgeK, nd[1] * ANIM.nudgeK, nd[2] * ANIM.nudgeK));
    g.matrixWorldNeedsUpdate = true;
  });
  return (
    <group ref={ref} matrix={target} matrixAutoUpdate={false}>
      {children}
    </group>
  );
}

export function Members({ o }: { o: ViewOpts }) {
  const vis = (tag: string) => o.visible.has(tag);
  const shown = MEMBERS.filter((m) => vis(m.tag));
  const isAnim = (j: Joint) => o.animBolts.has(j.id);
  const frameJoints = (f: number) => JOINTS.filter((j) => j.space.kind === 'frame' && j.space.frame === f && vis(j.tag));
  const worldJoints = JOINTS.filter((j) => j.space.kind === 'world' && vis(j.tag));
  const frameScrews = (f: number) => SCREWS.filter((s) => s.space.kind === 'frame' && s.space.frame === f && vis(s.tag));
  const worldScrews = SCREWS.filter((s) => s.space.kind === 'world' && vis(s.tag));

  return (
    <>
      {FRAMES.map((f) => {
        const pose = o.poses[f];
        const moving = shown.filter((m) => (m.kind === 'plane' ? m.frame === f && m.moves : m.space.kind === 'frame' && m.space.frame === f));
        const js = frameJoints(f);
        if (!pose || (moving.length === 0 && js.length === 0)) return null;
        return (
          <FrameGroup key={f} f={f} pose={pose}>
            <TagGroups members={moving} joints={js.filter((j) => !isAnim(j))} screws={frameScrews(f)} parent={frameMatrix(f, pose)} o={o} />
            <AnimatedBolts joints={js.filter(isAnim)} />
          </FrameGroup>
        );
      })}
      {/* ชิ้นที่ติดตั้งในตำแหน่งจริง (เสาหน้าจั่ว) */}
      {FRAMES.map((f) => {
        const fixed = shown.filter((m): m is PlaneMember => m.kind === 'plane' && m.frame === f && !m.moves);
        if (fixed.length === 0) return null;
        const mx = frameMatrix(f);
        return (
          <group key={`fixed${f}`} matrix={mx} matrixAutoUpdate={false}>
            <TagGroups members={fixed} joints={[]} screws={[]} parent={mx} o={o} />
          </group>
        );
      })}
      <TagGroups
        members={shown.filter((m) => m.kind === 'box' && m.space.kind === 'world')}
        joints={worldJoints.filter((j) => !isAnim(j))}
        screws={worldScrews}
        o={o}
      />
      <AnimatedBolts joints={worldJoints.filter(isAnim)} />
    </>
  );
}
