/** ป้ายชื่อชิ้นส่วน เลขโครง เข็มทิศ ลม และป้ายด้านใน/ด้านนอก */
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { D, DOOR, FLOOR, GABLE, RIDGE_TUBE, SHAPES, frameMatrix, planeToLocal, type FramePose, type V3 } from '../data/geometry';
import { SPEC } from '../data/spec';

const lastX = D.frameX(SPEC.layout.frameCount);

function Tag({ at, text, kind = '' }: { at: V3; text: string; kind?: '' | 'big' | 'side' }) {
  return (
    <Html position={at} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`label3d ${kind}`}>{text}</div>
    </Html>
  );
}

const frameLocalToWorld = (f: number, pose: FramePose, p: V3): V3 => {
  const v = new THREE.Vector3(...p).applyMatrix4(frameMatrix(f, pose));
  return [v.x, v.y, v.z];
};

/** ป้ายชื่อชิ้นส่วน — ติดบนโครง 3 (โครงกลาง) และชิ้นตัวอย่างอื่น ๆ */
export function PartLabels({ visible, poses }: { visible: Set<string>; poses: Record<number, FramePose> }) {
  const f = poses[3] ? 3 : 1;
  const pose = poses[f];
  const vis = (t: string) => visible.has(t);
  const out: { at: V3; text: string }[] = [];
  if (pose) {
    const L = (local: V3) => frameLocalToWorld(f, pose, local);
    const hasF = (k: string) => vis(`f${f}:${k}`);
    if (hasF('posts')) out.push({ at: L([0, 700, 0]), text: 'เสาโครง' });
    if (hasF('rafters')) out.push({ at: L(planeToLocal([700, D.H + 700 * Math.tan(D.theta) + 60], 0)), text: 'จันทัน' });
    if (hasF('plates-top')) out.push({ at: L(planeToLocal([60, D.H + 140], 16)), text: 'แผ่นประกับมุมไหล่' });
    if (hasF('plates-top')) out.push({ at: L(planeToLocal([D.HALF + 90, SPEC.layout.ridgeHeight - 50], 16)), text: 'แผ่นประกับสัน' });
    if (hasF('tie')) out.push({ at: L(planeToLocal([D.HALF - 300, D.tieY + 30], 25)), text: 'คานรัด' });
    if (hasF('braces')) out.push({ at: L(planeToLocal(SHAPES.braceHoles[1], 25)), text: 'ค้ำมุมไหล่' });
    if (hasF('ridge-bracket')) out.push({ at: L(planeToLocal([D.HALF, D.foldY + 10], 40)), text: 'ฉากสัน' });
  }
  if (vis('ridge-tube')) out.push({ at: [lastX * 0.62, RIDGE_TUBE.y + 40, -D.HALF], text: 'ท่อสัน' });
  if (vis('long-tubes')) {
    const x = D.frameX(3) + 750;
    out.push({ at: [x, D.shoulderTubeY + 30, 20], text: 'ท่อไหล่' });
    out.push({ at: [x, D.lowTubeY + 30, 20], text: 'ท่อล่าง' });
    const p = [x, ...[D.rafterHole('purlin')].map((h) => [h[1] + 50, -h[0]])[0]] as V3;
    out.push({ at: p, text: 'แป' });
    out.push({ at: [D.frameX(3) + 20, D.shoulderTubeY - 40, -60], text: 'ฉาก L' });
  }
  if (vis('wall-braces')) out.push({ at: [750, 800, -D.W + 30], text: 'ค้ำยัน' });
  if (vis('gable-posts')) out.push({ at: [lastX + 20, GABLE.topY - 300, -SPEC.gablePost.fromNorth[0]], text: 'เสาหน้าจั่ว' });
  if (vis('door')) out.push({ at: [DOOR.xF + 30, (DOOR.top + DOOR.bottom) / 2, -(DOOR.openU0 + DOOR.openU1) / 2], text: 'บานประตู' });
  if (vis('rails')) out.push({ at: [lastX / 2, D.lowTubeY + 40, 40], text: 'รางล็อก' });
  if (vis('roof-plastic')) out.push({ at: [lastX * 0.3, D.H + 650, -400], text: 'พลาสติกหลังคา' });
  if (vis('mesh-side')) out.push({ at: [lastX * 0.15, 700, 45], text: 'มุ้ง' });
  if (vis('curtains')) out.push({ at: [lastX * 0.15, 400, -D.W - 45], text: 'ม่านม้วน' });
  if (vis('saran')) out.push({ at: [lastX * 0.55, D.tieY + 20, -D.HALF], text: 'สแลน' });
  if (vis('roof-ropes')) out.push({ at: [D.frameX(2) + 750, SPEC.layout.ridgeHeight + 80, -D.HALF + 500], text: 'เชือกรัดหลังคา' });
  if (vis('shelf-beams')) out.push({ at: [600, 420, -FLOOR.beams[0].u], text: 'คานชั้นวาง' });
  if (vis('stacks')) out.push({ at: [FLOOR.stackX[0], 200, -FLOOR.stacks[0].u + 250], text: 'สตั๊กบล็อก' });
  if (vis('foam-boxes')) out.push({ at: [FLOOR.foam[4].x, 760, -FLOOR.foam[4].u], text: 'กล่องโฟม' });
  if (vis('weed-cover')) out.push({ at: [lastX - 400, 20, -FLOOR.walk[0].u0 - 300], text: 'ผ้าคลุมวัชพืช' });
  return (
    <>
      {out.map((l) => (
        <Tag key={l.text} at={l.at} text={l.text} />
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
        return <Tag key={f} at={at} text={`โครง ${f}`} kind="big" />;
      })}
      {poses[1]?.kind === 'up' && (
        <>
          <Tag at={[220, 1750, 80]} text="ด้านใน →" kind="side" />
          <Tag at={[-220, 1750, 80]} text="← ด้านนอก" kind="side" />
        </>
      )}
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
