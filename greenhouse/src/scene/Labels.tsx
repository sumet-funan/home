/** ป้ายชื่อชิ้นส่วน เลขโครง เข็มทิศ ลม ป้ายด้านใน/ด้านนอก ตัวอักษรหมุด และเลขโครงที่เขียนบนเสา */
import { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ASSEMBLY_SLAB, D, DOOR, FLOOR, GABLE, MARKERS, RIDGE_TUBE, SHAPES, frameMatrix, planeToLocal, type FramePose, type V3 } from '../data/geometry';
import { SPEC } from '../data/spec';
import { ANIM, enterOf } from '../anim/state';
import { PILE_ORIGIN } from './pile';

const lastX = D.frameX(SPEC.layout.frameCount);

/** ป้ายแสดงเมื่อชิ้นของป้าย tag ปรากฏเสร็จ และโครง frame ไม่ได้กำลังเปลี่ยนท่า */
function Tag({ at, text, kind = '', tag, frame }: { at: V3; text: string; kind?: '' | 'big' | 'side' | 'mark'; tag?: string; frame?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useFrame(() => {
    if (!ref.current) return;
    const ready = (!tag || enterOf(tag) >= 1) && (frame === undefined || ANIM.pose[frame] === undefined || ANIM.pose[frame] >= 1);
    ref.current.style.opacity = ready ? '1' : '0';
  });
  return (
    <Html position={at} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div ref={ref} className={`label3d ${kind}`}>
        {text}
      </div>
    </Html>
  );
}

const frameLocalToWorld = (f: number, pose: FramePose, p: V3): V3 => {
  const v = new THREE.Vector3(...p).applyMatrix4(frameMatrix(f, pose));
  return [v.x, v.y, v.z];
};

interface Lbl {
  at: V3;
  text: string;
  tag: string;
  frame?: number;
}

/** ป้ายชื่อชิ้นส่วน — ติดบนโครง 3 (โครงกลาง) หรือโครง 1 และชิ้นตัวอย่างอื่น ๆ */
export function PartLabels({ visible, poses }: { visible: Set<string>; poses: Record<number, FramePose> }) {
  const f = poses[3] ? 3 : 1;
  const pose = poses[f];
  const vis = (t: string) => visible.has(t);
  const out: Lbl[] = [];
  if (pose) {
    const L = (local: V3) => frameLocalToWorld(f, pose, local);
    const add = (k: string, local: V3, text: string) => vis(`f${f}:${k}`) && out.push({ at: L(local), text, tag: `f${f}:${k}`, frame: f });
    add('posts', [0, 700, 0], 'เสาโครง');
    add('rafters', planeToLocal([700, D.H + 700 * Math.tan(D.theta) + 60], 0), 'จันทัน');
    add('plates-top', planeToLocal([60, D.H + 140], 16), 'แผ่นประกับมุมไหล่');
    add('plates-top', planeToLocal([D.HALF + 90, SPEC.layout.ridgeHeight - 50], 16), 'แผ่นประกับสัน');
    add('tie', planeToLocal([D.HALF - 300, D.tieY + 30], 25), 'คานรัด');
    add('braces', planeToLocal(SHAPES.braceHoles[1], 25), 'ค้ำมุมไหล่');
    add('ridge-bracket', planeToLocal([D.HALF, D.foldY + 10], 40), 'ฉากสัน');
  }
  const w = (tag: string, at: V3, text: string) => vis(tag) && out.push({ at, text, tag });
  w('ridge-tube', [lastX * 0.62, RIDGE_TUBE.y + 40, -D.HALF], 'ท่อสัน');
  const x = D.frameX(3) + 750;
  const purlin = D.rafterHole('purlin');
  w('long-tubes', [x, D.shoulderTubeY + 30, 20], 'ท่อไหล่');
  w('long-tubes', [x, D.lowTubeY + 30, 20], 'ท่อล่าง');
  w('long-tubes', [x, purlin[1] + 50, -purlin[0]], 'แป');
  w('long-tubes', [D.frameX(3) + 20, D.shoulderTubeY - 40, -60], 'ฉาก L');
  w('wall-braces', [750, 800, -D.W + 30], 'ค้ำยัน');
  w('gable-posts', [lastX + 20, GABLE.topY - 300, -SPEC.gablePost.fromNorth[0]], 'เสาหน้าจั่ว');
  w('door', [DOOR.xF + 30, (DOOR.top + DOOR.bottom) / 2, -(DOOR.openU0 + DOOR.openU1) / 2], 'บานประตู');
  w('rails', [lastX / 2, D.lowTubeY + 40, 40], 'รางล็อก');
  w('roof-plastic', [lastX * 0.3, D.H + 650, -400], 'พลาสติกหลังคา');
  w('mesh-side', [lastX * 0.15, 700, 45], 'มุ้ง');
  w('curtains', [lastX * 0.15, 400, -D.W - 45], 'ม่านม้วน');
  w('saran', [lastX * 0.55, D.tieY + 20, -D.HALF], 'สแลน');
  w('roof-ropes', [D.frameX(2) + 750, SPEC.layout.ridgeHeight + 80, -D.HALF + 500], 'เชือกรัดหลังคา');
  w('shelf-beams', [600, 420, -FLOOR.beams[0].u], 'คานชั้นวาง');
  w('stacks', [FLOOR.stackX[0], 200, -FLOOR.stacks[0].u + 250], 'สตั๊กบล็อก');
  w('foam-boxes', [FLOOR.foam[4].x, 760, -FLOOR.foam[4].u], 'กล่องโฟม');
  w('weed-cover', [lastX - 400, 20, -FLOOR.walk[0].u0 - 300], 'ผ้าคลุมวัชพืช');
  w('pile', [PILE_ORIGIN[0], 450, PILE_ORIGIN[2]], 'กองวัสดุ');
  w('pile-trial', [PILE_ORIGIN[0], 450, PILE_ORIGIN[2]], 'ชุดทดลอง 1 โครง');
  w('slab', [ASSEMBLY_SLAB.cx, ASSEMBLY_SLAB.top + 30, ASSEMBLY_SLAB.cz + ASSEMBLY_SLAB.sizeZ / 2 - 150], 'ลานประกอบ');
  return (
    <>
      {out.map((l) => (
        <Tag key={l.text} at={l.at} text={l.text} tag={l.tag} frame={l.frame} />
      ))}
    </>
  );
}

/** เลขโครง 1–5 + ด้านใน/ด้านนอก */
export function FrameNumbers({ poses }: { poses: Record<number, FramePose> }) {
  return (
    <>
      {Object.entries(poses).map(([k, pose]) => {
        const f = Number(k);
        const at = frameLocalToWorld(f, pose, [0, SPEC.layout.ridgeHeight + 260, -D.HALF]);
        return <Tag key={f} at={at} text={`โครง ${f}`} kind="big" tag={`f${f}:posts`} frame={f} />;
      })}
      {poses[1]?.kind === 'up' && (
        <>
          <Tag at={[220, 1750, 80]} text="ด้านใน →" kind="side" tag="f1:posts" frame={1} />
          <Tag at={[-220, 1750, 80]} text="← ด้านนอก" kind="side" tag="f1:posts" frame={1} />
        </>
      )}
    </>
  );
}

/** ตัวอักษรหมุด A–E */
export function PinLetters({ visible }: { visible: Set<string> }) {
  return (
    <>
      {MARKERS.filter((m) => m.kind === 'pin' && m.label && visible.has(m.tag)).map((m) => (
        <Tag key={m.id} at={[m.at[0], m.at[1] + 330, m.at[2]]} text={m.label} kind="big" tag={m.tag} />
      ))}
    </>
  );
}

/** เลขโครงและคำว่า "ใน" ที่เขียนด้วยปากกาเคมีบนเสา (ระยะ 3 ข้อ 10) */
export function FrameMarks({ visible, poses }: { visible: Set<string>; poses: Record<number, FramePose> }) {
  const out: { key: string; at: V3; text: string; tag: string; f: number }[] = [];
  for (let f = 1; f <= SPEC.layout.frameCount; f++) {
    const pose = poses[f];
    const tag = `f${f}:marks`;
    if (!pose || !visible.has(tag)) continue;
    for (const u of [0, D.W]) out.push({ key: `${f}.${u}`, at: frameLocalToWorld(f, pose, planeToLocal([u, 500], 14)), text: `${f} ใน`, tag, f });
  }
  return (
    <>
      {out.map((m) => (
        <Tag key={m.key} at={m.at} text={m.text} kind="mark" tag={m.tag} frame={m.f} />
      ))}
    </>
  );
}

/** เข็มทิศและลูกศรลมตะวันออก (วางนอกแปลงด้านตะวันออกเฉียงเหนือ) */
export function Compass() {
  const c: V3 = [-1800, 30, 1800];
  return (
    <group position={c}>
      {/* N → +Z */}
      <mesh position={[0, 0, 350]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[120, 300, 3]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 0, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[25, 25, 300, 8]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <Tag at={[0, 60, 600]} text="เหนือ" kind="big" />
      {/* ลมจากตะวันออก → พัดไป +X */}
      <group position={[-1400, 1200, -1800]}>
        <mesh rotation={[0, 0, -Math.PI / 2]} position={[500, 0, 0]}>
          <coneGeometry args={[110, 260, 12]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.85} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[35, 35, 800, 10]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.85} />
        </mesh>
        <Tag at={[0, 160, 0]} text="ลมหลัก: ตะวันออก" />
      </group>
      <Tag at={[1000, 60, -300]} text="ตะวันออก ← → ตะวันตก" />
    </group>
  );
}
