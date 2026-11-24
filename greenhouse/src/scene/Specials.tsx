/**
 * แอนิเมชันเฉพาะขั้น: ป้ายชี้จุด เส้นวัดระยะ สายยางระดับน้ำ ระดับน้ำลูกน้ำ ขีด-เจาะรู ขันน็อต
 * ผสมคอนกรีต บ่มปูน 3 วัน เทปพันขอบคม และลวดสปริงลงราง
 * ทุกอย่างอ่านความคืบหน้าจาก ANIM (ไทม์ไลน์ใน anim/timeline.ts)
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { JOINTS, RAILS, frameMatrix, groundY, type FramePose, type V3 } from '../data/geometry';
import { SPEC } from '../data/spec';
import { MIX_AT, STEPS } from '../data/steps';
import { ANIM, easeInOut, easeOut, enterOf, seg } from '../anim/state';
import { CALLOUTS, DIMS, FRAME_DIMS, HOSES, LAYOUT_DIMS, PLUMB, SPRINGS, TAG_DIMS, TAG_MARKS, TAPE_BANDS, type Dim, type Hose } from '../anim/notes';
import { jointPoint } from '../anim/sceneState';
import { boxMatrix, UNIT_BOX } from './geom3';
import { COLORS, MAT } from './materials';
import { Enter, itemT } from './Enter';

const JOINT_BY_ID = new Map(JOINTS.map((j) => [j.id, j]));

export function Specials({ stepIdx, visible, poses, showDims }: { stepIdx: number; visible: Set<string>; poses: Record<number, FramePose>; showDims: boolean }) {
  const step = STEPS[stepIdx];
  const id = step?.id ?? '';
  const tagDims = Object.entries(TAG_DIMS).filter(([tag]) => visible.has(tag));
  const tagMarks = Object.entries(TAG_MARKS).filter(([tag]) => visible.has(tag));
  const lastZoom = step?.zoom?.[step.zoom.length - 1];
  const mainDims = !showDims ? [] : poses[1]?.kind === 'up' && visible.has('f1:posts') ? FRAME_DIMS : visible.has('pin-D') ? LAYOUT_DIMS : [];
  return (
    <>
      {(CALLOUTS[id] ?? []).map((c, i) => (
        <CalloutTag key={`${id}.${i}`} at={c.at} text={c.text} warn={c.warn} />
      ))}
      {(DIMS[id] ?? []).map((d, i) => (
        <DimLine key={`${id}.d${i}`} d={d} progress={() => seg(ANIM.callout, 0, 1)} />
      ))}
      {mainDims.map((d, i) => (
        <DimLine key={`main.${mainDims.length}.${i}`} d={d} progress={() => 1} />
      ))}
      {tagDims.flatMap(([tag, dims]) => dims.map((d, i) => <DimLine key={`${tag}.${i}`} d={d} progress={() => enterOf(tag)} />))}
      {tagMarks.flatMap(([tag, pts]) =>
        pts.map((p, i) => (
          <Enter key={`${tag}.m${i}`} tag={tag} mode="pop" center={p} k={i} n={pts.length}>
            <mesh geometry={UNIT_BOX} material={MAT.markRed} position={p} scale={[30, 30, 30]} />
          </Enter>
        )),
      )}
      {visible.has('tape') && <TapeBands />}
      {HOSES[id] && <WaterHose key={id} hose={HOSES[id]} />}
      {(step?.anim === 'markDrill' || step?.anim === 'gablePost') && lastZoom && (
        <MarkDrill
          key={id}
          jointId={lastZoom}
          poses={poses}
          texts={step.anim === 'gablePost' ? ['จับปากกาให้นิ่ง', 'เจาะทะลุเสาและคานรัดพร้อมกัน'] : ['ขีดตามรูจริง', `เจาะ ${SPEC.section.holeDia} มม.`]}
        />
      )}
      {step?.anim === 'tighten' && step.zoom?.map((jid) => <TightenLabel key={jid} jointId={jid} poses={poses} />)}
      {step?.anim === 'plumb' && <Plumb />}
      {step?.anim === 'mixConcrete' && <MixConcrete />}
      {step?.anim === 'cure' && <Cure />}
      {SPRINGS[id] && <Springs key={id} railIds={SPRINGS[id]} />}
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

/** ข้อความลอยที่เปิด/ปิดตามเงื่อนไขทุกเฟรม */
function FloatText({ at, show, text, className = 'label3d callout' }: { at: V3; show: () => number; text: string | (() => string); className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.style.opacity = String(show());
    if (typeof text === 'function') ref.current.textContent = text();
  });
  return (
    <Html position={at} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
      <div ref={ref} className={className} style={{ opacity: 0 }}>
        {typeof text === 'string' ? text : ''}
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

// ─────────────── สายยางระดับน้ำ (ขั้น 1-8 และ 4-3) ───────────────
function WaterHose({ hose }: { hose: Hose }) {
  const g = useRef<THREE.Group>(null);
  const wA = useRef<THREE.Mesh>(null);
  const wB = useRef<THREE.Mesh>(null);
  const top = hose.level + 180;
  const { tube, ga, gb } = useMemo(() => {
    const ga = groundY(hose.a.x, hose.a.z);
    const gb = groundY(hose.b.x, hose.b.z);
    const lerp = (t: number, h: number) => new THREE.Vector3(hose.a.x + (hose.b.x - hose.a.x) * t, h, hose.a.z + (hose.b.z - hose.a.z) * t);
    const pts = [
      new THREE.Vector3(hose.a.x, top, hose.a.z),
      new THREE.Vector3(hose.a.x, ga + 40, hose.a.z),
      lerp(0.12, Math.max(ga, gb) + 15),
      lerp(0.88, Math.max(ga, gb) + 15),
      new THREE.Vector3(hose.b.x, gb + 40, hose.b.z),
      new THREE.Vector3(hose.b.x, top, hose.b.z),
    ];
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1);
    return { tube: new THREE.TubeGeometry(curve, 200, 14, 8, false), ga, gb };
  }, [hose, top]);

  useFrame(() => {
    const p = ANIM.special;
    if (g.current) g.current.visible = p > 0;
    // น้ำแกว่งขึ้นลงแล้วนิ่งที่ระดับเดียวกันทั้งสองปลาย
    const settle = seg(p, 0.2, 0.8);
    const osc = 160 * (1 - easeOut(settle)) * Math.cos(settle * Math.PI * 7);
    const fill = easeOut(seg(p, 0.05, 0.25));
    const set = (m: THREE.Mesh | null, ground: number, level: number) => {
      if (!m) return;
      const tp = ground + (level - ground) * fill;
      const h = Math.max(1, tp - (ground + 40));
      m.scale.set(1, h, 1);
      m.position.y = ground + 40 + h / 2;
    };
    set(wA.current, ga, hose.level + osc);
    set(wB.current, gb, hose.level - osc);
  });

  return (
    <>
      <group ref={g} visible={false}>
        <mesh geometry={tube} material={MAT.hose} renderOrder={3} />
        <mesh ref={wA} position={[hose.a.x, 0, hose.a.z]} material={MAT.water}>
          <cylinderGeometry args={[11, 11, 1, 10]} />
        </mesh>
        <mesh ref={wB} position={[hose.b.x, 0, hose.b.z]} material={MAT.water}>
          <cylinderGeometry args={[11, 11, 1, 10]} />
        </mesh>
      </group>
      <FloatText at={[hose.a.x, hose.level + 40, hose.a.z]} show={() => seg(ANIM.special, 0.3, 0.45)} text={hose.labels[0]} />
      <FloatText at={[hose.b.x, hose.level + 40, hose.b.z]} show={() => seg(ANIM.special, 0.82, 0.95)} text={hose.labels[1]} />
    </>
  );
}

