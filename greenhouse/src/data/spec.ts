/**
 * ตัวเลขทั้งหมดของโรงเรือน — แหล่งเดียวของตัวเลขในเว็บนี้
 * ------------------------------------------------------------
 * หน่วยเป็นมิลลิเมตร (มม.) ยกเว้นเขียนไว้เป็นอย่างอื่น
 * ทุกค่ามีคอมเมนต์บอกว่ามาจากหัวข้อไหนใน docs/greenhouse-spec.md
 *
 * วิธีแก้: เปลี่ยนเลขในไฟล์นี้ไฟล์เดียว แล้วรัน `npm test`
 * geometry.ts คำนวณพิกัดทุกชิ้นจากไฟล์นี้ ส่วน test จะฟ้องทันทีถ้าตัวเลขขัดกัน
 * (เช่น แก้ความยาวจันทันแล้วรูไม่ตรงคานรัด)
 *
 * ค่าที่ไม่มีในสเปกและต้องสมมติ อยู่ในกลุ่ม ASSUMED ท้ายไฟล์ และอธิบายใน ASSUMPTIONS.md
 * ค่าที่ต้องเลือกเพราะสเปกเขียนไว้ 2 แบบ อยู่ในกลุ่ม DECISIONS
 */

export const SPEC = {
  /** ขนาดและผัง */
  layout: {
    frameCount: 5, // โครงจั่ว 5 ชุด
    bay: 1500, // ตั้งห่างกัน 1.5 ม.
    width: 3000, // กว้าง 3 ม. (กึ่งกลางเสา–กึ่งกลางเสา)
    wallHeight: 1500, // เสาสูง 1.5 ม. = ปลายบนเสาเหนือระดับอ้างอิง
    ridgeHeight: 2500, // ยอดสูง 2.5 ม. (แนวกึ่งกลางจันทัน)
    // ค่าตรวจสอบ (test เทียบกับค่าที่คำนวณได้)
    check: {
      roofPitchDeg: 33.7, // หลังคาชัน 33.7°
      tieHeight: 2000, // คานรัดที่ความสูง 2.0 ม.
      tieLengthNominal: 1500, // คานรัดยาว 1.5 ม.
      rafterNominal: 1800, // จันทันยาวข้างละ 1.8 ม.
      diagonal: 6710, // เส้นทแยง 6.71 ม.
      diagonalTol: 10, // คลาดได้ไม่เกิน 1 ซม.
    },
  },

  /** หน้าตัดเหล็ก (แบบสั่งตัดและเจาะ, รายการวัสดุ) */
  section: {
    rect: { wide: 50, narrow: 25, t: 2.0 }, // 1×2" หนา 2.0 — ด้านกว้างอยู่ในระนาบโครง
    square: { size: 25, t: 1.2 }, // 1×1" หนา 1.2
    plateT: 3, // เหล็กแผ่น 3 มม.
    holeDia: 8.5, // ทุกรู ø 8.5 มม.
  },

  /** เสาโครง (ตารางแบบสั่งตัด แถว "เสาโครง") — รูวัดจากปลายล่าง */
  post: {
    length: 1800,
    count: 10,
    embedMin: 300, // ฝัง 30 ซม. ที่จุดต่ำสุด
    holes: { anchor: 50, lowTube: 558, brace: 1300, shoulderTube: 1588, plateLow: 1700, plateHigh: 1760 },
    // รู 558 และ 1,588 เจาะห่างผิวนอก 37.5 มม. (เยื้องเข้าด้านใน 12.5)
    offsetHoles: ['lowTube', 'shoulderTube'] as const,
    offsetFromOuter: 37.5,
    check: { lowTubeAboveRef: 260, shoulderTubeAboveRef: 1290, roundTol: 5 }, // "26 ซม." "1.29 ม."
  },

  /** จันทัน — รูวัดจากปลายซ้าย (ปลายตัดตรง) */
  rafter: {
    lengthCenter: 1778, // แนวกึ่งกลาง
    lengthTop: 1795, // ขอบบน
    lengthBottom: 1761, // ขอบล่าง
    plumbCutDeg: 56, // ขวาตัดดิ่ง 56°
    count: 10,
    holes: { plateLow: 40, plateHigh: 100, brace: 576, tie: 876, purlin: 1282, ridgeLow: 1678, ridgeHigh: 1738 },
    offsetHoles: ['purlin'] as const,
    offsetFromOuter: 37.5,
    check: { purlinFromShoulder: 1310, roundTol: 5 }, // "1.31 ม. ตามแนวจันทัน"
  },

  /** คานรัด 1×1" */
  tieBeam: { length: 1550, holeFromEnd: 25, count: 5 },

  /** ค้ำมุมไหล่ 1×1" */
  cornerBrace: { length: 1000, holeFromEnd: 15, count: 10, check: { holeSpacing: 971 } },

  /** ท่อแนวยาว (ท่อไหล่ ท่อล่าง แป) */
  longTube: { length: 1470, count: 24, fitClearance: 5 }, // สั้นกว่าช่องจริง 5 มม.

  /** ท่อสัน */
  ridgeTube: { length: 6000, holes: [42, 1542, 3042, 4542, 5958], count: 1 },

  /** แผ่นประกับ */
  shoulderPlate: { width: 175, height: 237, count: 20 }, // 175×237 ขอบตรงเสมอผิวนอกเสา
  ridgePlate: { width: 239, height: 121, count: 10 },

  /** ฉากสัน (เหล็กแผ่น 3 มม. พับ 90°) */
  ridgeBracket: {
    vertical: { width: 90, height: 70 },
    flat: { width: 25, depth: 40 }, // ดู DECISIONS.ridgeBracketFlat
    holeSpacing: 66, // ขาตั้ง 2 รู ห่างกัน 66
    holeBelowFold: 52, // ต่ำกว่ารอยพับ 52
    flatHoleFromBack: 26.5, // ขานอน 1 รู ห่างผิวหลังขาตั้ง 26.5
    count: 5,
  },

  /** ค้ำยันผนัง 1×1" */
  wallBrace: {
    stockLength: 1790, // ประมาณ 1,790 (ตัดจริงหน้างาน)
    overshoot: 25, // ตัดให้เกินจุดกึ่งกลางท่อ 25 มม.
    minFromPost: 100, // ปลายค้ำห่างเสาอย่างน้อย 10 ซม.
    count: 4,
    bays: [
      [1, 2],
      [4, 5],
    ] as const, // ช่องแรกและช่องสุดท้าย — ปลายบนอยู่ใกล้โครงตัวแรกของคู่ (โครงหัวท้าย)
    screwsPerEnd: 2,
  },

  /** เสาหน้าจั่ว */
  gablePost: {
    count: 4,
    frames: [1, 5] as const,
    fromNorth: [1025, 1975], // วัดจากเสามุมด้านเหนือ 1.025 ม. และ 1.975 ม.
    anchorHole: 50,
    aboveTie: 20, // ปลายบนสูงเลยคานรัดประมาณ 2 ซม.
    check: { embedApprox: 300, embedTol: 15 },
  },

  /** บานประตู */
  door: {
    frame: 5, // ประตูอยู่ด้านตะวันตก
    horizontal: 830,
    horizontals: 3, // บน กลาง ล่าง
    verticals: 2,
    gap: 10, // ช่องรอบบาน 10 มม.
    clearWidth: 900, // ประตูกว้าง 0.9 ม.
    shorterThanOpening: 30, // ตัดเหล็กตั้งสั้นกว่าช่องจริง 30 มม.
    hingeSide: 'north' as const,
    hinges: 2,
    meshOverlap: 100, // มุ้งใหญ่กว่าบานด้านละ 10 ซม.
  },

  /** ฉากเหล็ก L */
  lAngle: { leg: 60, t: 2, holeFromFold: 12.5, screwsPerLeg: 2, bought: 60 },

  /** น็อต (จุดต่อแบบยึดน็อต, รายการวัสดุ) */
  bolts: {
    short: 50, // M8×50
    long: 70, // M8×70
    // จำนวนที่ให้ซื้อในรายการวัสดุ (รวมเผื่อแล้ว) — เว็บนับจำนวนที่ใช้จริงจากแบบแยกต่างหาก
    bought: { m8x50: 112, m8x50_88: 66, m8x70: 16, m8x70_88: 22, washers: 400 },
  },

  /** ฐานราก (ระยะ 2 และ 4) */
  footing: {
    size: 300, // หลุม 30×30 ซม.
    depthBase: 600, // ลึก 60 ซม. + ความสูงดิน
    pad: 200, // คอนกรีตรองก้นหลุมหนา 20 ซม.
    moundAboveGround: 50, // ปาดผิวสูงกว่าดินเดิม 5 ซม.
    mix: { cement: 1, sand: 2, stone: 3 },
    cureDays: 3,
    holesPerBag: '2–3',
    maxGroundDiff: 150, // ต่างกันเกิน 15 ซม. ให้ตัดดินก่อน
    topTol: 10, // ปลายบนเสาคลาดได้ไม่เกิน 1 ซม.
  },

  /** ตีผัง (ระยะ 1) และเชือกนำแนว (ระยะ 4) */
  site: {
    clearAround: 1000, // ถางหญ้ากว้างกว่าโรงเรือนด้านละ 1 ม.
    triangle: { a: 3000, b: 4000, c: 5000 }, // 3-4-5
    refStakeBeyond: 1000, // หลักอ้างอิงเลยปลายเชือกปลายละ 1 ม.
    guideRopeOffset: 100, // เยื้องออกนอกโรงเรือน 10 ซม.
    guideRopeHeight: 300, // สูงจากดินราว 30 ซม.
    postFaceToRope: 75, // ผิวนอกเสาห่างเชือก 7.5 ซม.
    levelHoseMarkHeight: 500, // ผิวน้ำสูงจากดิน 50 ซม.
    levelHoseExample: { reading: 420, rise: 80 }, // ได้ 42 ซม. = สูงกว่า 8 ซม.
    assemblyArea: { x: 4000, z: 3500 }, // พื้นเรียบประมาณ 4×3.5 ม.
    supportHeight: [50, 100], // ไม้หนุนสูง 5–10 ซม.
    windFrom: 'ตะวันออกถึงตะวันออกเฉียงเหนือ',
  },

  /** หุ้มโครง (ระยะ 6) */
  cover: {
    railScrewSpacing: 300, // ยิงสกรูรางล็อกทุก 30 ซม.
    sideMesh: { length: 6400, height: 1600, buried: 100 },
    curtain: { length: 6500, height: 1600, wraps: 2, tieSpacing: 500 },
    rollPipeDia: 21.3, // ท่อเหล็กกลม 1/2" (เส้นผ่านศูนย์กลางนอกมาตรฐาน)
    roofOverhangInitial: 300, // ยื่นเลยโครง 1 และ 5 ด้านละ 30 ซม.
    roofEndTrim: 50, // ตัดชายหัวท้ายเหลือ 5 ซม.
    roofEaveTrim: 100, // ตัดเหลือชาย 10 ซม.
    saran: { width: 1500, length: 6000, tieSpacing: 300 },
    roofRope: { hookOut: 300, ropes: 4, hooks: 8 },
  },

  /** พื้นและชั้นวาง (ระยะ 7) */
  floor: {
    weedCover: { width: 3500, length: 6500, overlap: 200 },
    // วัดจากแนวเสาด้านเหนือ
    rows: [
      { kind: 'gap', size: 600 },
      { kind: 'row', size: 450, boxes: 1 },
      { kind: 'walk', size: 600 },
      { kind: 'row', size: 900, boxes: 2 },
      { kind: 'gap', size: 450 },
    ] as const,
    stacks: { perLine: 5, spacing: 1350, firstFromFrame1: 300, blocks: 5, height: 350 },
    block: { length: 390, width: 190 }, // อิฐบล็อก 19×39 ซม.
    beam: { length: 5500, endFromFrame: 250, perRow: 2, spacing: 340 },
    foamBox: { length: 600, width: 450, perRow: 9 }, // ประมาณ 60×45 ซม. แถวละ 9 กล่อง
  },
} as const;

