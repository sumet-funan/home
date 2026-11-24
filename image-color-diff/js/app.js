import { extractPalette, colorSimilarity, paletteSimilarity } from './color.js';
import { buildShareImage } from './share.js';

const STORAGE_KEY = 'image-color-diff:v1';
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;
const ANALYSIS_SIZE = 120; // longest side, in pixels, used for finding colours
const THUMB_SIZE = 360; // longest side of the photo kept for display

const app = document.getElementById('app');
let state = load() || newGame();
let view = 'play';
const busy = new Set(); // "playerId:slot" while a photo is being read

// ---------- state ----------

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function newPlayer() {
  return { id: uid(), name: '', items: [] };
}

function newGame(itemsPerPlayer = 3, threshold = 80) {
  return { itemsPerPlayer, threshold, players: [newPlayer(), newPlayer()] };
}

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (s && Array.isArray(s.players) && s.players.length >= MIN_PLAYERS) return s;
  } catch { /* private mode or broken data: start fresh */ }
  return null;
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    toast('บันทึกเกมในเครื่องไม่ได้ (พื้นที่อาจเต็ม) แต่ยังเล่นต่อได้');
  }
}

const playerName = (p, i) => p.name.trim() || `ผู้เล่น ${i + 1}`;
const itemName = (item, slot) => item.label.trim() || `ชิ้นที่ ${slot + 1}`;

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

// ---------- photos ----------

async function decode(file) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch { /* fall back to <img> below */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function scaled(img, longest) {
  const w0 = img.width || img.naturalWidth, h0 = img.height || img.naturalHeight;
  const k = Math.min(1, longest / Math.max(w0, h0));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w0 * k));
  canvas.height = Math.max(1, Math.round(h0 * k));
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
}

async function readPhoto(file) {
  const img = await decode(file);
  const small = scaled(img, ANALYSIS_SIZE);
  const { data, width, height } = small.ctx.getImageData(0, 0, small.canvas.width, small.canvas.height);
  const palette = extractPalette(data, width, height);
  const thumb = scaled(img, THUMB_SIZE).canvas.toDataURL('image/jpeg', 0.78);
  if (img.close) img.close();
  if (!palette.length) throw new Error('no colours');
  return { thumb, palette };
}

async function onPhoto(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const player = state.players.find((p) => p.id === input.dataset.player);
  const slot = Number(input.dataset.slot);
  if (!player) return;
  const key = `${player.id}:${slot}`;
  busy.add(key);
  render();
  try {
    const { thumb, palette } = await readPhoto(file);
    const old = player.items[slot];
    player.items[slot] = { id: uid(), label: old ? old.label : '', thumb, palette };
    save();
  } catch {
    toast('อ่านรูปนี้ไม่ได้ ลองถ่ายใหม่อีกครั้งนะ');
  } finally {
    busy.delete(key);
    render();
  }
}

// ---------- comparing ----------

function allItems() {
  const out = [];
  state.players.forEach((p, pi) => {
    for (let s = 0; s < state.itemsPerPlayer; s++) {
      const item = p.items[s];
      if (item) out.push({ item, slot: s, player: p, pi });
    }
  });
  return out;
}

function computePairs() {
  const items = allItems();
  const pairs = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      if (a.player === b.player) continue;
      pairs.push({
        a, b,
        main: colorSimilarity(a.item.palette[0].lab, b.item.palette[0].lab),
        set: paletteSimilarity(a.item.palette, b.item.palette),
      });
    }
  }
  return pairs.sort((x, y) => y.main - x.main || y.set - x.set);
}

function playersWithItems() {
  return state.players.filter((p) => p.items.slice(0, state.itemsPerPlayer).some(Boolean)).length;
}

// ---------- rendering: play view ----------

function swatches(palette) {
  return palette
    .map((c, i) => `<span class="chip${i === 0 ? ' main' : ''}"><span class="sw" style="background:${c.hex}"></span>${esc(c.name)}</span>`)
    .join('');
}

function fileInput(p, slot) {
  return `<input type="file" accept="image/*" data-player="${p.id}" data-slot="${slot}" hidden>`;
}

function slotHTML(p, slot) {
  const item = p.items[slot];
  if (busy.has(`${p.id}:${slot}`)) {
    return `<div class="slot busy"><div class="spinner"></div><span>กำลังหาสี…</span></div>`;
  }
  if (!item) {
    return `<label class="slot empty">${fileInput(p, slot)}
      <span class="cam" aria-hidden="true">📷</span>
      <span><b>ชิ้นที่ ${slot + 1}</b><small>ถ่ายรูปหรือเลือกจากคลังรูป</small></span>
    </label>`;
  }
  return `<div class="slot filled">
    <label class="photo" title="ถ่ายใหม่">${fileInput(p, slot)}
      <img src="${item.thumb}" alt="">
      <span class="frame" aria-hidden="true"></span>
    </label>
    <div class="info">
      <input class="label" type="text" maxlength="30" placeholder="ชิ้นที่ ${slot + 1} (ตั้งชื่อได้)"
        value="${esc(item.label)}" data-player="${p.id}" data-slot="${slot}" aria-label="ชื่อของชิ้นที่ ${slot + 1}">
      <div class="chips">${swatches(item.palette)}</div>
      <div class="actions">
        <label class="btn small ghost">${fileInput(p, slot)}ถ่ายใหม่</label>
        <button class="btn small ghost danger" data-action="remove-item" data-player="${p.id}" data-slot="${slot}">ลบ</button>
      </div>
    </div>
  </div>`;
}

