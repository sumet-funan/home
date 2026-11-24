/** พื้นดิน หลุมฐาน คอนกรีต หมุด เชือก ลานประกอบ ไม้ค้ำ กองวัสดุ */
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { ASSEMBLY_SLAB, D, MARKERS, PITS, ROPES, TEMP_BRACES, groundY, frameMatrix, type FramePose, type Pit, type Rope, type V2 } from '../data/geometry';
import { ASSUMED, SPEC } from '../data/spec';
import { enterOf } from '../anim/state';
import { COLORS, MAT, MAT_X } from './materials';
import { boxMatrix, UNIT_BOX } from './geom3';
import { Enter, itemT } from './Enter';
import { PILE_ORIGIN } from './pile';

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
  const temps = TEMP_BRACES.filter((t) => vis(`temp-${t.frame}`));

  return (
    <group>
      <mesh geometry={geos.outer} material={grassMat} receiveShadow />
      <mesh geometry={geos.patch} material={patchMat} receiveShadow />
      {dug.map((p) => {
        const same = dug.filter((q) => q.gable === p.gable);
        return <PitView key={p.id} p={p} o={o} k={same.indexOf(p)} n={same.length} />;
      })}
      {vis('slab') && <AssemblySlab poses={o.poses} supports={vis('supports')} />}
      {temps.map((t) => (
        <Enter key={t.id} tag={`temp-${t.frame}`} center={t.piece.center}>
          <mesh geometry={UNIT_BOX} material={MAT.wood} matrix={boxMatrix(t.piece)} matrixAutoUpdate={false} castShadow />
        </Enter>
      ))}
      <Markers visible={o.visible} />
      <Ropes visible={o.visible} />
      {(vis('pile') || vis('pile-trial')) && (
        <Enter tag={vis('pile') ? 'pile' : 'pile-trial'}>
          <Pile full={vis('pile')} />
        </Enter>
      )}
    </group>
  );
}

function PitView({ p, o, k, n }: { p: Pit; o: SiteOpts; k: number; n: number }) {
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
  const pitTag = p.gable ? 'gable-pits' : 'pits-main';
  const padTag = p.gable ? 'gable-pits' : 'pads-main';
  const fillTag = p.gable ? 'gable-concrete' : 'concrete-main';
  return (
    <group>
      {/* ผนังหลุม (มองเห็นด้านใน) — ขุดลงจากผิวดิน */}
      <Enter tag={pitTag} k={k} n={n} pivotY={p.ground}>
        <mesh geometry={UNIT_BOX} material={MAT.pitWall} position={[p.x, (p.ground + bottom) / 2, p.z]} scale={[FS, p.depth, FS]} />
      </Enter>
      {hasPad && (
        <Enter tag={padTag} mode="grow" k={k} n={n} pivotY={bottom}>
          <mesh geometry={UNIT_BOX} material={concrete} position={[p.x, bottom + SPEC.footing.pad / 2, p.z]} scale={[FS - 2, SPEC.footing.pad, FS - 2]} />
        </Enter>
      )}
      {postIn && (
        <Enter tag={p.gable ? 'gable-posts' : `bricks-${frameNo}`} mode="drop">
          <mesh geometry={UNIT_BOX} material={MAT.block} position={[p.x, (padTop + p.postBottomY) / 2, p.z]} scale={[180, p.postBottomY - padTop, 180]} />
        </Enter>
      )}
      {filled && (
        <Enter tag={fillTag} k={k} n={n} pivotY={padTop}>
          <mesh geometry={UNIT_BOX} material={concrete} position={[p.x, (padTop + p.ground) / 2, p.z]} scale={[FS - 2, p.ground - padTop, FS - 2]} />
          <mesh position={[p.x, p.ground + mound / 2, p.z]} rotation={[0, Math.PI / 4, 0]} material={concrete}>
            <cylinderGeometry args={[60, (FS / 2) * Math.SQRT2, mound, 4]} />
          </mesh>
        </Enter>
      )}
      {covered && (
        <Enter tag="pit-covers" k={k} n={n}>
          <mesh geometry={UNIT_BOX} material={MAT.wood} position={[p.x, p.ground + 10, p.z]} scale={[420, 20, 420]} castShadow />
        </Enter>
      )}
    </group>
  );
}

/** ไม้หนุน 5 ท่อน วางขวางใต้โครง: ใต้ปลายเสา กลางเสา มุมไหล่ คานรัด และใกล้สัน (y ในพิกัดโครง) */
const SUPPORT_Y = [100, 900, 1450, 2000, 2400];

function AssemblySlab({ poses, supports }: { poses: Record<number, FramePose>; supports: boolean }) {
  const s = ASSEMBLY_SLAB;
  const g = groundY(s.cx, s.cz);
  const flatFrames = Object.entries(poses).filter(([, p]) => p.kind === 'flat').length;
  return (
    <group>
      <Enter tag="slab" mode="pop" center={[s.cx, s.top, s.cz]}>
        <mesh geometry={UNIT_BOX} material={MAT.concrete} position={[s.cx, (g + s.top) / 2 - 20, s.cz]} scale={[s.sizeX, s.top - g + 40, s.sizeZ]} receiveShadow />
      </Enter>
      {supports &&
        flatFrames > 0 &&
        SUPPORT_Y.map((y, i) => {
          const x = new THREE.Vector3(0, y, 0).applyMatrix4(frameMatrix(1, { kind: 'flat', stack: 0 })).x;
          return (
            <Enter key={y} tag="supports" k={i} n={SUPPORT_Y.length}>
              <mesh
                geometry={UNIT_BOX}
                material={MAT.wood}
                position={[x, s.top + ASSUMED.assemblySupport / 2, s.cz]}
                scale={[90, ASSUMED.assemblySupport, D.W + 400]}
                castShadow
                receiveShadow
              />
            </Enter>
          );
        })}
    </group>
  );
}