/**
 * ค่าที่ต้องเลือก เพราะสเปกเขียนไว้ไม่ตรงกัน (ผู้ใช้อนุมัติแล้ว 2026-11-24)
 */
export const DECISIONS = {
  /** ระยะ 3: หัวน็อตอยู่ด้านบนตอนประกอบ = ด้าน "ใน" ตัวเมียอยู่ด้านนอก */
  boltHeadSide: 'in' as const,
  /** เสาหน้าจั่ว: ตารางสั่งตัด 2,325 (ตารางวัสดุเขียน 2.285 ม.) */
  gablePostLength: 2325,
  /** เหล็กตั้งบานประตู: ตารางสั่งตัด 1,940 (ข้อ 5-3 เขียน "ประมาณ 1,950") */
  doorVertical: 1940,
  /** ขานอนฉากสัน "25×40" = กว้าง 25 (ขวางโครง เท่าหน้าท่อสัน) × ลึก 40 (ยื่นจากขาตั้งไปตามแนวท่อสัน) */
  ridgeBracketFlat: { width: 25, depth: 40 },
};

/**
 * ค่าที่สเปกไม่ได้ให้ไว้ ต้องสมมติเพื่อวาดรูป 3 มิติ — รายละเอียดใน ASSUMPTIONS.md
 * แก้ค่าเหล่านี้ได้อิสระ ไม่กระทบตัวเลขในสเปก
 */