// ─────────────── ขีด/จับ แล้วเจาะ (ขั้น 3-7, 3-8, 5-2) ───────────────
function MarkDrill({ jointId, poses, texts }: { jointId: string; poses: Record<number, FramePose>; texts: [string, string] }) {
  const j = JOINT_BY_ID.get(jointId);
  const dot = useRef<THREE.Mesh>(null);
  const drill = useRef<THREE.Group>(null);
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
      // ดอกสว่านเข้ามาตามแนวรู → เจาะเข้า → ถอยออก
      const come = easeInOut(seg(p, 0.3, 0.5));
      const dig = Math.sin(Math.PI * seg(p, 0.5, 0.88)) * 30;
      const off = (1 - come) * 250 - dig;
      drill.current.position.copy(geo.top).addScaledVector(geo.axis, -off);
      drill.current.quaternion.copy(geo.q);
      drill.current.rotateY(p * 60);
    }
  });
  if (!geo) return null;
  const at: V3 = [geo.top.x - geo.axis.x * 140, geo.top.y - geo.axis.y * 140 + 40, geo.top.z - geo.axis.z * 140];
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
      <FloatText at={at} show={() => (ANIM.special > 0 && ANIM.special < 1 ? 1 : 0)} text={() => (ANIM.special < 0.3 ? texts[0] : texts[1])} />
    </>
  );
}