function Markers({ visible }: { visible: Set<string> }) {
  const shown = MARKERS.filter((m) => visible.has(m.tag));
  const stakes = MARKERS.filter((m) => m.kind === 'stake' && visible.has(m.tag));
  return (
    <group>
      {shown.map((m) => {
        const [x, y, z] = m.at;
        const same = shown.filter((q) => q.tag === m.tag);
        let body: JSX.Element;
        if (m.kind === 'pin')
          body = (
            <group position={[x, y, z]}>
              <mesh material={MAT.pin} position={[0, 120, 0]}>
                <cylinderGeometry args={[6, 6, 240, 8]} />
              </mesh>
              <mesh material={MAT.pin} position={[0, 250, 0]}>
                <sphereGeometry args={[22, 12, 8]} />
              </mesh>
            </group>
          );
        else if (m.kind === 'hook')
          body = (
            <mesh material={MAT.rail} position={[x, y + 60, z]}>
              <torusGeometry args={[30, 6, 6, 12, Math.PI]} />
            </mesh>
          );
        else {
          const h = m.kind === 'refStake' ? 700 : 500;
          body = <mesh geometry={UNIT_BOX} material={MAT.wood} position={[x, y + h / 2 - 150, z]} scale={[40, h, 40]} castShadow />;
        }
        return (
          <Enter key={m.id} tag={m.tag} k={same.indexOf(m)} n={same.length}>
            {body}
          </Enter>
        );
      })}
      {visible.has('level-marks') &&
        stakes.map((m, i) => {
          // ขีดระดับ = ผิวน้ำในสายยาง (สูงจากดินจุดต่ำสุด 50 ซม.)
          const at: [number, number, number] = [m.at[0], SPEC.site.levelHoseMarkHeight, m.at[2]];
          return (
            <Enter key={`lm${m.id}`} tag="level-marks" mode="pop" center={at} k={i} n={stakes.length}>
              <mesh geometry={UNIT_BOX} material={MAT.pin} position={at} scale={[46, 6, 46]} />
            </Enter>
          );
        })}
    </group>
  );
}

const ROPE_COLOR = { layout: COLORS.rope, guide: '#fb923c', roof: COLORS.roofRope, tape: COLORS.tape } as const;

function Ropes({ visible }: { visible: Set<string> }) {
  const shown = ROPES.filter((r) => visible.has(r.tag));
  return (
    <group>
      {shown.map((r) => {
        const same = shown.filter((q) => q.tag === r.tag);
        return <RopeLine key={r.id} r={r} k={same.indexOf(r)} n={same.length} />;
      })}
    </group>
  );
}

const ropeLength = (r: Rope) =>
  r.points.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - r.points[i][0], p[1] - r.points[i][1], p[2] - r.points[i][2]), 0);

/** เชือก/เทปวัด — ลากจากต้นไปปลายตอนปรากฏ (ใช้เส้นประที่ยาวเท่าความคืบหน้า) */
function RopeLine({ r, k, n }: { r: Rope; k: number; n: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const line = useRef<any>(null);
  const label = useRef<HTMLDivElement>(null);
  const len = useMemo(() => ropeLength(r), [r]);
  const a = r.points[0];
  const b = r.points[r.points.length - 1];
  // ป้ายความยาวที่ 1/3 ของเส้น (เส้นทแยงสองเส้นตัดกันตรงกลาง ป้ายจะได้ไม่ทับกัน)
  const labelAt: [number, number, number] = [a[0] + (b[0] - a[0]) / 3, a[1] + (b[1] - a[1]) / 3 + 60, a[2] + (b[2] - a[2]) / 3];
  useFrame(() => {
    const p = itemT(enterOf(r.tag), k, n);
    const mat = line.current?.material;
    if (mat) {
      mat.dashSize = Math.max(0.01, p * len);
      mat.gapSize = len * 4;
    }
    if (label.current) label.current.style.opacity = p >= 1 ? '1' : '0';
  });
  return (
    <>
      <Line ref={line} points={r.points} color={ROPE_COLOR[r.look]} lineWidth={r.look === 'tape' ? 3 : 2} dashed dashSize={len} gapSize={len * 4} />
      {r.look === 'tape' && (
        <Html position={labelAt} zIndexRange={[15, 0]} style={{ pointerEvents: 'none' }}>
          <div ref={label} className="label3d dim">
            {(len / 1000).toFixed(2)} ม.
          </div>
        </Html>
      )}
    </>
  );
}

/** กองวัสดุทางตะวันออกเฉียงเหนือของแปลง (ชิ้นใหม่ลอยออกจากที่นี่ตอนแอนิเมชัน) */
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
