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
 * - draw: ลากเส้นจากต้นไปปลาย (เชือก เทปวัด)
 * - pop: ค่อย ๆ ขยายขึ้นจากจุดเดียว (เครื่องหมาย)
 * - none: ปรากฏทันที
 */
export type EnterMode = 'fly' | 'drop' | 'grow' | 'draw' | 'pop' | 'none';

const EXACT: Record<string, EnterMode> = {
  ground: 'none',
  'grass-tall': 'none',
  'grass-cut': 'none',
  pile: 'drop',
  'pile-trial': 'drop',
  'pits-main': 'grow',
  'gable-pits': 'grow',
  'pads-main': 'grow',
  'concrete-main': 'grow',
  'gable-concrete': 'grow',
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
  'weed-cover': 'pop',
  'mesh-side': 'drop',
  'mesh-gable': 'drop',
  'roof-plastic': 'drop',
  curtains: 'drop',
  saran: 'drop',
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
