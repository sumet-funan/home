/**
 * รายการชิ้นส่วน — ข้อความบนการ์ดชิ้นส่วน
 * ตัวเลขดึงจาก spec.ts ทั้งหมด แก้ตัวเลขที่ spec.ts ไม่ต้องแก้ที่นี่
 * ชื่อชิ้นส่วนใช้ตามหัวข้อ "ชื่อชิ้นส่วนและลำดับโครง" ในสเปก
 */
import { SPEC, DECISIONS } from './spec';

export type PartId =
  | 'post'
  | 'rafter'
  | 'gablePost'
  | 'tieBeam'
  | 'cornerBrace'
  | 'longTube'
  | 'ridgeTube'
  | 'shoulderPlate'
  | 'ridgePlate'
  | 'ridgeBracket'
  | 'wallBrace'
  | 'door'
  | 'lAngle'
  | 'boltM8x50'
  | 'boltM8x50g88'
  | 'boltM8x70'
  | 'boltM8x70g88'
  | 'screw'
  | 'railLock'
  | 'roofPlastic'
  | 'curtain'
  | 'sideMesh'
  | 'gableMesh'
  | 'saran'
  | 'roofRope'
  | 'weedCover'
  | 'block'
  | 'shelfBeam'
  | 'foamBox'
  | 'concrete';

export type PartCategory = 'cut' | 'hardware' | 'cover' | 'floor' | 'site';

export interface PartDef {
  id: PartId;
  name: string;
  category: PartCategory;
  section?: string;
  size?: string;
  holes?: string;
  qty: string;
  ends?: string;
  cutFrom?: string;
  note?: string;
}

const n = (v: number) => v.toLocaleString('en-US');
const list = (o: Record<string, number>) => Object.values(o).map(n).join(', ');

const S = SPEC;
const rect = 'เหล็กกล่อง 1×2" หนา 2.0 มม.';
const sq = 'เหล็กกล่อง 1×1" หนา 1.2 มม.';
const plate = `เหล็กแผ่น ${S.section.plateT} มม.`;

