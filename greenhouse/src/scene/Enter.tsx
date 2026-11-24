/**
 * ห่อชิ้นส่วนของป้ายหนึ่ง ให้ปรากฏตามแบบใน anim/config.ts (ลอย หล่น ขุด ขยาย)
 * อ่านความคืบหน้าจาก ANIM.enter ทุกเฟรม
 */
import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { V3 } from '../data/geometry';
import { DROP_HEIGHT, FLY_ARC, enterMode, type EnterMode } from '../anim/config';
import { easeInOut, easeOut, enterOf, seg } from '../anim/state';
import { PILE_ORIGIN } from './pile';

export interface EnterProps {
  tag: string;
  mode?: EnterMode;
  /** จุดกลางของชิ้น ในพิกัดของกลุ่มแม่ (ใช้กับ fly และ pop) */
  center?: V3;
  /** เมทริกซ์ของกลุ่มแม่ → พิกัดโลก (ถ้ากลุ่มแม่หมุนอยู่ เช่นโครงที่นอนบนลาน) */
  parent?: THREE.Matrix4;
  /** ชิ้นที่ k จาก n ในป้ายเดียวกัน — ทยอยปรากฏ */
  k?: number;
  n?: number;
  /** ระดับที่ "ขุด/โต" เริ่ม (พิกัดกลุ่มแม่) */
  pivotY?: number;
  /** คลี่แผ่น: เริ่มจากจุด pivot แผ่ไปตามแกน axis */
  unroll?: { axis: V3; pivot: V3 };
  children: ReactNode;
}

/** ความคืบหน้าของชิ้นที่ k จาก n */
export const itemT = (p: number, k = 0, n = 1) => {
  if (n <= 1) return p;
  const start = (k / n) * 0.6;
  return seg(p, start, start + 0.4);
};

const PILE = new THREE.Vector3(PILE_ORIGIN[0], PILE_ORIGIN[1] + 300, PILE_ORIGIN[2]);
const tmp = new THREE.Vector3();

export function Enter({ tag, mode: modeIn, center, parent, k, n, pivotY = 0, unroll, children }: EnterProps) {
  const ref = useRef<THREE.Group>(null);
  const m0 = modeIn ?? enterMode(tag);
  const mode = m0 === 'unroll' && !unroll ? 'drop' : m0;
  const unrollM = useMemo(() => {
    if (!unroll) return null;
    const p = new THREE.Vector3(...unroll.pivot);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...unroll.axis).normalize());
    return {
      pre: new THREE.Matrix4().makeRotationFromQuaternion(q).setPosition(p),
      post: new THREE.Matrix4().makeRotationFromQuaternion(q.clone().invert()).multiply(new THREE.Matrix4().makeTranslation(-p.x, -p.y, -p.z)),
    };
  }, [unroll]);
  const { inv, centerWorld } = useMemo(() => {
    const q = new THREE.Quaternion();
    if (parent) q.setFromRotationMatrix(parent).invert();
    const c = new THREE.Vector3(...(center ?? [0, 0, 0]));
    if (parent) c.applyMatrix4(parent);
    return { inv: q, centerWorld: c };
  }, [parent, center]);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const raw = itemT(enterOf(tag), k, n);
    if (raw >= 1) {
      if (g.userData.anim) {
        g.matrixAutoUpdate = true;
        g.position.set(0, 0, 0);
        g.scale.set(1, 1, 1);
        g.visible = true;
        g.userData.anim = false;
      }
      return;
    }
    g.userData.anim = true;
    g.visible = raw > 0.001;
    const e = easeInOut(raw);
    switch (mode) {
      case 'fly': {
        tmp.copy(PILE).sub(centerWorld).multiplyScalar(1 - e);
        tmp.y += FLY_ARC * Math.sin(Math.PI * e) * 0.6;
        g.position.copy(tmp.applyQuaternion(inv));
        break;
      }
      case 'drop': {
        g.position.copy(tmp.set(0, DROP_HEIGHT * (1 - easeOut(raw)), 0).applyQuaternion(inv));
        break;
      }
      case 'grow': {
        const s = Math.max(0.001, easeOut(raw));
        g.scale.set(1, s, 1);
        g.position.set(0, pivotY * (1 - s), 0);
        break;
      }
      case 'pour': {
        // เทครึ่งหลุม → หยุดกระทุ้ง → เทจนเต็ม
        const f = raw < 0.4 ? (raw / 0.4) * 0.5 : raw < 0.6 ? 0.5 : 0.5 + ((raw - 0.6) / 0.4) * 0.5;
        const s = Math.max(0.001, f);
        g.scale.set(1, s, 1);
        g.position.set(0, pivotY * (1 - s), 0);
        break;
      }
      case 'unroll': {
        const s = Math.max(0.001, easeInOut(raw));
        g.matrixAutoUpdate = false;
        g.matrix.copy(unrollM!.pre).multiply(new THREE.Matrix4().makeScale(1, s, 1)).multiply(unrollM!.post);
        g.matrixWorldNeedsUpdate = true;
        break;
      }
      case 'pop': {
        const s = Math.max(0.001, easeOut(raw));
        const c = center ?? [0, 0, 0];
        g.scale.setScalar(s);
        g.position.set(c[0] * (1 - s), c[1] * (1 - s), c[2] * (1 - s));
        break;
      }
      default:
        g.position.set(0, 0, 0);
    }
  });
  return <group ref={ref}>{children}</group>;
}
