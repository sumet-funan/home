/**
 * เก็บว่าติ๊กเช็กข้อไหนไปแล้ว ไว้ในเบราว์เซอร์ (localStorage)
 * ถ้าเบราว์เซอร์ไม่ให้ใช้ (โหมดส่วนตัว ฯลฯ) จะทำงานต่อได้ แค่จำไม่ได้หลังปิดหน้า
 */
const KEY = 'greenhouse.checks.v1';

export type Checks = Record<string, boolean>;

export function loadChecks(): Checks {
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : {};
    return v && typeof v === 'object' ? (v as Checks) : {};
  } catch {
    return {};
  }
}

export function saveChecks(c: Checks) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* จำไม่ได้ก็ไม่เป็นไร */
  }
}

/** คีย์ของข้อเช็ก: ระยะ + ลำดับข้อ (เช่น "p1.0") หรือเช็กลิสต์สุดท้าย ("final.3") */
export const checkKey = (group: string, i: number) => `${group}.${i}`;
