import * as THREE from 'three';

/** สีและวัสดุที่ใช้ทั้งฉาก — แก้สีได้ที่นี่ที่เดียว */
export const COLORS = {
  steel: '#b9c1c8', // เหล็กกัลวาไนซ์
  plate: '#56606b', // แผ่นประกับเหล็กดำทาสี
  highlight: '#f97316', // ชิ้นใหม่ (ส้ม)
  selected: '#38bdf8',
  bolt: '#d6d3c4',
  concrete: '#a8a29e',
  soil: '#7c6a4f',
  soilDark: '#6e5a40',
  grass: '#5f8a3f',
  grassTall: '#4b7a2e',
  wood: '#b98a55',
  rail: '#8d979e',
  rope: '#facc15',
  roofRope: '#2563eb',
  tape: '#fde047',
  plastic: '#e0f2fe',
  mesh: '#e5e7eb',
  saran: '#111827',
  weed: '#1f2420',
  block: '#9ca3af',
  foam: '#f8fafc',
  pin: '#ef4444',
};

const std = (color: string, metalness = 0, roughness = 0.85, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra });

export const MAT = {
  steel: std(COLORS.steel, 0.55, 0.38),
  plate: std(COLORS.plate, 0.35, 0.55),
  highlight: std(COLORS.highlight, 0.2, 0.5, { emissive: COLORS.highlight, emissiveIntensity: 0.25 }),
  selected: std(COLORS.selected, 0.2, 0.5, { emissive: COLORS.selected, emissiveIntensity: 0.35 }),
  bolt: std(COLORS.bolt, 0.7, 0.35),
  concrete: std(COLORS.concrete, 0, 0.95),
  soil: std(COLORS.soil, 0, 1),
  pitWall: std(COLORS.soilDark, 0, 1, { side: THREE.BackSide }),
  wood: std(COLORS.wood, 0, 0.9),
  rail: std(COLORS.rail, 0.5, 0.45),
  block: std(COLORS.block, 0, 0.95),
  foam: std(COLORS.foam, 0, 0.9),
  pin: std(COLORS.pin, 0.1, 0.6),
  weed: std(COLORS.weed, 0, 0.95, { side: THREE.DoubleSide }),
  // แอนิเมชัน: เส้นวัด สายยาง น้ำ จุดขีด สว่าน
  dim: new THREE.MeshBasicMaterial({ color: '#e11d48', depthTest: false }),
  hose: new THREE.MeshStandardMaterial({ color: '#bae6fd', transparent: true, opacity: 0.6, roughness: 0.2, depthWrite: false }),
  water: std('#2563eb', 0, 0.2, { emissive: '#1d4ed8', emissiveIntensity: 0.4 }),
  markRed: new THREE.MeshBasicMaterial({ color: '#dc2626' }),
  // น็อตที่กำลังใส่ (เหลือง ให้ต่างจากชิ้นใหม่สีส้ม)
  boltNew: std('#fde047', 0.4, 0.35, { emissive: '#facc15', emissiveIntensity: 0.35 }),
  drill: std('#1e293b', 0.3, 0.5),
  plastic: new THREE.MeshStandardMaterial({
    color: COLORS.plastic,
    transparent: true,
    opacity: 0.28,
    roughness: 0.15,
    metalness: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
  saran: new THREE.MeshStandardMaterial({ color: COLORS.saran, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }),
  mesh: (() => {
    // ตาข่ายมุ้ง: เส้นกริดบาง ๆ ทุก 50 มม. (พิกัด UV เป็น มม.)
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const g = c.getContext('2d')!;
    g.clearRect(0, 0, 32, 32);
    g.fillStyle = 'rgba(229,231,235,0.18)';
    g.fillRect(0, 0, 32, 32);
    g.strokeStyle = 'rgba(241,245,249,0.85)';
    g.lineWidth = 2;
    g.strokeRect(0, 0, 32, 32);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1 / 50, 1 / 50);
    tex.anisotropy = 4;
    return new THREE.MeshStandardMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, roughness: 0.9 });
  })(),
};

export function xray<T extends THREE.Material>(m: T, on: boolean): T {
  if (!on) return m;
  const c = m.clone();
  c.transparent = true;
  c.opacity = Math.min(c.opacity, 0.3);
  c.depthWrite = false;
  return c;
}

/** วัสดุโหมด X-ray (สร้างครั้งเดียว) */
export const MAT_X = {
  steel: xray(MAT.steel, true),
  plate: xray(MAT.plate, true),
  soil: xray(MAT.soil, true),
  concrete: xray(MAT.concrete, true),
};
