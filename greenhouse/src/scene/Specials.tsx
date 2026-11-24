/**
 * แอนิเมชันเฉพาะขั้น: ป้ายชี้จุด เส้นวัดระยะ สายยางระดับน้ำ ขีด-เจาะรู และขันน็อต
 * ทุกอย่างอ่านความคืบหน้าจาก ANIM (ไทม์ไลน์ใน anim/timeline.ts)
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { JOINTS, MARKERS, groundY, type FramePose, type V3 } from '../data/geometry';
import { SPEC } from '../data/spec';
import { STEPS } from '../data/steps';
import { ANIM, easeInOut, easeOut, enterOf, seg } from '../anim/state';
import { CALLOUTS, DIMS, TAG_DIMS, type Dim } from '../anim/notes';
import { jointPoint } from '../anim/sceneState';
import { UNIT_BOX } from './geom3';
import { MAT } from './materials';

const JOINT_BY_ID = new Map(JOINTS.map((j) => [j.id, j]));

export function Specials({ stepIdx, visible, poses }: { stepIdx: number; visible: Set<string>; poses: Record<number, FramePose> }) {
  const step = STEPS[stepIdx];
  const id = step?.id ?? '';
  const tagDims = Object.entries(TAG_DIMS).filter(([tag]) => visible.has(tag));
  return (
    <>
      {(CALLOUTS[id] ?? []).map((c, i) => (
        <CalloutTag key={`${id}.${i}`} at={c.at} text={c.text} warn={c.warn} />
      ))}
      {(DIMS[id] ?? []).map((d, i) => (
        <DimLine key={`${id}.d${i}`} d={d} progress={() => seg(ANIM.callout, 0, 1)} />
      ))}
      {tagDims.flatMap(([tag, dims]) => dims.map((d, i) => <DimLine key={`${tag}.${i}`} d={d} progress={() => enterOf(tag)} />))}
      {step?.anim === 'waterLevel' && <WaterLevel />}
      {step?.anim === 'markDrill' && step.zoom && <MarkDrill jointId={step.zoom[step.zoom.length - 1]} poses={poses} />}
      {step?.anim === 'tighten' && step.zoom?.map((jid) => <TightenLabel key={jid} jointId={jid} poses={poses} />)}
    </>
  );
}

/** ป้ายชี้จุด ค่อย ๆ ปรากฏตาม ANIM.callout */
function CalloutTag({ at, text, warn }: { at: V3; text: string; warn?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFrame(() => {
    if (ref.current) ref.current.style.opacity = String(seg(ANIM.callout, 0, 0.6));
  });
  return (
    <Html position={at} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
      <div ref={ref} className={`label3d callout ${warn ? 'warn' : ''}`} style={{ opacity: 0 }}>
        {warn ? '⚠️ ' : ''}
        {text}
      </div>
    </Html>
  );
}

/** เส้นวัดระยะ: ลากจากต้นไปปลาย มีขีดหัวท้าย และตัวเลขตรงกลาง */
export function DimLine({ d, progress }: { d: Dim; progress: () => number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const line = useRef<any>(null);
  const label = useRef<HTMLDivElement>(null);
  const caps = useRef<THREE.Group>(null);
  const len = Math.hypot(d.to[0] - d.from[0], d.to[1] - d.from[1], d.to[2] - d.from[2]);
  const mid: V3 = [(d.from[0] + d.to[0]) / 2, (d.from[1] + d.to[1]) / 2, (d.from[2] + d.to[2]) / 2];
  useFrame(() => {
    const p = progress();
    const mat = line.current?.material;
    if (mat) {
      mat.dashSize = Math.max(0.01, p * len);
      mat.gapSize = len * 4;
    }
    if (label.current) label.current.style.opacity = String(seg(p, 0.7, 1));
    if (caps.current) caps.current.visible = p > 0.01;
  });
  return (
    <>
      <Line ref={line} points={[d.from, d.to]} color="#e11d48" lineWidth={2.5} dashed dashSize={len} gapSize={len * 4} depthTest={false} renderOrder={10} />
      <group ref={caps}>
        {[d.from, d.to].map((p, i) => (
          <mesh key={i} geometry={UNIT_BOX} material={MAT.dim} position={p} scale={[24, 24, 24]} renderOrder={10} />
        ))}
      </group>
      <Html position={mid} zIndexRange={[25, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={label} className="label3d dim" style={{ opacity: 0 }}>
          {d.label}
        </div>
      </Html>
    </>
  );
}

// ─────────────── สายยางระดับน้ำ (ขั้น 1-8) ───────────────
/** หลักไม้ที่จุดต่ำสุด (โครง 5 ด้านใต้) และหลักที่หมุด A (สูงสุด) */
const stakeLow = MARKERS.find((m) => m.id === 'stake.9')!;
const stakeHigh = MARKERS.find((m) => m.id === 'stake.0')!;
const WATER_Y = SPEC.site.levelHoseMarkHeight; // ผิวน้ำ = 50 ซม. เหนือดินจุดต่ำสุด (ระดับอ้างอิง 0)
const HOSE_TOP = WATER_Y + 180;

function WaterLevel() {
  const g = useRef<THREE.Group>(null);
  const wLow = useRef<THREE.Mesh>(null);
  const wHigh = useRef<THREE.Mesh>(null);
  const labels = useRef<HTMLDivElement[]>([]);
  const ex = SPEC.site.levelHoseExample;
  const { tube, endLow, endHigh } = useMemo(() => {
    const side = 30; // สายยางทาบข้างหลัก
    const lo = new THREE.Vector3(stakeLow.at[0] + side, 0, stakeLow.at[2]);
    const hi = new THREE.Vector3(stakeHigh.at[0] + side, 0, stakeHigh.at[2]);
    const gl = groundY(lo.x, lo.z);
    const gh = groundY(hi.x, hi.z);
    const pts = [
      new THREE.Vector3(lo.x, HOSE_TOP, lo.z),
      new THREE.Vector3(lo.x, gl + 40, lo.z),
      new THREE.Vector3(lo.x - 300, gl + 15, lo.z + 300),
      new THREE.Vector3(hi.x + 300, gh + 15, hi.z - 300),
      new THREE.Vector3(hi.x, gh + 40, hi.z),
      new THREE.Vector3(hi.x, HOSE_TOP, hi.z),
    ];
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1);
    return { tube: new THREE.TubeGeometry(curve, 160, 14, 8, false), endLow: { x: lo.x, z: lo.z, g: gl }, endHigh: { x: hi.x, z: hi.z, g: gh } };
  }, []);

  useFrame(() => {
    const p = ANIM.special;
    if (g.current) g.current.visible = p > 0 && p < 1.0001;
    // น้ำแกว่งขึ้นลงแล้วนิ่งที่ระดับเดียวกันทั้งสองปลาย
    const settle = seg(p, 0.2, 0.8);
    const osc = 160 * (1 - easeOut(settle)) * Math.cos(settle * Math.PI * 7);
    const fill = easeOut(seg(p, 0.05, 0.25));
    const set = (m: THREE.Mesh | null, ground: number, level: number) => {
      if (!m) return;
      const top = ground + (level - ground) * fill;
      const h = Math.max(1, top - (ground + 40));
      m.scale.set(1, h, 1);
      m.position.y = ground + 40 + h / 2;
    };
    set(wLow.current, endLow.g, WATER_Y + osc);
    set(wHigh.current, endHigh.g, WATER_Y - osc);
    labels.current.forEach((el, i) => el && (el.style.opacity = String(seg(p, i === 0 ? 0.3 : 0.82, i === 0 ? 0.45 : 0.95))));
  });

  return (
    <group ref={g} visible={false}>
      <mesh geometry={tube} material={MAT.hose} renderOrder={3} />
      <mesh ref={wLow} position={[endLow.x, 0, endLow.z]} material={MAT.water}>
        <cylinderGeometry args={[11, 11, 1, 10]} />
      </mesh>
      <mesh ref={wHigh} position={[endHigh.x, 0, endHigh.z]} material={MAT.water}>
        <cylinderGeometry args={[11, 11, 1, 10]} />
      </mesh>
      <Html position={[endLow.x, WATER_Y + 40, endLow.z]} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={(el) => el && (labels.current[0] = el)} className="label3d callout" style={{ opacity: 0 }}>
          จุดต่ำสุด: ผิวน้ำสูงจากดิน {WATER_Y / 10} ซม.
        </div>
      </Html>
      <Html position={[endHigh.x, WATER_Y + 40, endHigh.z]} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={(el) => el && (labels.current[1] = el)} className="label3d callout" style={{ opacity: 0 }}>
          วัดได้ {ex.reading / 10} ซม. = ดินสูงกว่าจุดต่ำสุด {ex.rise / 10} ซม.
        </div>
      </Html>
    </group>
  );
}

// ─────────────── ขีดตามรูจริง แล้วเจาะ (ขั้น 3-7, 3-8) ───────────────
function MarkDrill({ jointId, poses }: { jointId: string; poses: Record<number, FramePose> }) {
  const j = JOINT_BY_ID.get(jointId);
  const dot = useRef<THREE.Mesh>(null);
  const drill = useRef<THREE.Group>(null);
  const text = useRef<HTMLDivElement>(null);
  const geo = useMemo(() => {
    if (!j) return null;
    const top = new THREE.Vector3(...jointPoint(j, poses, 0));
    const axis = new THREE.Vector3(...jointPoint(j, poses, 1)).sub(top).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), axis);
    return { top, axis, q };
  }, [j, poses]);

  useFrame(() => {
    if (!geo) return;
    const p = ANIM.special;
    const active = p > 0 && p < 1;
    if (dot.current) {
      dot.current.visible = p > 0;
      dot.current.scale.setScalar(Math.max(0.001, easeOut(seg(p, 0, 0.2))));
    }
    if (drill.current) {
      drill.current.visible = active && p > 0.3 && p < 0.95;
      // ดอกสว่านเข้ามาจากด้านบน → เจาะลง → ถอยออก
      const come = easeInOut(seg(p, 0.3, 0.5));
      const dig = Math.sin(Math.PI * seg(p, 0.5, 0.88)) * 30;
      const off = (1 - come) * 250 - dig;
      drill.current.position.copy(geo.top).addScaledVector(geo.axis, -off);
      drill.current.quaternion.copy(geo.q);
      drill.current.rotateY(p * 60);
    }
    if (text.current) {
      text.current.style.opacity = active ? '1' : '0';
      text.current.textContent = p < 0.3 ? 'ขีดตามรูจริง' : `เจาะ ${SPEC.section.holeDia} มม.`;
    }
  });
  if (!geo) return null;
  return (
    <>
      <mesh ref={dot} position={geo.top} quaternion={geo.q} material={MAT.markRed} visible={false}>
        <cylinderGeometry args={[6, 6, 1.5, 16]} />
      </mesh>
      <group ref={drill} visible={false}>
        {/* ดอกสว่าน ø8.5 ยาว 100 + หัวจับ */}
        <mesh material={MAT.bolt} position={[0, 50, 0]}>
          <cylinderGeometry args={[SPEC.section.holeDia / 2, SPEC.section.holeDia / 2, 100, 10]} />
        </mesh>
        <mesh material={MAT.drill} position={[0, 140, 0]}>
          <cylinderGeometry args={[22, 22, 80, 14]} />
        </mesh>
      </group>
      <Html position={[geo.top.x, geo.top.y + 120, geo.top.z]} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={text} className="label3d callout" style={{ opacity: 0 }} />
      </Html>
    </>
  );
}

/** ข้อความตอนขันน็อต: ขันจนแหวนแนบ → หมุนเพิ่ม 1/4 รอบ */
function TightenLabel({ jointId, poses }: { jointId: string; poses: Record<number, FramePose> }) {
  const j = JOINT_BY_ID.get(jointId);
  const ref = useRef<HTMLDivElement>(null);
  const at = useMemo(() => (j ? jointPoint(j, poses, -90) : null), [j, poses]);
  useFrame(() => {
    const t = ANIM.tighten[jointId];
    if (!ref.current) return;
    ref.current.style.opacity = t === undefined || t <= 0 ? '0' : '1';
    ref.current.textContent = t === undefined || t < 0.6 ? 'ขันตัวเมียจนแหวนแนบสนิท' : 'หมุนเพิ่มอีก ¼ รอบ';
  });
  if (!at) return null;
  return (
    <Html position={at} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
      <div ref={ref} className="label3d callout" style={{ opacity: 0 }} />
    </Html>
  );
}
