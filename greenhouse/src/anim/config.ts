import { SPEC } from '../data/spec';
import { D } from '../data/geometry';

/**
 * ตั้งค่าแอนิเมชัน — แก้ความเร็ว ลำดับ และวิธีที่ชิ้นส่วนปรากฏได้ที่ไฟล์นี้ไฟล์เดียว
 *
 * หน่วยเวลาเป็นวินาทีที่ความเร็ว 1×
 */

export const TIMING = {
  /** กล้องเลื่อนไปมุมของขั้น */
  cam: 1.4,
  /** ชิ้นใหม่ลอยจากกองวัสดุเข้าที่ */
  fly: 1.6,
  /** เว้นระยะระหว่างชิ้นที่ลอยตามกัน */
  flyStagger: 0.45,
  /** ชิ้นที่อยู่ในป้ายเดียวกันหลายชิ้น (หมุด หลุม เชือก) ทยอยปรากฏภายในเวลานี้ */
  groupSpread: 1.8,
  /** กล้องซูมเข้าน็อต */
  zoom: 1.1,
  /** ใส่น็อต 1 ตัว (เสียบ → แหวน → ขันตัวเมีย) */
  bolt: 1.8,
  /** เว้นระยะระหว่างน็อตแต่ละตัวในจุดซูมเดียวกัน */
  boltStagger: 0.35,
  /** น็อตที่ไม่ได้ซูม ใส่พร้อมกันเร็ว ๆ */
  boltQuick: 0.8,
  /** โครงเปลี่ยนท่า (ยกตั้งจากลาน) */
  pose: 2.6,
  poseStagger: 0.9,
  /** ข้อความเตือน/ป้ายชี้จุดแสดงค้างไว้ */
  callout: 2.2,
  /** ค้างภาพท้ายขั้นให้อ่านข้อความ */
  hold: 2.2,
  /** เว้นก่อนเล่นขั้นถัดไปอัตโนมัติ */
  gap: 0.6,
};

/** ระยะกล้องตอนซูมน็อต (มม.) */
export const ZOOM_DISTANCE = 480;
/** น็อตที่ห่างกันไม่เกินนี้ (มม.) ซูมรวมในภาพเดียว */
export const ZOOM_CLUSTER = 450;

/**
 * วิธีที่ชิ้นส่วนปรากฏ
 * - fly: ลอยจากกองวัสดุเข้าที่ (ค่าเริ่มต้นของชิ้นเหล็ก)
 * - drop: หล่นลงจากด้านบน (หมุด หลักไม้ ของวางบนพื้น)
 * - grow: โตจากผิวดินลงไป/ขึ้นมา (หลุม ฐานปูน)
 * - pour: เทปูนครึ่งหลุม หยุดกระทุ้ง แล้วเทจนเต็ม
 * - unroll: คลี่แผ่นออกจากขอบหนึ่ง (พลาสติก มุ้ง สแลน ผ้าคลุม)
 * - draw: ลากเส้นจากต้นไปปลาย (เชือก เทปวัด)
 * - pop: ค่อย ๆ ขยายขึ้นจากจุดเดียว (เครื่องหมาย)
 * - none: ปรากฏทันที
 */
export type EnterMode = 'fly' | 'drop' | 'grow' | 'pour' | 'draw' | 'pop' | 'unroll' | 'none';

const EXACT: Record<string, EnterMode> = {
  ground: 'none',
  'grass-tall': 'none',
  'grass-cut': 'none',
  pile: 'drop',
  'pile-trial': 'drop',
  'pits-main': 'grow',
  'gable-pits': 'grow',
  'pads-main': 'grow',
  'concrete-main': 'pour',
  'gable-concrete': 'pour',
  'pit-depth': 'draw',
  'pit-covers': 'drop',
  slab: 'drop',
  supports: 'drop',
  'level-marks': 'pop',
  'side-stakes': 'drop',
  'ref-stakes': 'drop',
  'pins-posts': 'drop',
  'pins-gable': 'drop',
  'rope-layout': 'draw',
  'guide-rope': 'draw',
  'tape-345': 'draw',
  'tape-diag': 'draw',
  'roof-ropes': 'draw',
  'row-marks': 'pop',
  'weed-cover': 'unroll',
  tape: 'pop',
  'mesh-side': 'unroll',
  'mesh-gable': 'unroll',
  'roof-plastic': 'unroll',
  curtains: 'unroll',
  saran: 'unroll',
  stacks: 'drop',
  'foam-boxes': 'drop',
};