/** ข้อความตอนขันน็อต: ขันจนแหวนแนบ → หมุนเพิ่ม 1/4 รอบ */
function TightenLabel({ jointId, poses }: { jointId: string; poses: Record<number, FramePose> }) {
  const j = JOINT_BY_ID.get(jointId);
  const at = useMemo(() => (j ? jointPoint(j, poses, -90) : null), [j, poses]);
  if (!at) return null;
  return (
    <FloatText
      at={at}
      show={() => (ANIM.tighten[jointId] === undefined || ANIM.tighten[jointId] <= 0 ? 0 : 1)}
      text={() => ((ANIM.tighten[jointId] ?? 0) < 0.6 ? 'ขันตัวเมียจนแหวนแนบสนิท' : 'หมุนเพิ่มอีก ¼ รอบ')}
    />
  );
}

// ─────────────── ระดับน้ำลูกน้ำทาบเสา 2 ด้าน (ขั้น 4-4) ───────────────
const LEVEL = { length: 600, width: 50, thick: 28 };
function Plumb() {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const bubbles = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(() => {
    const p = ANIM.special;
    PLUMB.forEach((_, i) => {
      const w = i === 0 ? seg(p, 0, 0.47) : seg(p, 0.5, 0.97);
      const g = refs.current[i];
      if (g) g.visible = w > 0 && w < 1;
      const b = bubbles.current[i];
      // ฟองอากาศแกว่งแล้วนิ่งตรงกลาง
      const s = seg(w, 0.15, 0.85);
      if (b) b.position.x = 30 * (1 - easeOut(s)) * Math.cos(s * Math.PI * 5);
    });
  });
  return (
    <>
      {PLUMB.map((f, i) => {
        // แกน x ของกลุ่ม = แนวราบบนหน้าเสา (ทิศที่ฟองเลื่อน) · แกน z = ทิศตั้งฉากหน้าเสา
        const n = new THREE.Vector3(...f.normal);
        const across = new THREE.Vector3(0, 1, 0).cross(n).normalize();
        const m = new THREE.Matrix4().makeBasis(across, new THREE.Vector3(0, 1, 0), n).setPosition(...f.at);
        return (
          <group key={i}>
            <group ref={(el) => (refs.current[i] = el)} matrix={m} matrixAutoUpdate={false} visible={false}>
              <mesh material={MAT.level} scale={[LEVEL.width, LEVEL.length, LEVEL.thick]} geometry={UNIT_BOX} />
              {/* หลอดฟองแนวนอนที่หัวระดับ */}
              <mesh material={MAT.hose} position={[0, LEVEL.length / 2 - 60, LEVEL.thick / 2 + 6]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[14, 14, 90, 12]} />
              </mesh>
              <mesh ref={(el) => (bubbles.current[i] = el)} material={MAT.bubble} position={[0, LEVEL.length / 2 - 60, LEVEL.thick / 2 + 8]}>
                <sphereGeometry args={[11, 12, 10]} />
              </mesh>
            </group>
            <FloatText
              at={[f.at[0], f.at[1] + LEVEL.length / 2 + 80, f.at[2]]}
              show={() => (i === 0 ? seg(ANIM.special, 0.32, 0.4) - seg(ANIM.special, 0.47, 0.5) : seg(ANIM.special, 0.82, 0.9))}
              text={f.label}
            />
          </group>
        );
      })}
    </>
  );
}

