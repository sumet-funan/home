/** พื้นดิน หลุมฐาน คอนกรีต หมุด เชือก ลานประกอบ ไม้ค้ำ กองวัสดุ */
import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import {
  ASSEMBLY_SLAB,
  D,
  MARKERS,
  PITS,
  ROPES,
  TEMP_BRACES,

  groundY,
  frameMatrix,
  type FramePose,
  type Pit,
  type V2,
} from '../data/geometry';
import { ASSUMED, SPEC } from '../data/spec';
import { COLORS, MAT, MAT_X } from './materials';
import { boxMatrix, UNIT_BOX } from './geom3';

const lastX = D.frameX(SPEC.layout.frameCount);
const clear = SPEC.site.clearAround;
const FS = SPEC.footing.size;

/** พื้นผิวเรียบตามความลาด (groundY เป็นระนาบ จึงยกจุดยอดได้ตรง) สร้างจากรูป (x, u) */
function groundGeometry(outer: V2[], holes: V2[][], lift = 0) {
  const s = new THREE.Shape(outer.map(([x, u]) => new THREE.Vector2(x, u)));
  for (const h of holes) s.holes.push(new THREE.Path(h.map(([x, u]) => new THREE.Vector2(x, u))));
  const g = new THREE.ShapeGeometry(s);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const u = pos.getY(i);
    pos.setXYZ(i, x, groundY(x, -u) + lift, -u);
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
  // ให้ด้านหน้าหันขึ้นฟ้า
  const n = g.attributes.normal as THREE.BufferAttribute;
  if (n.getY(0) < 0) {
    g.index && g.setIndex(Array.from(g.index.array).reverse());
    g.computeVertexNormals();
  }
  return g;
}

const square = (cx: number, cu: number, half: number): V2[] => [
  [cx - half, cu - half],
  [cx + half, cu - half],
  [cx + half, cu + half],
  [cx - half, cu + half],
];

export interface SiteOpts {
  visible: Set<string>;
  poses: Record<number, FramePose>;
  xray: boolean;
  /** วันบ่มปูน (0–3) ใช้เปลี่ยนสีปูนตอนแอนิเมชัน */
  cureDay?: number;
}

export function Site({ o }: { o: SiteOpts }) {
  const vis = (t: string) => o.visible.has(t);
  const dugMain = vis('pits-main');
  const dugGable = vis('gable-pits');
  const dug = PITS.filter((p) => (p.gable ? dugGable : dugMain));

  const geos = useMemo(() => {
    const big = 30000;
    const patch: V2[] = [
      [-clear, -clear],
      [lastX + clear, -clear],
      [lastX + clear, D.W + clear],
      [-clear, D.W + clear],
    ];
    const outer: V2[] = [
      [lastX / 2 - big, D.HALF - big],
      [lastX / 2 + big, D.HALF - big],
      [lastX / 2 + big, D.HALF + big],
      [lastX / 2 - big, D.HALF + big],
    ];
    const holes = dug.map((p) => square(p.x, -p.z, FS / 2));
    return {
      outer: groundGeometry(outer, [patch], -1),
      patch: groundGeometry(patch, holes),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dug.map((p) => p.id).join()]);


  const patchMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: vis('grass-cut') ? '#8a7752' : COLORS.grassTall, roughness: 1, transparent: o.xray, opacity: o.xray ? 0.35 : 1, depthWrite: !o.xray }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vis('grass-cut'), o.xray],
  );
  const grassMat = useMemo(() => new THREE.MeshStandardMaterial({ color: COLORS.grass, roughness: 1, transparent: o.xray, opacity: o.xray ? 0.35 : 1, depthWrite: !o.xray }), [o.xray]);

  return (
    <group>
      <mesh geometry={geos.outer} material={grassMat} receiveShadow />
      <mesh geometry={geos.patch} material={patchMat} receiveShadow />
      {dug.map((p) => (
        <PitView key={p.id} p={p} o={o} />
      ))}
      {vis('slab') && <AssemblySlab poses={o.poses} supports={vis('supports')} />}
      {TEMP_BRACES.filter((t) => vis(`temp-${t.frame}`)).map((t) => (
        <mesh key={t.id} geometry={UNIT_BOX} material={MAT.wood} matrix={boxMatrix(t.piece)} matrixAutoUpdate={false} castShadow />
      ))}
      <Markers visible={o.visible} />
      <Ropes visible={o.visible} />
      {(vis('pile') || vis('pile-trial')) && <Pile full={vis('pile')} />}
    </group>
  );
}

