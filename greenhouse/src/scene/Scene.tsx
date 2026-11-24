/** ฉาก 3 มิติทั้งหมด — หน่วยข้อมูลเป็น มม. ย่อทั้งฉากเป็นเมตรด้วย scale 0.001 */
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { D, frameMatrix, planeToLocal, type FramePose } from '../data/geometry';
import { SPEC } from '../data/spec';
import { CAMERAS, type CameraName } from '../data/steps';
import { Members } from './Members';
import { Site } from './Site';
import { Covers, Floor } from './Covers';
import { Compass, FrameNumbers, PartLabels } from './Labels';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export interface SceneProps {
  visible: Set<string>;
  poses: Record<number, FramePose>;
  highlight: Set<string>;
  selected: string | null;
  showSkins: boolean;
  showLabels: boolean;
  xray: boolean;
  camera: CameraName;
  onSelect: (id: string | null) => void;
}

const MM = 0.001;
const toM = (v: readonly number[]) => v.map((x) => x * MM) as [number, number, number];

const isMobile = typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 768);

export function Scene(p: SceneProps) {
  const controls = useRef<OrbitControlsImpl>(null);
  const cam = CAMERAS.overview;
  const viewOpts = useMemo(
    () => ({ visible: p.visible, poses: p.poses, highlight: p.highlight, selected: p.selected, xray: p.xray, onSelect: (id: string) => p.onSelect(id) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [p.visible, p.poses, p.highlight, p.selected, p.xray],
  );
  return (
    <Canvas
      shadows={!isMobile}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      camera={{ position: toM(cam.pos), fov: 45, near: 0.05, far: 200 }}
      onPointerMissed={() => p.onSelect(null)}
      gl={{ antialias: !isMobile }}
    >
      <color attach="background" args={['#cfe3ee']} />
      <fog attach="fog" args={['#cfe3ee', 30, 90]} />
      <hemisphereLight args={['#f8fafc', '#8a9a6a', 1.15]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[-6, 12, 8]}
        intensity={1.6}
        castShadow={!isMobile}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0004}
      />
      <Suspense fallback={null}>
        <group scale={MM}>
          <Site o={{ visible: p.visible, poses: p.poses, xray: p.xray }} />
          <Members o={viewOpts} />
          <Covers visible={p.visible} showSkins={p.showSkins} onSelect={(id) => p.onSelect(id)} />
          <Floor visible={p.visible} />
          <FrameMarks visible={p.visible} poses={p.poses} />
          {p.showLabels && (
            <>
              <PartLabels visible={p.visible} poses={p.poses} />
              <FrameNumbers poses={p.poses} />
            </>
          )}
          <Compass />
        </group>
      </Suspense>
      <OrbitControls ref={controls} makeDefault maxPolarAngle={Math.PI * 0.495} minDistance={0.3} maxDistance={40} enableDamping />
      <CameraRig name={p.camera} controls={controls} />
    </Canvas>
  );
}

/**
 * ย้ายกล้องไปมุมของขั้นนั้น (ไม่สร้าง Canvas ใหม่)
 * จอแนวตั้งถอยกล้องออกให้เห็นทั้งโรงเรือน
 */
function CameraRig({ name, controls }: { name: CameraName; controls: React.RefObject<OrbitControlsImpl> }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = CAMERAS[name];
    const t = new THREE.Vector3(...toM(cam.target));
    const p = new THREE.Vector3(...toM(cam.pos));
    const aspect = size.width / size.height;
    const k = Math.min(2, Math.max(1, Math.sqrt(1.5 / aspect)));
    camera.position.copy(t.clone().add(p.sub(t).multiplyScalar(k)));
    controls.current?.target.copy(t);
    controls.current?.update();
  }, [name, camera, controls, size.width, size.height]);
  return null;
}

/** เลขโครงและคำว่า "ใน" ที่เขียนด้วยปากกาเคมีบนเสา (ระยะ 3 ข้อ 10) */
function FrameMarks({ visible, poses }: { visible: Set<string>; poses: Record<number, FramePose> }) {
  const out: { key: string; at: [number, number, number]; text: string }[] = [];
  for (let f = 1; f <= SPEC.layout.frameCount; f++) {
    const pose = poses[f];
    if (!pose || !visible.has(`f${f}:marks`)) continue;
    for (const u of [0, D.W]) {
      const v = new THREE.Vector3(...planeToLocal([u, 500], 14)).applyMatrix4(frameMatrix(f, pose));
      out.push({ key: `${f}.${u}`, at: [v.x, v.y, v.z], text: `${f} ใน` });
    }
  }
  return (
    <>
      {out.map((m) => (
        <Html key={m.key} position={m.at} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <div style={{ color: '#111827', background: 'rgba(255,255,255,.85)', padding: '0 4px', borderRadius: 3, fontWeight: 700, fontSize: 11, transform: 'translate(-50%,-50%)' }}>{m.text}</div>
        </Html>
      ))}
    </>
  );
}
