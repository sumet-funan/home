/** พลาสติก มุ้ง ม่าน สแลน ผ้าคลุม รางล็อก + พื้นและชั้นวาง */
import { useMemo } from 'react';
import { FLOOR, RAILS, SHEETS, groundY, type Sheet, type V3 } from '../data/geometry';
import { ASSUMED, SPEC } from '../data/spec';
import { enterMode } from '../anim/config';
import { MAT, MAT_NEW_SHEET } from './materials';
import { boxMatrix, sheetGeometry, UNIT_BOX } from './geom3';
import { Enter } from './Enter';
import { CurtainSheet, DoorSwing } from './Motions';

const D_HALF = SPEC.layout.width / 2;

/** แผ่นตั้ง/เอียง คลี่ลงจากขอบบน · แผ่นนอน คลี่ตามยาวจากด้านตะวันออก */
function unrollOf(s: Sheet): { axis: V3; pivot: V3 } {
  const ss = s.poly.map((p) => p[0]);
  const ts = s.poly.map((p) => p[1]);
  const at = (a: number, b: number): V3 => [0, 1, 2].map((i) => s.origin[i] + s.ax[i] * a + s.ay[i] * b) as V3;
  if (Math.abs(s.ay[1]) > 0.3) return { axis: s.ay.map((v) => -v) as V3, pivot: at(Math.min(...ss), Math.max(...ts)) };
  return { axis: s.ax, pivot: at(Math.min(...ss), Math.min(...ts)) };
}
const UNROLL = new Map(SHEETS.map((s) => [s.id, unrollOf(s)]));
const sheetCenter = (s: Sheet): V3 => {
  const ss = s.poly.map((p) => p[0]);
  const ts = s.poly.map((p) => p[1]);
  const a = (Math.min(...ss) + Math.max(...ss)) / 2;
  const b = (Math.min(...ts) + Math.max(...ts)) / 2;
  return [0, 1, 2].map((i) => s.origin[i] + s.ax[i] * a + s.ay[i] * b) as V3;
};
/** พลาสติกหลังคา: คลี่จากสันลงมา (ท่อนบนก่อน ท่อนล่างตาม) */
const roofOrder = (s: Sheet) => (s.id.startsWith('roof.') ? { k: 1 - Number(s.id.split('.')[2]), n: 2 } : {});

const lookMat = { plastic: MAT.plastic, mesh: MAT.mesh, saran: MAT.saran, weed: MAT.weed } as const;

function SheetMesh({ s, onSelect, isNew }: { s: Sheet; onSelect: (id: string) => void; isNew: boolean }) {
  const g = useMemo(() => sheetGeometry(s), [s]);
  const lift = s.look === 'weed' ? 1 : 0;
  return (
    <mesh
      geometry={g}
      material={(isNew ? MAT_NEW_SHEET : lookMat)[s.look]}
      position={[0, lift, 0]}
      renderOrder={s.look === 'weed' ? 0 : 2}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(`sheet:${s.part}`);
      }}
    />
  );
}

export function Covers({ visible, showSkins, onSelect, highlight }: { visible: Set<string>; showSkins: boolean; onSelect: (id: string) => void; highlight: Set<string> }) {
  const skin = (s: Sheet) => s.look === 'weed' || showSkins;
  const rails = RAILS.filter((r) => visible.has(r.tag));
  return (
    <group>
      {SHEETS.filter((s) => visible.has(s.tag) && skin(s)).map((s) => {
        const fly = enterMode(s.tag) === 'fly';
        let node = (
          <Enter key={s.id} tag={s.tag} unroll={fly ? undefined : UNROLL.get(s.id)} center={fly ? sheetCenter(s) : undefined} {...roofOrder(s)}>
            {s.look === 'weed' ? <WeedCover s={s} /> : <SheetMesh s={s} onSelect={onSelect} isNew={highlight.has(s.tag)} />}
          </Enter>
        );
        if (s.id === 'curtain.n') node = <CurtainSheet key={s.id}>{node}</CurtainSheet>;
        if (s.tag === 'door') node = <DoorSwing key={s.id}>{node}</DoorSwing>;
        return node;
      })}
      {rails.map((r, i) => (
        <Enter key={r.id} tag={r.tag} center={r.piece.center} k={i} n={rails.length}>
          <mesh geometry={UNIT_BOX} material={MAT.rail} matrix={boxMatrix(r.piece)} matrixAutoUpdate={false} />
        </Enter>
      ))}
    </group>
  );
}

/** ผ้าคลุมวัชพืชวางตามความลาดของดิน */
function WeedCover({ s }: { s: Sheet }) {
  const g = useMemo(() => {
    const geo = sheetGeometry(s).clone();
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, groundY(pos.getX(i), pos.getZ(i)) + 4);
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [s]);
  return <mesh geometry={g} material={MAT.weed} receiveShadow />;
}

export function Floor({ visible }: { visible: Set<string> }) {
  const fl = SPEC.floor;
  const bt = FLOOR.blockT;
  const beamY = FLOOR.stacks[0].ground + fl.stacks.blocks * bt + SPEC.section.rect.wide / 2;
  const foamH = ASSUMED.foamBoxHeight;
  const foamY = FLOOR.stacks[0].ground + FLOOR.beamTop + foamH / 2;
  return (
    <group>
      {visible.has('row-marks') && (
        <Enter tag="row-marks" center={[3000, 0, -D_HALF]}>
          {FLOOR.boxRows.map((r, i) => (
            <mesh key={`rm${i}`} geometry={UNIT_BOX} material={MAT.pin} position={[3000, groundY(3000, -(r.u0 + r.u1) / 2) + 8, -(r.u0 + r.u1) / 2]} scale={[5800, 4, r.u1 - r.u0 - 20]} />
          ))}
        </Enter>
      )}
      {visible.has('stacks') &&
        FLOOR.stacks.map((s, i) => (
          <Enter key={s.id} tag="stacks" k={i} n={FLOOR.stacks.length}>
            {Array.from({ length: fl.stacks.blocks }, (_, k) => (
              <mesh
                key={k}
                geometry={UNIT_BOX}
                material={MAT.block}
                position={[s.x, s.ground + bt * (k + 0.5), -s.u]}
                scale={[fl.block.width - 4, bt - 3, fl.block.length]}
                castShadow
                receiveShadow
              />
            ))}
          </Enter>
        ))}
      {visible.has('shelf-beams') &&
        FLOOR.beams.map((b, i) => (
          <Enter key={b.id} tag="shelf-beams" center={[(b.x0 + b.x1) / 2, beamY, -b.u]} k={i} n={FLOOR.beams.length}>
            <mesh geometry={UNIT_BOX} material={MAT.steel} position={[(b.x0 + b.x1) / 2, beamY, -b.u]} scale={[b.x1 - b.x0, SPEC.section.rect.wide, SPEC.section.rect.narrow]} castShadow />
          </Enter>
        ))}
      {visible.has('foam-boxes') &&
        FLOOR.foam.map((f, i) => (
          <Enter key={f.id} tag="foam-boxes" k={i} n={FLOOR.foam.length}>
            <mesh geometry={UNIT_BOX} material={MAT.foam} position={[f.x, foamY, -f.u]} scale={[fl.foamBox.length - 10, foamH, fl.foamBox.width - 10]} castShadow receiveShadow />
          </Enter>
        ))}
    </group>
  );
}