function PitView({ p, o }: { p: Pit; o: SiteOpts }) {
  const vis = (t: string) => o.visible.has(t);
  const bottom = p.ground - p.depth;
  const padTop = bottom + SPEC.footing.pad;
  const hasPad = p.gable ? vis('gable-pits') : vis('pads-main');
  const filled = p.gable ? vis('gable-concrete') : vis('concrete-main');
  const covered = !p.gable && vis('pit-covers');
  const frameNo = Math.round(p.x / SPEC.layout.bay) + 1;
  const postIn = p.gable ? vis('gable-posts') : vis(`bricks-${frameNo}`);
  const concrete = o.xray ? MAT_X.concrete : MAT.concrete;
  const mound = SPEC.footing.moundAboveGround;
  return (
    <group>
      {/* ผนังหลุม (มองเห็นด้านใน) */}
      <mesh geometry={UNIT_BOX} material={MAT.pitWall} position={[p.x, (p.ground + bottom) / 2, p.z]} scale={[FS, p.depth, FS]} />
      {hasPad && <mesh geometry={UNIT_BOX} material={concrete} position={[p.x, bottom + SPEC.footing.pad / 2, p.z]} scale={[FS - 2, SPEC.footing.pad, FS - 2]} />}
      {postIn && (
        <mesh geometry={UNIT_BOX} material={MAT.block} position={[p.x, (padTop + p.postBottomY) / 2, p.z]} scale={[180, p.postBottomY - padTop, 180]} />
      )}
      {filled && (
        <>
          <mesh geometry={UNIT_BOX} material={concrete} position={[p.x, (padTop + p.ground) / 2, p.z]} scale={[FS - 2, p.ground - padTop, FS - 2]} />
          <mesh position={[p.x, p.ground + mound / 2, p.z]} rotation={[0, Math.PI / 4, 0]} material={concrete}>
            <cylinderGeometry args={[60, (FS / 2) * Math.SQRT2, mound, 4]} />
          </mesh>
        </>
      )}
      {covered && <mesh geometry={UNIT_BOX} material={MAT.wood} position={[p.x, p.ground + 10, p.z]} scale={[420, 20, 420]} castShadow />}
    </group>
  );
}

function AssemblySlab({ poses, supports }: { poses: Record<number, FramePose>; supports: boolean }) {
  const s = ASSEMBLY_SLAB;
  const g = groundY(s.cx, s.cz);
  const flatFrames = Object.entries(poses).filter(([, p]) => p.kind === 'flat').length;
  return (
    <group>
      <mesh geometry={UNIT_BOX} material={MAT.concrete} position={[s.cx, (g + s.top) / 2 - 20, s.cz]} scale={[s.sizeX, s.top - g + 40, s.sizeZ]} receiveShadow />
      {/* ไม้หนุน 5 ท่อน วางขวางใต้โครง: ใต้ปลายเสา กลางเสา มุมไหล่ คานรัด และใกล้สัน */}
      {supports &&
        flatFrames > 0 &&
        [100, 900, 1450, 2000, 2400].map((y) => {
          const x = new THREE.Vector3(0, y, 0).applyMatrix4(frameMatrix(1, { kind: 'flat', stack: 0 })).x;
          return (
            <mesh
              key={y}
              geometry={UNIT_BOX}
              material={MAT.wood}
              position={[x, s.top + ASSUMED.assemblySupport / 2, s.cz]}
              scale={[90, ASSUMED.assemblySupport, D.W + 400]}
              castShadow
              receiveShadow
            />
          );
        })}
    </group>
  );
}