export const PARTS: Record<PartId, PartDef> = {
  post: {
    id: 'post',
    name: 'เสาโครง',
    category: 'cut',
    section: rect,
    size: `ยาว ${n(S.post.length)} มม. (ฝังดิน ${S.post.embedMin / 10} ซม. ที่จุดต่ำสุด)`,
    holes: `${list(S.post.holes)} มม. จากปลายล่าง · รู 558 และ 1,588 เจาะห่างผิวนอก ${S.post.offsetFromOuter} มม.`,
    qty: `${S.post.count} ต้น`,
    ends: 'ตัดตรง',
    cutFrom: 'รวมกับจันทัน 7 เส้น (เส้นละ 3 ชิ้น)',
    note: 'รู 50 น็อตขวางในปูน · 558 ฉากท่อล่าง · 1,300 ค้ำมุมไหล่ · 1,588 ฉากท่อไหล่ · 1,700/1,760 แผ่นประกับมุมไหล่',
  },
  rafter: {
    id: 'rafter',
    name: 'จันทัน',
    category: 'cut',
    section: rect,
    size: `แนวกึ่งกลาง ${n(S.rafter.lengthCenter)} มม. (ขอบบน ${n(S.rafter.lengthTop)} · ขอบล่าง ${n(S.rafter.lengthBottom)})`,
    holes: `${list(S.rafter.holes)} มม. จากปลายซ้าย · รู 1,282 เจาะห่างผิวบน ${S.rafter.offsetFromOuter} มม.`,
    qty: `${S.rafter.count} เส้น`,
    ends: `ซ้ายตรง · ขวาตัดดิ่ง ${S.rafter.plumbCutDeg}°`,
    cutFrom: 'รวมกับเสาด้านบน',
    note: 'รู 40/100 แผ่นประกับมุมไหล่ · 576 ค้ำมุมไหล่ · 876 คานรัด · 1,282 ฉากแป · 1,678/1,738 แผ่นประกับสัน',
  },
  gablePost: {
    id: 'gablePost',
    name: 'เสาหน้าจั่ว',
    category: 'cut',
    section: rect,
    size: `ยาว ${n(DECISIONS.gablePostLength)} มม.`,
    holes: `${S.gablePost.anchorHole} มม. จากปลายล่าง · รูบนเจาะหน้างานทะลุคานรัด`,
    qty: `${S.gablePost.count} ต้น (โครง 1 และ 5 โครงละ 2)`,
    ends: 'ตัดตรง',
    cutFrom: '2 เส้น',
    note: 'คู่ที่โครง 5 เป็นเสาประตู',
  },
  tieBeam: {
    id: 'tieBeam',
    name: 'คานรัด',
    category: 'cut',
    section: sq,
    size: `ยาว ${n(S.tieBeam.length)} มม.`,
    holes: `${S.tieBeam.holeFromEnd} มม. (ปลายที่สองเจาะหน้างาน)`,
    qty: `${S.tieBeam.count} เส้น`,
    ends: 'ตัดตรง ลบมุมบน',
    cutFrom: '2 เส้น (เส้นละ 3 ชิ้น)',
    note: 'อยู่ด้าน "ใน" ของโครงทุกชุด ที่ความสูง 2.0 ม.',
  },
  cornerBrace: {
    id: 'cornerBrace',
    name: 'ค้ำมุมไหล่',
    category: 'cut',
    section: sq,
    size: `ยาว ${n(S.cornerBrace.length)} มม.`,
    holes: `${S.cornerBrace.holeFromEnd} มม. (ปลายที่สองเจาะหน้างาน ห่างรูแรกประมาณ ${S.cornerBrace.check.holeSpacing} มม.)`,
    qty: `${S.cornerBrace.count} ชิ้น`,
    ends: 'ตัดตรง ลบมุมปลาย',
    cutFrom: 'รวมกับค้ำยัน',
    note: 'จากรู 1,300 ของเสา ถึงรู 576 ของจันทัน · อยู่ด้าน "ใน" เดียวกับคานรัด · น็อต M8×70 เกรด 8.8',
  },
  longTube: {
    id: 'longTube',
    name: 'ท่อแนวยาว (ท่อไหล่ ท่อล่าง แป)',
    category: 'cut',
    section: sq,
    size: `ยาว ${n(S.longTube.length)} มม. (สั้นกว่าช่องจริง ${S.longTube.fitClearance} มม.)`,
    holes: 'ไม่ต้องเจาะ (ยึดด้วยสกรู)',
    qty: `${S.longTube.count} ท่อน (ท่อไหล่ ท่อล่าง แป ข้างละ 4)`,
    ends: 'ตัดตรง',
    cutFrom: '6 เส้น (เส้นละ 4 ชิ้น)',
    note: 'ยึดด้วยฉาก L 60×60 ที่ปลายทั้งสองข้าง ผิวนอกเรียบเสมอเสาและจันทัน',
  },
  ridgeTube: {
    id: 'ridgeTube',
    name: 'ท่อสัน',
    category: 'cut',
    section: sq,
    size: `ยาว ${n(S.ridgeTube.length)} มม. (ไม่ตัด)`,
    holes: `${S.ridgeTube.holes.map(n).join(', ')} มม. (เจาะแนวตั้ง)`,
    qty: '1 เส้น',
    ends: '—',
    cutFrom: '1 เส้น',
    note: 'วางบนขานอนฉากสัน ร้อยน็อตจากบนลงล่าง ตั้งระยะโครง 1.50 ม. ให้เอง',
  },
  shoulderPlate: {
    id: 'shoulderPlate',
    name: 'แผ่นประกับมุมไหล่',
    category: 'cut',
    section: plate,
    size: `${S.shoulderPlate.width}×${S.shoulderPlate.height} มม.`,
    holes: '4 รู (ตรงรู 1,700/1,760 ของเสา และ 40/100 ของจันทัน)',
    qty: `${S.shoulderPlate.count} แผ่น`,
    cutFrom: 'แผ่นเหล็ก',
    note: 'ทุกแผ่นตัดเหมือนกัน มุมไหล่ฝั่งขวาใช้แผ่นเดิมพลิกด้าน · ขอบตรงเสมอผิวนอกเสา · น็อตเกรด 8.8',
  },
  ridgePlate: {
    id: 'ridgePlate',
    name: 'แผ่นประกับสัน',
    category: 'cut',
    section: plate,
    size: `${S.ridgePlate.width}×${S.ridgePlate.height} มม.`,
    holes: '4 รู (ตรงรู 1,678/1,738 ของจันทันทั้งสองเส้น)',
    qty: `${S.ridgePlate.count} แผ่น`,
    cutFrom: 'แผ่นเหล็ก',
    note: 'ประกบ 2 ด้าน · น็อตเกรด 8.8',
  },
  ridgeBracket: {
    id: 'ridgeBracket',
    name: 'ฉากสัน',
    category: 'cut',
    section: `${plate} พับ 90°`,
    size: `ขาตั้ง ${S.ridgeBracket.vertical.width}×${S.ridgeBracket.vertical.height} · ขานอน ${S.ridgeBracket.flat.width}×${S.ridgeBracket.flat.depth}`,
    holes: `ขาตั้ง 2 รู ห่างกัน ${S.ridgeBracket.holeSpacing} ต่ำกว่ารอยพับ ${S.ridgeBracket.holeBelowFold} · ขานอน 1 รู ห่างผิวหลังขาตั้ง ${S.ridgeBracket.flatHoleFromBack}`,
    qty: `${S.ridgeBracket.count} ชิ้น`,
    cutFrom: 'แผ่นเหล็ก',
    note: 'อยู่ด้าน "ใน" ของโครง: โครง 1–4 ด้านตะวันตก โครง 5 ด้านตะวันออก · ขอบเฉียงตัดไม่ให้มุมโผล่เหนือหลังคา',
  },
  wallBrace: {
    id: 'wallBrace',
    name: 'ค้ำยัน',
    category: 'cut',
    section: sq,
    size: `ประมาณ ${n(S.wallBrace.stockLength)} มม. (ตัดจริงหน้างาน ให้เกินจุดกึ่งกลางท่อ ${S.wallBrace.overshoot} มม.)`,
    holes: 'ไม่ต้องเจาะ (ยึดด้วยสกรู 10×1-1/4" ปลายละ 2 ตัว)',
    qty: `${S.wallBrace.count} เส้น`,
    ends: 'ตัดตรง',
    cutFrom: 'รวมกับค้ำมุมไหล่ 4 เส้น',
    note: 'ช่องโครง 1–2 และ 4–5 ทั้งสองผนัง บนผิวด้านใน',
  },
  door: {
    id: 'door',
    name: 'บานประตู',
    category: 'cut',
    section: sq,
    size: `ตั้ง ${n(DECISIONS.doorVertical)} ×${S.door.verticals} · นอน ${S.door.horizontal} ×${S.door.horizontals}`,
    holes: 'เจาะหน้างาน',
    qty: `${S.door.verticals + S.door.horizontals} ชิ้น`,
    ends: 'ตัดตรง',
    cutFrom: '2 เส้น',
    note: 'ฉาก L ทุกมุม · บานพับ 2 ตัวที่เสาประตูด้านเหนือ เปิดออกด้านนอก',
  },
  lAngle: {
    id: 'lAngle',
    name: 'ฉาก L',
    category: 'hardware',
    size: `${S.lAngle.leg}×${S.lAngle.leg} มม. หนา ${S.lAngle.t} มม.`,
    qty: `${S.lAngle.bought} ตัว (ท่อแนวยาว 48 · บานประตู 6 · สำรอง 6)`,
    note: 'ขาหนึ่งแนบผิวด้านในของท่อ ยิงสกรู 2 ตัว · อีกขาทาบเสาหรือจันทัน ร้อยน็อต รูห่างรอยพับประมาณ 12.5 มม.',
  },
  boltM8x50: {
    id: 'boltM8x50',
    name: 'น็อต M8×50',
    category: 'hardware',
    size: 'หัวหกเหลี่ยมชุบซิงค์ + หัวน็อตแบบกันคลาย + แหวน 2 ตัว',
    qty: `ซื้อ ${S.bolts.bought.m8x50} ชุด`,
    note: 'น็อตขวางก้นเสา · ฉากท่อแนวยาว · ท่อสัน',
  },
  boltM8x50g88: {
    id: 'boltM8x50g88',
    name: 'น็อต M8×50 เกรด 8.8',
    category: 'hardware',
    size: 'หัวน็อตต้องมีเลข 8.8',
    qty: `ซื้อ ${S.bolts.bought.m8x50_88} ชุด`,
    note: 'แผ่นประกับทุกแผ่น (มุมไหล่และสัน) รวมฉากสัน',
  },
  boltM8x70: {
    id: 'boltM8x70',
    name: 'น็อต M8×70',
    category: 'hardware',
    qty: `ซื้อ ${S.bolts.bought.m8x70} ชุด`,
    note: 'คานรัดและเสาหน้าจั่ว (วางทับกันแล้วเจาะทะลุ)',
  },
  boltM8x70g88: {
    id: 'boltM8x70g88',
    name: 'น็อต M8×70 เกรด 8.8',
    category: 'hardware',
    qty: `ซื้อ ${S.bolts.bought.m8x70_88} ชุด`,
    note: 'ค้ำมุมไหล่',
  },
  screw: {
    id: 'screw',
    name: 'สกรูปลายสว่าน',
    category: 'hardware',
    size: '10×3/4" หัว TF งานเหล็ก · ตัวยาว 10×1-1/4"',
    qty: '1 กล่อง (500 ตัว) + ตัวยาว 20 ตัว',
    note: 'ยิงจากด้านในเสมอ ไม่ให้มีหัวน็อตโผล่ด้านนอกใต้รางล็อก',
  },
  railLock: {
    id: 'railLock',
    name: 'รางล็อก + ลวดสปริง',
    category: 'cover',
    size: 'รางยาว 2 ม.',
    qty: 'ประมาณ 24 ชุด (รวม 45 ม.) + ลวดสปริงเปล่า 11 เส้น',
    note: `ยิงสกรูกลางหน้าเหล็กทุก ${S.cover.railScrewSpacing / 10} ซม.`,
  },
  roofPlastic: {
    id: 'roofPlastic',
    name: 'พลาสติกหลังคา',
    category: 'cover',
    size: 'UV 7% หนา 150 ไมครอน หน้ากว้าง 5–6 ม. ยาว 7.5 ม.',
    qty: '1 ผืน',
    note: 'ด้านที่อ่านตัวหนังสือได้ตรงหันขึ้นฟ้า',
  },
  curtain: {
    id: 'curtain',
    name: 'ม่านม้วน',
    category: 'cover',
    size: `ผืนละ ${S.cover.curtain.length / 1000}×${S.cover.curtain.height / 1000} ม. + ท่อม้วน 1/2" ยาว 6 ม.`,
    qty: '2 ผืน',
  },
  sideMesh: {
    id: 'sideMesh',
    name: 'มุ้งผนังข้าง',
    category: 'cover',
    size: `ข้างละ ${S.cover.sideMesh.length / 1000}×${S.cover.sideMesh.height / 1000} ม. (ไนลอน 32 ตา)`,
    qty: '2 ผืน',
  },
  gableMesh: {
    id: 'gableMesh',
    name: 'มุ้งหน้าจั่ว',
    category: 'cover',
    size: 'แพ็ก 3×5 ม.',
    qty: '2 แพ็ก',
  },
  saran: {
    id: 'saran',
    name: 'สแลน',
    category: 'cover',
    size: `กรองแสง 60% กว้าง ${S.cover.saran.width / 1000} ม. ยาว ${S.cover.saran.length / 1000} ม.`,
    qty: '1 ผืน',
    note: 'พาดบนคานรัด รัดเคเบิลไทร์ทุก 30 ซม.',
  },
  roofRope: {
    id: 'roofRope',
    name: 'เชือกรัดหลังคา',
    category: 'cover',
    size: 'เชือก PP กัน UV 6 มม. + หมุดเหล็กข้ออ้อย 12 มม. ยาว 50 ซม.',
    qty: `${S.cover.roofRope.ropes} เส้น · หมุด ${S.cover.roofRope.hooks} อัน`,
    note: 'กลางช่องทุกช่อง ห่างผนัง 30 ซม.',
  },
  weedCover: {
    id: 'weedCover',
    name: 'พลาสติกคลุมวัชพืช',
    category: 'floor',
    size: 'HDPE สีดำ ผืน 4×5 ม.',
    qty: '2 ผืน',
  },
  block: {
    id: 'block',
    name: 'สตั๊กบล็อก',
    category: 'floor',
    size: 'อิฐบล็อก 19×39 ซม. จุดละ 5 ก้อน',
    qty: '15 จุด',
  },
  shelfBeam: {
    id: 'shelfBeam',
    name: 'คานชั้นวาง',
    category: 'floor',
    size: `เหล็กกล่อง 1×2" ตัดเหลือ ${S.floor.beam.length / 1000} ม.`,
    qty: '6 เส้น',
    note: 'ตั้งด้านกว้าง 2" เป็นแนวตั้ง',
  },
  foamBox: {
    id: 'foamBox',
    name: 'กล่องโฟม',
    category: 'floor',
    size: 'ประมาณ 60×45 ซม.',
    qty: '27 กล่อง (3 แถว × 9)',
  },
  concrete: {
    id: 'concrete',
    name: 'ฐานคอนกรีต',
    category: 'site',
    size: `หลุม 30×30 ซม. ลึก 60 ซม. + ความสูงดิน · รองก้น ${S.footing.pad / 10} ซม.`,
    qty: '14 จุด',
    note: 'ปูน 1 : ทราย 2 : หิน 3',
  },
};