// ─────────────── ผสมคอนกรีต 1 : 2 : 3 (ขั้น 4-9) ───────────────
const MIX = SPEC.footing.mix;
const BUCKETS = [
  ...Array.from({ length: MIX.cement }, () => ({ color: '#9ca3af' })),
  ...Array.from({ length: MIX.sand }, () => ({ color: '#d6b97b' })),
  ...Array.from({ length: MIX.stone }, () => ({ color: '#57534e' })),
];
function MixConcrete() {
  const buckets = useRef<(THREE.Mesh | null)[]>([]);
  const mound = useRef<THREE.Mesh>(null);
  const moundMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#a8a29e', roughness: 0.95 }), []);
  const mats = useMemo(() => BUCKETS.map((b) => new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.9 })), []);
  const [x0, gy, z0] = MIX_AT;
  const pos = (i: number): V3 => [x0 - 750 + i * 300, gy + 110, z0];
  const dry = useMemo(() => new THREE.Color('#b8b2a7'), []);
  const wet = useMemo(() => new THREE.Color('#6b6561'), []);
  useFrame(() => {
    const p = ANIM.special;
    const n = BUCKETS.length;
    buckets.current.forEach((m, i) => {
      if (!m) return;
      const inS = easeOut(seg(p, (i / n) * 0.4, (i / n) * 0.4 + 0.08));
      const out = 1 - easeInOut(seg(p, 0.5, 0.65));
      m.scale.setScalar(Math.max(0.001, inS * out));
    });
    if (mound.current) {
      const s = Math.max(0.001, easeOut(seg(p, 0.55, 0.75)));
      mound.current.scale.set(s, s, s);
      moundMat.color.lerpColors(dry, wet, seg(p, 0.75, 0.95));
    }
  });
  const label = (i0: number, i1: number, text: string, from: number) => {
    const a = pos(i0);
    const b = pos(i1);
    return <FloatText key={text} at={[(a[0] + b[0]) / 2, gy + 330, z0]} show={() => seg(ANIM.special, from, from + 0.05) - seg(ANIM.special, 0.5, 0.55)} text={text} />;
  };
  return (
    <>
      {BUCKETS.map((_, i) => (
        <mesh key={i} ref={(el) => (buckets.current[i] = el)} position={pos(i)} material={mats[i]} scale={0.001}>
          <cylinderGeometry args={[120, 100, 220, 16]} />
        </mesh>
      ))}
      <mesh ref={mound} position={[x0, gy + 120, z0]} material={moundMat} scale={0.001}>
        <coneGeometry args={[520, 240, 24]} />
      </mesh>
      {label(0, MIX.cement - 1, `ปูน ${MIX.cement}`, 0.02)}
      {label(MIX.cement, MIX.cement + MIX.sand - 1, `ทราย ${MIX.sand}`, 0.1)}
      {label(MIX.cement + MIX.sand, BUCKETS.length - 1, `หิน ${MIX.stone}`, 0.25)}
      <FloatText
        at={[x0, gy + 450, z0]}
        show={() => seg(ANIM.special, 0.55, 0.62)}
        text={() => (ANIM.special < 0.75 ? 'คลุกแห้งให้เข้ากันก่อน' : 'ค่อย ๆ เติมน้ำจนข้นเหมือนโจ๊กข้น กำแล้วไม่ไหลหนี')}
      />
    </>
  );
}