function playHTML() {
  const seg = [1, 2, 3, 4, 5]
    .map((n) => `<button class="seg-btn${n === state.itemsPerPlayer ? ' on' : ''}" data-action="items" data-n="${n}" aria-pressed="${n === state.itemsPerPlayer}">${n}</button>`)
    .join('');
  const players = state.players
    .map((p, i) => `<article class="player" style="--accent: var(--p${i % 6})">
      <header>
        <span class="badge">${i + 1}</span>
        <input class="name" type="text" maxlength="20" placeholder="ผู้เล่น ${i + 1}" value="${esc(p.name)}"
          data-player="${p.id}" aria-label="ชื่อผู้เล่น ${i + 1}">
        ${state.players.length > MIN_PLAYERS ? `<button class="icon-btn" data-action="remove-player" data-player="${p.id}" aria-label="ลบผู้เล่น ${i + 1}">✕</button>` : ''}
      </header>
      <div class="slots">${Array.from({ length: state.itemsPerPlayer }, (_, s) => slotHTML(p, s)).join('')}</div>
    </article>`)
    .join('');
  const ready = playersWithItems() >= 2;
  return `
    <section class="card settings">
      <div class="row">
        <span>จำนวนชิ้นต่อคน</span>
        <div class="seg" role="group" aria-label="จำนวนชิ้นต่อคน">${seg}</div>
      </div>
      <p class="tip">💡 ถ่ายทุกชิ้นที่จุดเดียวกัน ใต้แสงเดียวกัน และให้สินค้าอยู่เต็มกรอบกลางจอ
        ถ้าสีที่แอปหาได้ไม่ตรง ให้ถ่ายใหม่</p>
    </section>
    ${players}
    ${state.players.length < MAX_PLAYERS ? `<button class="btn add" data-action="add-player">＋ เพิ่มผู้เล่น</button>` : ''}
    <button class="link-btn" data-action="new-game">เริ่มเกมใหม่</button>
    <div class="dock">
      <button class="btn primary big" data-action="results" ${ready ? '' : 'disabled'}>
        ${ready ? 'ดูผล เทียบสีกัน!' : 'ถ่ายของอย่างน้อย 2 คนก่อนนะ'}
      </button>
    </div>`;
}

// ---------- rendering: result view ----------

let pairsCache = [];

function sideHTML({ item, slot, player, pi }) {
  const c = item.palette[0];
  return `<div class="side">
    <div class="thumb"><img src="${item.thumb}" alt=""><span class="sw" style="background:${c.hex}"></span></div>
    <b style="color: var(--p${pi % 6}-ink)">${esc(playerName(player, pi))}</b>
    <small>${esc(itemName(item, slot))} · ${esc(c.name)}</small>
  </div>`;
}

function pairHTML(pair) {
  const match = pair.main >= state.threshold;
  return `<div class="pair${match ? ' match' : ''}">
    ${sideHTML(pair.a)}
    <div class="score"><b>${pair.main}%</b><small>ชุดสี ${pair.set}%</small>${match ? '<span class="tag">ตรงกัน</span>' : ''}</div>
    ${sideHTML(pair.b)}
  </div>`;
}

function summaryHTML() {
  return state.players
    .map((p, pi) => {
      const mine = p.items.slice(0, state.itemsPerPlayer).filter(Boolean).length;
      if (!mine) return '';
      const matched = new Set();
      const partners = new Set();
      for (const pair of pairsCache) {
        if (pair.main < state.threshold) continue;
        if (pair.a.player === p) { matched.add(pair.a.slot); partners.add(pair.b.pi); }
        if (pair.b.player === p) { matched.add(pair.b.slot); partners.add(pair.a.pi); }
      }
      const who = [...partners].sort().map((i) => esc(playerName(state.players[i], i))).join(', ');
      return `<li style="--accent: var(--p${pi % 6})">
        <span class="badge">${pi + 1}</span>
        <span class="who"><b>${esc(playerName(p, pi))}</b><small>${who ? `ตรงกับ ${who}` : 'ยังไม่ตรงกับใคร'}</small></span>
        <span class="count"><b>${matched.size}</b>/${mine}<small>ชิ้นตรง</small></span>
      </li>`;
    })
    .join('');
}

