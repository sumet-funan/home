/** ฉาก 3 มิติทั้งหมด — หน่วยข้อมูลเป็น มม. ย่อทั้งฉากเป็นเมตรด้วย scale 0.001 */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import type { FramePose } from '../data/geometry';
import { ANIM } from '../anim/state';
import { Members } from './Members';
import { Site } from './Site';
import { Covers, Floor } from './Covers';
import { Compass, FrameMarks, FrameNumbers, PartLabels, PinLetters } from './Labels';
import { Specials } from './Specials';

export interface SceneProps {
  visible: Set<string>;
  poses: Record<number, FramePose>;
  highlight: Set<string>;
  selected: string | null;
  showSkins: boolean;
  showLabels: boolean;
  xray: boolean;
  /** index ของขั้นที่กำลังแสดง */
  stepIdx: number;
  /** ป้ายชื่อที่แสดง (ชิ้นใหม่ของขั้น) · ไม่ส่ง = ทุกป้าย */
  labelTags?: Set<string>;
  /** น็อตที่เล่นแอนิเมชันในขั้นนี้ */
  animBolts: Set<string>;
  /** พื้นที่ที่แผงข้อความบังอยู่ (px) — กล้องจะจัดภาพให้อยู่กลางส่วนที่เหลือ */
  inset: { right: number; bottom: number };
  onSelect: (id: string | null) => void;
  /** ผู้ใช้เริ่มหมุนกล้องเอง */
  onUserOrbit: () => void;
}

const MM = 0.001;

export const isMobile = typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 768);

export function Scene(p: SceneProps) {
  const controls = useRef<OrbitControlsImpl>(null);
  const viewOpts = useMemo(
    () => ({ visible: p.visible, poses: p.poses, highlight: p.highlight, selected: p.selected, xray: p.xray, animBolts: p.animBolts, onSelect: (id: string) => p.onSelect(id) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [p.visible, p.poses, p.highlight, p.selected, p.xray, p.animBolts],
  );
  const c = ANIM.cam;
  return (
    <Canvas
      shadows={!isMobile}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      camera={{ position: [c.px, c.py, c.pz], fov: 45, near: 0.05, far: 200 }}
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
          <Covers visible={p.visible} showSkins={p.showSkins} highlight={p.highlight} onSelect={(id) => p.onSelect(id)} />
          <Floor visible={p.visible} />
          <FrameMarks visible={p.visible} poses={p.poses} />
          <Specials stepIdx={p.stepIdx} visible={p.visible} poses={p.poses} />
          <PinLetters visible={p.visible} />
          {p.showLabels && (
            <>
              <PartLabels visible={p.visible} poses={p.poses} only={p.labelTags} />
              <FrameNumbers poses={p.poses} />
            </>
          )}
          <Compass />
        </group>
      </Suspense>
      <OrbitControls ref={controls} makeDefault maxPolarAngle={Math.PI * 0.495} minDistance={0.3} maxDistance={40} enableDamping />
      <CameraRig controls={controls} inset={p.inset} onUserOrbit={p.onUserOrbit} />
    </Canvas>
  );
}

/**
 * กล้อง: ระหว่างเล่นขั้นตอน ไทม์ไลน์คุมกล้องผ่าน ANIM.cam
 * ถ้าผู้ใช้ลากหมุนเอง จะปล่อยให้หมุนอิสระ (โหมดหมุนดูเอง) จนกดกลับมุมแนะนำหรือเปลี่ยนขั้น
 * แผงข้อความบังจอส่วนไหน ภาพจะเลื่อนไปอยู่กลางส่วนที่เหลือ (setViewOffset)
 */
function CameraRig({ controls, inset, onUserOrbit }: { controls: React.RefObject<OrbitControlsImpl>; inset: { right: number; bottom: number }; onUserOrbit: () => void }) {
  const { camera, size } = useThree();
  const cb = useRef(onUserOrbit);
  cb.current = onUserOrbit;

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const w = size.width;
    const h = size.height;
    const r = Math.min(inset.right, w * 0.6);
    const b = Math.min(inset.bottom, h * 0.6);
    const fw = w - r;
    const fh = Math.max(1, h - b);
    ANIM.aspect = fw / fh;
    // มุมกล้อง 45° ครอบเฉพาะส่วนที่มองเห็น ภาพที่เลยไปใต้แผงยังวาดต่อ
    cam.aspect = fw / fh;
    if (r > 0 || b > 0) cam.setViewOffset(fw, fh, 0, 0, w, h);
    else cam.clearViewOffset();
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height, inset.right, inset.bottom]);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const start = () => {
      ANIM.camDriven = false;
      cb.current();
    };
    c.addEventListener('start', start);
    return () => c.removeEventListener('start', start);
  });

  useFrame(() => {
    const c = controls.current;
    if (!c) return;
    const a = ANIM.cam;
    if (ANIM.camDriven) {
      camera.position.set(a.px, a.py, a.pz);
      c.target.set(a.tx, a.ty, a.tz);
      camera.lookAt(c.target);
    } else {
      a.px = camera.position.x;
      a.py = camera.position.y;
      a.pz = camera.position.z;
      a.tx = c.target.x;
      a.ty = c.target.y;
      a.tz = c.target.z;
    }
  });
  return null;
}
