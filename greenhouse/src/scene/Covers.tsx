/** พลาสติก มุ้ง ม่าน สแลน ผ้าคลุม รางล็อก + พื้นและชั้นวาง */
import { useMemo } from 'react';
import { FLOOR, RAILS, SHEETS, groundY, type Sheet } from '../data/geometry';
import { ASSUMED, SPEC } from '../data/spec';

const D_HALF = SPEC.layout.width / 2;
import { MAT } from './materials';
import { boxMatrix, sheetGeometry, UNIT_BOX } from './geom3';
import { Enter } from './Enter';

const lookMat = { plastic: MAT.plastic, mesh: MAT.mesh, saran: MAT.saran, weed: MAT.weed } as const;

function SheetMesh({ s, onSelect }: { s: Sheet; onSelect: (id: string) => void }) {
  const g = useMemo(() => sheetGeometry(s), [s]);
  const lift = s.look === 'weed' ? 1 : 0;
  return (
    <mesh
      geometry={g}
      material={lookMat[s.look]}
      position={[0, lift, 0]}
      renderOrder={s.look === 'weed' ? 0 : 2}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(`sheet:${s.part}`);
      }}
    />
  );
}

export function Covers({ visible, showSkins, onSelect }: { visible: Set<string>; showSkins: boolean; onSelect: (id: string) => void }) {
  const skin = (s: Sheet) => s.look === 'weed' || showSkins;
  return (
    <group>
      {SHEETS.filter((s) => visible.has(s.tag) && skin(s)).map((s) => (
        <Enter key={s.id} tag={s.tag}>
          {s.look === 'weed' ? <WeedCover s={s} /> : <SheetMesh s={s} onSelect={onSelect} />}
        </Enter>
      ))}
      {RAILS.filter((r) => visible.has(r.tag)).map((r) => (
        <Enter key={r.id} tag={r.tag} center={r.piece.center}>
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
  return (
    <group>
      {visible.has('row-marks') && (
        <Enter tag="row-marks" center={[3000, 0, -D_HALF]}>
          {FLOOR.boxRows.map((r, i) => (
          <mesh key={`rm${i}`} geometry={UNIT_BOX} material={MAT.pin} position={[3000, groundY(3000, -(r.u0 + r.u1) / 2) + 8, -(r.u0 + r.u1) / 2]} scale={[5800, 4, r.u1 - r.u0 - 20]} />
          ))}
        </Enter>
      )}
      {visible.has('stacks') && (
        <Enter tag="stacks">
          {FLOOR.stacks.flatMap((s) =>
          Array.from({ length: fl.stacks.blocks }, (_, k) => (
            <mesh
              key={`${s.id}.${k}`}
              geometry={UNIT_BOX}
              material={MAT.block}
              position={[s.x, s.ground + bt * (k + 0.5), -s.u]}
              scale={[fl.block.width - 4, bt - 3, fl.block.length]}
              castShadow
              receiveShadow
            />
          )),
          )}
        </Enter>
      )}
      {visible.has('shelf-beams') && (
        <Enter tag="shelf-beams" center={[3000, 400, -D_HALF]}>
          {FLOOR.beams.map((b) => {
          const y = FLOOR.stacks[0].ground + fl.stacks.blocks * bt + SPEC.section.rect.wide / 2;
          return (
            <mesh
              key={b.id}
              geometry={UNIT_BOX}
              material={MAT.steel}
              position={[(b.x0 + b.x1) / 2, y, -b.u]}
              scale={[b.x1 - b.x0, SPEC.section.rect.wide, SPEC.section.rect.narrow]}
              castShadow
            />
          );
          })}
        </Enter>
      )}
      {visible.has('foam-boxes') && (
        <Enter tag="foam-boxes">
          {FLOOR.foam.map((f) => {
          const h = ASSUMED.foamBoxHeight;
          const y = FLOOR.stacks[0].ground + FLOOR.beamTop + h / 2;
          return (
            <mesh key={f.id} geometry={UNIT_BOX} material={MAT.foam} position={[f.x, y, -f.u]} scale={[fl.foamBox.length - 10, h, fl.foamBox.width - 10]} castShadow receiveShadow />
          );
          })}
        </Enter>
      )}
    </group>
  );
}