function resultBodyHTML() {
  const matched = pairsCache.filter((p) => p.main >= state.threshold);
  const rest = pairsCache.filter((p) => p.main < state.threshold);
  return `
    <section class="card">
      <h2>สรุปแต่ละคน</h2>
      <ul class="summary">${summaryHTML()}</ul>
    </section>
    <section>
      <h2 class="section-title">คู่ที่สีตรงกัน <span class="pill">${matched.length}</span></h2>
      ${matched.length ? matched.map(pairHTML).join('') : `<p class="empty-note">ยังไม่มีคู่ไหนถึง ${state.threshold}% ลองลดเกณฑ์ดู หรือดูคู่ที่ใกล้ที่สุดด้านล่าง</p>`}
    </section>
    ${rest.length ? `<details class="rest"${matched.length ? '' : ' open'}>
      <summary>คู่อื่นๆ (${rest.length})</summary>
      ${rest.map(pairHTML).join('')}
    </details>` : ''}`;
}

function resultHTML() {
  return `
    <div class="result-top">
      <button class="btn ghost" data-action="back">← กลับไปแก้</button>
      <button class="btn primary" data-action="share">แชร์ผล</button>
    </div>
    <section class="card threshold">
      <label for="threshold">นับว่า "ตรงกัน" เมื่อเหมือนกันตั้งแต่ <output id="th-out">${state.threshold}%</output></label>
      <input id="threshold" type="range" min="50" max="95" step="1" value="${state.threshold}">
      <div class="scale"><span>50% หลวม</span><span>95% เข้ม</span></div>
    </section>
    <div id="result-body">${resultBodyHTML()}</div>`;
}

function render() {
  app.innerHTML = view === 'play' ? playHTML() : resultHTML();
  app.dataset.view = view;
}

// ---------- events ----------

app.addEventListener('change', (e) => {
  if (e.target.matches('input[type=file]')) onPhoto(e.target);
});

app.addEventListener('input', (e) => {
  const t = e.target;
  if (t.matches('input.name')) {
    const p = state.players.find((x) => x.id === t.dataset.player);
    if (p) { p.name = t.value; save(); }
  } else if (t.matches('input.label')) {
    const p = state.players.find((x) => x.id === t.dataset.player);
    const item = p && p.items[Number(t.dataset.slot)];
    if (item) { item.label = t.value; save(); }
  } else if (t.id === 'threshold') {
    state.threshold = Number(t.value);
    document.getElementById('th-out').textContent = `${state.threshold}%`;
    document.getElementById('result-body').innerHTML = resultBodyHTML();
    save();
  }
});

app.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn || btn.disabled) return;
  const player = state.players.find((p) => p.id === btn.dataset.player);
  switch (btn.dataset.action) {
    case 'items': {
      const n = Number(btn.dataset.n);
      const lost = state.players.reduce((s, p) => s + p.items.slice(n, state.itemsPerPlayer).filter(Boolean).length, 0);
      if (lost && !confirm(`จะลบรูปที่เกิน ${n} ชิ้นออก ${lost} รูป ตกลงไหม?`)) return;
      state.players.forEach((p) => { p.items = p.items.slice(0, n); });
      state.itemsPerPlayer = n;
      break;
    }
    case 'add-player':
      if (state.players.length < MAX_PLAYERS) state.players.push(newPlayer());
      break;
    case 'remove-player': {
      const i = state.players.indexOf(player);
      const has = player.items.some(Boolean);
      if (has && !confirm(`ลบ ${playerName(player, i)} และรูปทั้งหมดของผู้เล่นคนนี้?`)) return;
      state.players.splice(i, 1);
      break;
    }
    case 'remove-item':
      player.items[Number(btn.dataset.slot)] = null;
      break;
    case 'new-game':
      if (!confirm('เริ่มเกมใหม่? รูปและชื่อทั้งหมดจะถูกลบ')) return;
      state = newGame(state.itemsPerPlayer, state.threshold);
      break;
    case 'results':
      pairsCache = computePairs();
      view = 'result';
      render();
      window.scrollTo({ top: 0 });
      return;
    case 'back':
      view = 'play';
      render();
      window.scrollTo({ top: 0 });
      return;
    case 'share':
      await share(btn);
      return;
    default:
      return;
  }
  save();
  render();
});

async function share(btn) {
  btn.disabled = true;
  const label = btn.textContent;
  btn.textContent = 'กำลังทำรูป…';
  try {
    const blob = await buildShareImage({
      pairs: pairsCache,
      threshold: state.threshold,
      players: state.players.map((p, i) => ({ name: playerName(p, i), index: i })),
      itemName,
    });
    const file = new File([blob], 'color-match.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'สีตรงกันไหม?' });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'color-match.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    toast('บันทึกรูปผลแล้ว ส่งต่อในแชตได้เลย');
  } catch {
    toast('ทำรูปสำหรับแชร์ไม่สำเร็จ');
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
}

render();