function Markers({ visible }: { visible: Set<string> }) {
  const shown = MARKERS.filter((m) => visible.has(m.tag));
  return (
    <group>
      {shown.map((m) => {
        const [x, y, z] = m.at;
        if (m.kind === 'pin')
          return (
            <group key={m.id} position={[x, y, z]}>
              <mesh material={MAT.pin} position={[0, 120, 0]}>
                <cylinderGeometry args={[6, 6, 240, 8]} />
              </mesh>
              <mesh material={MAT.pin} position={[0, 250, 0]}>
                <sphereGeometry args={[22, 12, 8]} />
              </mesh>
            </group>
          );
        if (m.kind === 'hook')
          return (
            <mesh key={m.id} material={MAT.rail} position={[x, y + 60, z]}>
              <torusGeometry args={[30, 6, 6, 12, Math.PI]} />
            </mesh>
          );
        const h = m.kind === 'refStake' ? 700 : 500;
        return <mesh key={m.id} geometry={UNIT_BOX} material={MAT.wood} position={[x, y + h / 2 - 150, z]} scale={[40, h, 40]} castShadow />;
      })}
      {visible.has('level-marks') &&
        MARKERS.filter((m) => m.kind === 'stake' && visible.has(m.tag)).map((m) => (
          <mesh key={`lm${m.id}`} geometry={UNIT_BOX} material={MAT.pin} position={[m.at[0], SPEC.site.levelHoseMarkHeight, m.at[2]]} scale={[46, 6, 46]} />
        ))}
    </group>
  );
}

function Ropes({ visible }: { visible: Set<string> }) {
  const shown = ROPES.filter((r) => visible.has(r.tag));
  const color = { layout: COLORS.rope, guide: '#fb923c', roof: COLORS.roofRope, tape: COLORS.tape } as const;
  return (
    <group>
      {shown.map((r) => (
        <Line key={r.id} points={r.points} color={color[r.look]} lineWidth={r.look === 'tape' ? 3 : 2} />
      ))}
    </group>
  );
}

/** กองวัสดุทางตะวันออกเฉียงเหนือของแปลง (ชิ้นใหม่ลอยออกจากที่นี่ตอนแอนิเมชัน) */
export const PILE_ORIGIN: [number, number, number] = [-2600, 0, 2400];
function Pile({ full }: { full: boolean }) {
  const [px, , pz] = PILE_ORIGIN;
  const g = groundY(px, pz);
  const bars: { len: number; w: number; h: number; n: number; dz: number }[] = full
    ? [
        { len: 1800, w: 25, h: 50, n: 20, dz: 0 },
        { len: 2325, w: 25, h: 50, n: 4, dz: 450 },
        { len: 1470, w: 25, h: 25, n: 24, dz: 800 },
        { len: 6000, w: 25, h: 25, n: 1, dz: 1150 },
        { len: 1550, w: 25, h: 25, n: 15, dz: 1350 },
      ]
    : [
        { len: 1800, w: 25, h: 50, n: 4, dz: 0 },
        { len: 1470, w: 25, h: 25, n: 1, dz: 450 },
      ];
  return (
    <group position={[px, g, pz]}>
      {bars.flatMap((b, bi) =>
        Array.from({ length: b.n }, (_, i) => {
          const perRow = 8;
          const row = Math.floor(i / perRow);
          const col = i % perRow;
          return (
            <mesh
              key={`${bi}.${i}`}
              geometry={UNIT_BOX}
              material={MAT.steel}
              position={[b.len / 2 - 900, 60 + row * (b.h + 2) + b.h / 2, b.dz + col * (b.w + 4)]}
              scale={[b.len, b.h, b.w]}
              castShadow
            />
          );
        }),
      )}
      {[0, 1].map((i) => (
        <mesh key={`sl${i}`} geometry={UNIT_BOX} material={MAT.wood} position={[i ? 1600 : -500, 30, 700]} scale={[80, 60, 1800]} />
      ))}
    </group>
  );
}
