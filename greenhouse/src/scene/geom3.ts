/** ตัวช่วยแปลงข้อมูลจาก geometry.ts เป็น geometry ของ three.js (หน่วย มม.) */
import * as THREE from 'three';
import { SPEC } from '../data/spec';
import type { BoxPiece, PlaneMember, Sheet, V2, V3 } from '../data/geometry';

const cache = new Map<string, THREE.BufferGeometry>();
const HOLE_R = SPEC.section.holeDia / 2;

const shapeFrom = (poly: V2[], holes: V2[][] = [], circles: V2[] = []) => {
  const s = new THREE.Shape(poly.map(([x, y]) => new THREE.Vector2(x, y)));
  for (const h of holes) s.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
  for (const [x, y] of circles) {
    const p = new THREE.Path();
    p.absarc(x, y, HOLE_R, 0, Math.PI * 2, true);
    s.holes.push(p);
  }
  return s;
};

/** ชิ้นในระนาบโครง: รีดรูป (u, y) ตามแนว a แล้ววางในพิกัดกลุ่มโครง (x = a, y, z = −u) */
export function planeGeometry(m: PlaneMember): THREE.BufferGeometry {
  const key = `p|${JSON.stringify(m.profile)}|${JSON.stringify(m.holes)}|${m.a}`;
  let g = cache.get(key);
  if (g) return g;
  g = new THREE.ExtrudeGeometry(shapeFrom(m.profile, [], m.holes), { depth: m.a[1] - m.a[0], bevelEnabled: false, curveSegments: 10 });
  g.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, m.a[0], 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 1));
  g.computeVertexNormals();
  cache.set(key, g);
  return g;
}

export function sheetGeometry(s: Sheet): THREE.BufferGeometry {
  const key = `s|${s.id}`;
  let g = cache.get(key);
  if (g) return g;
  g = new THREE.ShapeGeometry(shapeFrom(s.poly, s.holes));
  const ax = new THREE.Vector3(...s.ax);
  const ay = new THREE.Vector3(...s.ay);
  const n = new THREE.Vector3().crossVectors(ax, ay);
  const m = new THREE.Matrix4().makeBasis(ax, ay, n).setPosition(...s.origin);
  g.applyMatrix4(m);
  cache.set(key, g);
  return g;
}

export const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);

export function boxMatrix(b: BoxPiece): THREE.Matrix4 {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(b.rot[0], b.rot[1], b.rot[2], 'XYZ'));
  return new THREE.Matrix4().compose(new THREE.Vector3(...b.center), q, new THREE.Vector3(...b.size));
}

export const vec = (v: V3) => new THREE.Vector3(...v);