export function enterMode(tag: string): EnterMode {
  if (tag in EXACT) return EXACT[tag];
  if (tag.startsWith('pin-')) return 'drop';
  if (tag.endsWith(':marks')) return 'pop';
  if (tag.startsWith('bricks-')) return 'drop';
  return 'fly';
}

/** ความสูงที่ของ "หล่น" ลงมา (มม.) */
export const DROP_HEIGHT = 1800;
/** ความสูงโค้งตอนลอยจากกองวัสดุ (มม.) */
export const FLY_ARC = 2200;

/** ของที่หายไปในขั้น: เริ่มหลังกล้องเริ่มเลื่อน ใช้เวลาเท่านี้ */
export const LEAVE = { start: 0.5, duration: 1.1 };

/**
 * เลื่อนโครงจากตำแหน่งจริงชั่วคราว (มม. ในพิกัดโลก) เพื่อเล่าเรื่องให้เห็นภาพ
 * - hold: ค้างไว้ทั้งขั้น
 * - settle: เริ่มที่ค่าที่กำหนด แล้วเลื่อนกลับตำแหน่งจริงหลังชิ้นใหม่เข้าที่
 * ค่าเลื่อนเป็นภาพประกอบเท่านั้น ไม่ใช่ตัวเลขจากสเปก
 */
/** ก้นเสาวางบนคอนกรีตรองก้นหลุมก่อนสอดอิฐ: ต่ำกว่าตำแหน่งจริงเท่าความสูงอิฐ */
const brick = D.postBottom - (-SPEC.footing.depthBase + SPEC.footing.pad);
/** ระยะโครงคลาดเล็กน้อยก่อนใส่ท่อสัน (ภาพประกอบ) */
const loose: Record<number, [number, number, number]> = { 2: [40, 0, 0], 3: [-30, 0, 0], 4: [35, 0, 0], 5: [-45, 0, 0] };
export const NUDGE: Record<string, { mode: 'hold' | 'settle'; frames: Record<number, [number, number, number]> }> = {
  'step-4-2': { mode: 'hold', frames: { 1: [0, -brick, 0] } },
  'step-4-3': { mode: 'settle', frames: { 1: [0, -brick, 0] } },
  'step-4-5': { mode: 'hold', frames: loose },
  'step-4-6': { mode: 'settle', frames: loose },
};
export const NUDGE_DURATION = 1.6;

/**
 * ชิ้นในป้ายเดียวกันที่ลอยเข้าพร้อมกันเป็นชุด (เช่น ท่อแนวยาวกับฉาก L ที่ยึดไว้ที่ปลาย)
 * ป้ายที่มีหลายชุด ชุดจะทยอยลอยเข้าทีละชุด
 */
export function memberGroup(id: string): string {
  // ฉาก L.{ชนิด}.{ฝั่ง}.{ช่อง}.{ปลาย} ไปกับ long.{ชนิด}.{ฝั่ง}.{ช่อง}
  const L = /^L\.(\w+)\.(\w+)\.(\d+)\./.exec(id);
  if (L) return `long.${L[1]}.${L[2]}.${L[3]}`;
  // ฉาก L บานประตูไปกับบาน
  if (id.startsWith('door')) return 'door';
  return id;
}
/** ป้ายที่ลอยเข้าทั้งก้อน ไม่แยกชุด */
export const FLY_AS_ONE = (tag: string) => /^f\d:/.test(tag) || tag === 'door';