// ─────────────── บ่มปูน 3 วัน (ขั้น 4-11) ───────────────
function Cure() {
  const days = SPEC.footing.cureDays;
  const dry = useMemo(() => new THREE.Color(COLORS.concrete), []);
  const wet = useMemo(() => new THREE.Color('#6b6561'), []);
  // ออกจากขั้นนี้แล้ว ปูนกลับเป็นสีแห้ง
  useEffect(
    () => () => {
      MAT.concrete.color.copy(dry);
    },
    [dry],
  );
  useFrame(() => {
    MAT.concrete.color.lerpColors(wet, dry, easeInOut(ANIM.special));
  });
  return (
    <FloatText
      at={[3000, 3300, -1500]}
      className="label3d callout big-card"
      show={() => (ANIM.special > 0 ? 1 : 0)}
      text={() => {
        const p = ANIM.special;
        if (p >= 0.999) return `ครบ ${days} วัน → ถอดไม้ค้ำชั่วคราวได้`;
        const d = Math.min(days, Math.floor(p * days) + 1);
        return `บ่มปูน วันที่ ${d} จาก ${days} · รดน้ำเช้าเย็น · ⚠️ ห้ามขยับโครง`;
      }}
    />
  );
}

// ─────────────── เทปพันขอบคม (ขั้น 6-2 เป็นต้นไป) ───────────────
function TapeBands() {
  return (
    <>
      {TAPE_BANDS.map((b, i) => {
        const mesh = <mesh geometry={UNIT_BOX} material={MAT.tape} matrix={boxMatrix(b.piece)} matrixAutoUpdate={false} />;
        const center = b.frame ? (new THREE.Vector3(...b.piece.center).applyMatrix4(frameMatrix(b.frame)).toArray() as V3) : b.piece.center;
        return (
          <Enter key={i} tag="tape" mode="pop" center={center} k={i} n={TAPE_BANDS.length}>
            {b.frame ? (
              <group matrix={frameMatrix(b.frame)} matrixAutoUpdate={false}>
                {mesh}
              </group>
            ) : (
              mesh
            )}
          </Enter>
        );
      })}
    </>
  );
}

// ─────────────── ลวดสปริงกดลงราง (ขั้น 6-3 ถึง 6-5) ───────────────
const HOUSE_CENTER = new THREE.Vector3(3000, 1200, -1500);
/** ลวดหยักตามแนวราง วางที่ผิวนอกของราง */
function springPoints(railId: string): V3[] {
  const r = RAILS.find((x) => x.id === railId);
  if (!r) return [];
  const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...r.piece.rot));
  const axes = [0, 1, 2].map((i) => new THREE.Vector3().setFromMatrixColumn(m, i));
  const order = [0, 1, 2].sort((a, b) => r.piece.size[b] - r.piece.size[a]); // ยาว → กว้าง → หนา
  const along = axes[order[0]];
  const across = axes[order[1]];
  const out = axes[order[2]].clone();
  const c = new THREE.Vector3(...r.piece.center);
  if (out.dot(c.clone().sub(HOUSE_CENTER)) < 0) out.negate();
  const len = r.piece.size[order[0]];
  const half = r.piece.size[order[1]] / 2 - 6;
  const base = c.clone().addScaledVector(along, -len / 2).addScaledVector(out, r.piece.size[order[2]] / 2 + 3);
  const pts: V3[] = [];
  const stepLen = 45;
  for (let i = 0; i * stepLen <= len; i++) {
    const p = base.clone().addScaledVector(along, i * stepLen).addScaledVector(across, i % 2 ? half : -half);
    pts.push([p.x, p.y, p.z]);
  }
  return pts;
}
function Springs({ railIds }: { railIds: string[] }) {
  const lines = useMemo(() => railIds.map(springPoints).filter((p) => p.length > 1), [railIds]);
  return (
    <>
      {lines.map((pts, i) => (
        <SpringLine key={i} pts={pts} k={i} n={lines.length} />
      ))}
    </>
  );
}
function SpringLine({ pts, k, n }: { pts: V3[]; k: number; n: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);
  const len = useMemo(() => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2]), 0), [pts]);
  useFrame(() => {
    const mat = ref.current?.material;
    if (!mat) return;
    const p = itemT(ANIM.special, k, n);
    mat.dashSize = Math.max(0.01, p * len);
    mat.gapSize = len * 4;
  });
  return <Line ref={ref} points={pts} color="#f59e0b" lineWidth={2} dashed dashSize={0.01} gapSize={len * 4} />;
}