export const ASSUMED = {
  /** แผ่นประกับ: ขอบบนต่ำกว่าผิวบนจันทันเท่านี้ ไม่ให้โผล่ไปเกี่ยวพลาสติก */
  plateTopInset: 5,
  /** คานรัด: ลบมุมบน */
  tieChamfer: 12,
  /** ค้ำมุมไหล่: ลบมุมปลาย */
  braceChamfer: 8,
  /** ฉาก L: ความกว้างของขา (สเปกให้แค่ 60×60 หนา 2) */
  lAngleWidth: 25,
  /** ค้ำยันผนัง: ระยะจากผิวเสาถึงจุดตัดกึ่งกลางท่อ = 100 (ขั้นต่ำ) + 25 (ส่วนเกิน) */
  wallBraceCrossFromPost: 125,
  /** ประตู: ช่องว่างใต้คานรัดถึงขอบบนบาน */
  doorTopGap: 10,
  /** ความสูงพื้นดินตัวอย่าง: จุด A สูงกว่าจุดต่ำสุด 80 มม. (ตัวอย่าง 8 ซม. ในสเปก) ลาดลงไปทางตะวันตกเฉียงใต้ */
  ground: { riseEast: 50, riseNorth: 30 },
  /** อิฐบล็อก 5 ก้อนสูงประมาณ 35 ซม. → ก้อนละ 70 */
  blockThickness: 70,
  /** กล่องโฟม: ความสูง */
  foamBoxHeight: 300,
  /** น็อต M8 */
  bolt: { shankDia: 8, headAcrossFlats: 13, headHeight: 5.3, nutHeight: 8, washerOD: 16, washerT: 1.6 },
  /** สกรูปลายสว่าน 10×3/4" และ 10×1-1/4" */
  screw: { dia: 4.8, short: 19, long: 32, headDia: 9 },
  /** รางล็อก */
  rail: { width: 30, height: 12 },
  /** ไม้ค้ำชั่วคราว */
  tempBrace: { size: 50, reachOut: 1200, attachHeight: 1200 },
  /** ไม้หนุนตอนประกอบโครงบนพื้น */
  assemblySupport: 75,
};

export type Spec = typeof SPEC;
