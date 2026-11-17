/* เครื่องไล่นกพิราบ – คู่มือประกอบ (vanilla JS, no build step) */
(() => {
  'use strict';

  const FIRMWARE_PATH = 'firmware/bird_scarer_solar.ino';
  const KEY_BOM = 'birdScarer.bom.v1';
  const KEY_STEPS = 'birdScarer.steps.v1';
  const TOOLS_CATEGORY = 'เครื่องมือ';

  /* ---------- helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch { /* storage unavailable */ }
    }
  };

  const baht = (n) => `${Number(n).toLocaleString('th-TH')} บาท`;

  const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /* tiny inline markup: `code` and **bold** (input is escaped first) */
  const inline = (s) => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  async function fetchText(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res.text();
  }
  const fetchJson = async (url) => JSON.parse(await fetchText(url));

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
      return ok;
    }
  }

  function flash(btn, text, ms = 1500) {
    const original = btn.dataset.label || btn.textContent;
    btn.dataset.label = original;
    btn.textContent = text;
    btn.classList.add('copied');
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, ms);
  }

  function loadError(container, what) {
    const isFile = location.protocol === 'file:';
    container.innerHTML = `<p class="callout callout-warn">โหลด${esc(what)}ไม่ได้${isFile
      ? ' — เปิดไฟล์ index.html ตรงๆ ไม่ได้ ต้องเปิดผ่านเว็บเซิร์ฟเวอร์ เช่น <code>npx serve</code> หรือ <code>python -m http.server</code> (ดู README)'
      : ' — ลองรีเฟรชหน้าอีกครั้ง'}</p>`;
  }

  /* ---------- inline SVG ---------- */
  async function inlineSvgs() {
    const nodes = $$('[data-svg]');
    await Promise.all(nodes.map(async (el) => {
      try {
        el.innerHTML = await fetchText(el.dataset.svg);
      } catch {
        el.innerHTML = `<img src="${esc(el.dataset.svg)}" alt="แผนภาพ">`;
      }
    }));
  }

  /* ---------- BOM ---------- */
  const bom = { items: [], bought: {}, filter: 'ทั้งหมด' };

  function itemKey(item) { return item.name; }
  function lineTotal(item) { return item.qty * item.price; }

  function renderBom() {
    const tbody = $('#bomTable tbody');
    tbody.innerHTML = bom.items.map((it, i) => {
      const key = itemKey(it);
      const bought = !!bom.bought[key];
      const kw = it.searchKeyword || '';
      const kwCell = kw
        ? `<div class="kw">
             <span class="kw-text">${esc(kw)}</span>
             <button type="button" class="kw-copy" data-kw="${esc(kw)}" aria-label="คัดลอก คำค้น ${esc(kw)}">คัดลอก</button>
             <a href="https://shopee.co.th/search?keyword=${encodeURIComponent(kw)}" target="_blank" rel="noopener">Shopee</a>
             <a href="https://www.lazada.co.th/catalog/?q=${encodeURIComponent(kw)}" target="_blank" rel="noopener">Lazada</a>
           </div>`
        : '<span class="item-note">หาซื้อร้านฮาร์ดแวร์ใกล้บ้าน</span>';
      return `<tr data-i="${i}" data-cat="${esc(it.category)}" class="${bought ? 'is-bought' : ''}">
        <td class="c-check"><label class="check"><input type="checkbox" ${bought ? 'checked' : ''} aria-label="ซื้อแล้ว: ${esc(it.name)}"></label></td>
        <td class="c-name"><span class="item-name">${esc(it.name)}</span>${it.note ? `<span class="item-note">${esc(it.note)}</span>` : ''}<span class="cat-tag">${esc(it.category)}</span></td>
        <td class="c-num" data-label="จำนวน">${it.qty}</td>
        <td class="c-num" data-label="ราคา/ชิ้น">${baht(it.price)}</td>
        <td class="c-num c-total" data-label="รวม">${baht(lineTotal(it))}</td>
        <td class="c-kw">${kwCell}</td>
      </tr>`;
    }).join('');
    applyBomFilter();
    updateBomTotals();
  }

  function renderBomFilters() {
    const cats = ['ทั้งหมด', ...new Set(bom.items.map((it) => it.category))];
    $('#bomFilters').innerHTML = cats.map((c) =>
      `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${c === bom.filter}">${esc(c)}</button>`
    ).join('');
  }

  function applyBomFilter() {
    $$('#bomTable tbody tr').forEach((tr) => {
      tr.hidden = bom.filter !== 'ทั้งหมด' && tr.dataset.cat !== bom.filter;
    });
    $$('#bomFilters .chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === bom.filter)));
    const sum = $('#bomFilterSum');
    if (bom.filter === 'ทั้งหมด') {
      sum.textContent = `${bom.items.length} รายการ`;
    } else {
      const list = bom.items.filter((it) => it.category === bom.filter);
      const total = list.reduce((s, it) => s + lineTotal(it), 0);
      sum.textContent = `หมวด${bom.filter}: ${list.length} รายการ รวม ${baht(total)}`;
    }
  }

  function updateBomTotals() {
    let all = 0, noTools = 0, bought = 0;
    for (const it of bom.items) {
      const t = lineTotal(it);
      all += t;
      if (it.category !== TOOLS_CATEGORY) noTools += t;
      if (bom.bought[itemKey(it)]) bought += t;
    }
    $('#totAll').textContent = baht(all);
    $('#totNoTools').textContent = baht(noTools);
    $('#totBought').textContent = baht(bought);
    $('#totLeft').textContent = baht(all - bought);
  }

  function bomCsv() {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['หมวด', 'รายการ', 'จำนวน', 'ราคา/ชิ้น (บาท)', 'รวม (บาท)', 'คำค้น', 'หมายเหตุ', 'ซื้อแล้ว'];
    const rows = bom.items.map((it) => [
      it.category, it.name, it.qty, it.price, lineTotal(it), it.searchKeyword, it.note,
      bom.bought[itemKey(it)] ? 'ใช่' : ''
    ]);
    const total = bom.items.reduce((s, it) => s + lineTotal(it), 0);
    rows.push(['', 'รวมทั้งหมด', '', '', total, '', '', '']);
    const csv = [head, ...rows].map((r) => r.map(q).join(',')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bird-scarer-bom.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function initBom() {
    try {
      bom.items = await fetchJson('data/bom.json');
    } catch {
      loadError($('#bomTable').parentElement, 'รายการอุปกรณ์');
      return;
    }
    bom.bought = store.get(KEY_BOM, {});
    renderBomFilters();
    renderBom();

    $('#bomTable').addEventListener('change', (e) => {
      if (!e.target.matches('input[type="checkbox"]')) return;
      const tr = e.target.closest('tr');
      const it = bom.items[Number(tr.dataset.i)];
      if (e.target.checked) bom.bought[itemKey(it)] = true;
      else delete bom.bought[itemKey(it)];
      tr.classList.toggle('is-bought', e.target.checked);
      store.set(KEY_BOM, bom.bought);
      updateBomTotals();
    });
    $('#bomTable').addEventListener('click', async (e) => {
      const btn = e.target.closest('.kw-copy');
      if (!btn) return;
      const ok = await copyText(btn.dataset.kw);
      flash(btn, ok ? 'คัดลอกแล้ว ✓' : 'คัดลอกไม่ได้');
    });
    $('#bomFilters').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      bom.filter = chip.dataset.cat;
      applyBomFilter();
    });
    $('#bomCsv').addEventListener('click', bomCsv);
    $('#bomReset').addEventListener('click', () => {
      if (!confirm('ล้างเครื่องหมาย "ซื้อแล้ว" ทั้งหมด?')) return;
      bom.bought = {};
      store.remove(KEY_BOM);
      renderBom();
    });
  }

  /* ---------- Steps ---------- */
  const steps = { list: [], done: {} };

  function renderSteps() {
    const ol = $('#stepsList');
    const tpl = $('#stepTpl');
    ol.innerHTML = '';
    steps.list.forEach((s, i) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      const n = i + 1;
      node.id = `step-${s.id}`;
      node.dataset.id = s.id;
      $('.step-no', node).textContent = n;
      $('.step-title', node).textContent = s.title;
      $('.step-time', node).textContent = s.time ? `⏱ ${s.time}` : '';
      $('.step-summary', node).innerHTML = inline(s.summary || '');
      const needs = $('.step-needs', node);
      if (s.needs && s.needs.length) needs.innerHTML = `<strong>ต้องใช้:</strong> ${s.needs.map(esc).join(' · ')}`;
      else needs.remove();
      $('.step-items', node).innerHTML = (s.items || []).map((t) => `<li>${inline(t)}</li>`).join('');
      const boxes = [];
      if (s.warnings && s.warnings.length) {
        boxes.push(`<div class="sbox sbox-warn"><p class="sbox-title">⚠️ คำเตือน</p>${listOrPara(s.warnings)}</div>`);
      }
      if (s.tips && s.tips.length) {
        boxes.push(`<div class="sbox sbox-tip"><p class="sbox-title">💡 ทิป</p>${listOrPara(s.tips)}</div>`);
      }
      $('.step-boxes', node).innerHTML = boxes.join('');
      const cb = $('input', node);
      cb.checked = !!steps.done[s.id];
      cb.setAttribute('aria-label', `ขั้นที่ ${n} ${s.title} เสร็จแล้ว`);
      node.classList.toggle('is-done', cb.checked);
      ol.appendChild(node);
    });
    updateStepsProgress();
  }

  function listOrPara(arr) {
    return arr.length === 1 ? `<p>${inline(arr[0])}</p>` : `<ul>${arr.map((t) => `<li>${inline(t)}</li>`).join('')}</ul>`;
  }

  function updateStepsProgress() {
    const total = steps.list.length;
    const done = steps.list.filter((s) => steps.done[s.id]).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    $('#stepsCount').textContent = `ทำแล้ว ${done} / ${total} ขั้น (${pct}%)`;
    const bar = $('#stepsBar');
    bar.setAttribute('aria-valuenow', String(pct));
    bar.firstElementChild.style.width = `${pct}%`;
    $('#navProgress').style.width = `${pct}%`;
  }

  async function initSteps() {
    try {
      steps.list = await fetchJson('data/steps.json');
    } catch {
      loadError($('#stepsList'), 'ขั้นตอน');
      return;
    }
    steps.done = store.get(KEY_STEPS, {});
    renderSteps();

    $('#stepsList').addEventListener('change', (e) => {
      if (!e.target.matches('input[type="checkbox"]')) return;
      const li = e.target.closest('.step');
      if (e.target.checked) steps.done[li.dataset.id] = true;
      else delete steps.done[li.dataset.id];
      li.classList.toggle('is-done', e.target.checked);
      store.set(KEY_STEPS, steps.done);
      updateStepsProgress();
    });
    $('#stepsReset').addEventListener('click', () => {
      if (!confirm('ล้างความคืบหน้าทุกขั้นตอน?')) return;
      steps.done = {};
      store.remove(KEY_STEPS);
      renderSteps();
    });
  }

  /* ---------- Wiring zoom / pan ---------- */
  function initZoom() {
    const wrap = $('#wiringZoom');
    const stage = $('.zoom-stage', wrap);
    const svg = $('svg', stage);
    if (!svg) return;

    const base = svg.viewBox.baseVal;
    const home = { x: base.x, y: base.y, w: base.width, h: base.height };
    const vb = { ...home };
    const minW = home.w / 6;
    const maxW = home.w * 1.25;

    const apply = () => svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    const toSvg = (cx, cy) => {
      const pt = svg.createSVGPoint();
      pt.x = cx; pt.y = cy;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    };
    const zoomAt = (cx, cy, factor) => {
      const nw = Math.min(maxW, Math.max(minW, vb.w * factor));
      const f = nw / vb.w;
      if (f === 1) return;
      const p = toSvg(cx, cy);
      vb.x = p.x - (p.x - vb.x) * f;
      vb.y = p.y - (p.y - vb.y) * f;
      vb.w *= f;
      vb.h *= f;
      apply();
    };
    const zoomCenter = (factor) => {
      const r = stage.getBoundingClientRect();
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, factor);
    };
    const reset = () => { Object.assign(vb, home); apply(); };

    // On a portrait screen the whole diagram would be tiny: start with the
    // left part filling the height, so labels are readable and the rest is a drag away.
    const r0 = stage.getBoundingClientRect();
    const stageAspect = r0.width / r0.height;
    if (stageAspect < home.w / home.h * 0.75) {
      vb.h = home.h;
      vb.w = home.h * stageAspect;
      apply();
    }

    const pointers = new Map();
    let last = null; // {x, y, dist}

    const snapshot = () => {
      const pts = [...pointers.values()];
      if (pts.length === 1) return { x: pts[0].x, y: pts[0].y, dist: 0 };
      const [a, b] = pts;
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, dist: Math.hypot(a.x - b.x, a.y - b.y) };
    };

    stage.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button > 0) return;
      stage.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      last = snapshot();
      stage.classList.add('dragging');
    });
    stage.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const now = snapshot();
      if (last) {
        if (pointers.size >= 2 && last.dist && now.dist) zoomAt(now.x, now.y, last.dist / now.dist);
        const p0 = toSvg(last.x, last.y);
        const p1 = toSvg(now.x, now.y);
        vb.x += p0.x - p1.x;
        vb.y += p0.y - p1.y;
        apply();
      }
      last = now;
    });
    const end = (e) => {
      pointers.delete(e.pointerId);
      last = pointers.size ? snapshot() : null;
      if (!pointers.size) stage.classList.remove('dragging');
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('wheel', (e) => {
      if (!e.ctrlKey && !e.metaKey) return; // plain wheel keeps scrolling the page
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, Math.exp(e.deltaY * 0.0025));
    }, { passive: false });
    stage.addEventListener('dblclick', (e) => zoomAt(e.clientX, e.clientY, 0.5));

    const fullBtn = $('[data-zoom="full"]', wrap);
    if (!wrap.requestFullscreen) fullBtn.hidden = true;

    $('.zoom-tools', wrap).addEventListener('click', (e) => {
      const btn = e.target.closest('[data-zoom]');
      if (!btn) return;
      const action = btn.dataset.zoom;
      if (action === 'in') zoomCenter(0.7);
      else if (action === 'out') zoomCenter(1 / 0.7);
      else if (action === 'reset') reset();
      else if (action === 'full') {
        if (document.fullscreenElement) document.exitFullscreen();
        else wrap.requestFullscreen().catch(() => {});
      }
    });
    document.addEventListener('fullscreenchange', () => {
      fullBtn.textContent = document.fullscreenElement ? 'ออกเต็มจอ' : 'เต็มจอ';
      reset();
    });
    window.addEventListener('beforeprint', reset);
  }

  /* ---------- Firmware ---------- */
  const KNOWN_SETTINGS = {
    WIFI_SSID: 'ชื่อ WiFi สำหรับซิงก์เวลา (ใช้กับช่วงเวลาทำงาน) เว้นว่าง = ไม่ใช้ WiFi และเครื่องจะทำงานตลอด 24 ชม. ห้ามใส่ค่าจริงในไฟล์ที่ขึ้นเว็บ',
    WIFI_PASS: 'รหัส WiFi ใส่เฉพาะในไฟล์ที่อัปโหลดลงบอร์ด ห้ามใส่ในไฟล์ที่ขึ้นเว็บหรือ GitHub',
    AMP_ON_LEVEL: 'ระดับลอจิกที่ขา SD ใช้เปิดแอมป์ (HIGH หรือ LOW) ถ้า Serial บอกว่าเล่นอยู่แต่ฮอร์นเงียบ ให้สลับเป็นค่าตรงข้าม',
    NUM_TRACKS: 'จำนวนไฟล์เสียงในการ์ด SD ต้องเท่ากับจำนวนไฟล์จริง (0001.mp3 … ) ถ้าตั้งเกิน บางครั้งจะเงียบ ถ้าตั้งขาด ไฟล์ท้ายๆ จะไม่ถูกเล่น',
    VOL_MIN: 'ระดับเสียงต่ำสุดของ DFPlayer (0–30) ทุกครั้งที่ไล่ โค้ดสุ่มระดับเสียงระหว่าง VOL_MIN ถึง VOL_MAX',
    VOL_MAX: 'ระดับเสียงสูงสุดของ DFPlayer (0–30) ลดลงถ้าดังเกินหรือแบตหมดเร็ว',
    MAX_PLAY_MS: 'ตัดเสียงถ้าเล่นนานเกินนี้ (มิลลิวินาที) ควรยาวกว่าไฟล์เสียงที่ยาวที่สุด',
    COOLDOWN_MIN_MS: 'เวลาพักหลังไล่ขั้นต่ำ (มิลลิวินาที) โค้ดสุ่มเวลาพักระหว่าง MIN ถึง MAX',
    COOLDOWN_MAX_MS: 'เวลาพักหลังไล่สูงสุด (มิลลิวินาที) เพิ่มถ้าดังถี่เกินไป',
    RADAR_CONFIRM_MS: 'เวลาที่เรดาร์ต้องตรวจเจอต่อเนื่องก่อนเล่นเสียง (มิลลิวินาที) เพิ่มเพื่อลดการดังเอง',
    ACTIVE_FROM_HOUR: 'ชั่วโมงที่เริ่มทำงาน (0–23) ใช้ได้เมื่อซิงก์เวลาผ่าน WiFi สำเร็จเท่านั้น',
    ACTIVE_TO_HOUR: 'ชั่วโมงสุดท้ายที่ทำงาน (ทำงานถึงนาทีที่ 59 ของชั่วโมงนี้) ใช้ได้เมื่อซิงก์เวลาผ่าน WiFi สำเร็จเท่านั้น',
    GMT_OFFSET_SEC: 'เขตเวลา (ประเทศไทย = 7 × 3600)',
    RESYNC_MS: 'ซิงก์เวลาใหม่ทุกเท่านี้หลังซิงก์สำเร็จ (ค่าเริ่มต้น 24 ชม.) แก้นาฬิกาในบอร์ดที่เดินคลาดเคลื่อน',
    SYNC_RETRY_MS: 'ถ้าซิงก์เวลาไม่สำเร็จ (เช่น เราเตอร์ยังไม่พร้อมหลังไฟดับ) จะลองใหม่ทุกเท่านี้ (ค่าเริ่มต้น 30 นาที)',
    VBAT_DIVIDER: 'อัตราส่วนตัวแบ่งแรงดัน 100kΩ/22kΩ ไม่ต้องแก้ถ้าใช้ตัวต้านทานตามรายการ',
    VBAT_CAL: 'ตัวคูณคาลิเบรตแรงดันแบต ปรับให้ค่าที่ ESP32 อ่านได้ตรงกับมัลติมิเตอร์ (ดูขั้นตอนที่ 8)',
    VBAT_LOW: 'แรงดันแบต (V) ที่ต่ำกว่านี้จะหยุดไล่เพื่อเก็บไฟ',
    VBAT_RESUME: 'แรงดันแบต (V) ที่ชาร์จถึงแล้วกลับมาทำงาน ต้องสูงกว่า VBAT_LOW'
  };

  function guessMeaning(name) {
    if (/PIN/.test(name)) return 'ขา GPIO ที่ใช้ ต้องตรงกับผังต่อสาย';
    if (/HOUR|START|END/.test(name)) return 'ช่วงเวลาทำงาน';
    if (/VBAT|BATT|LOW_?V|CUTOFF/.test(name)) return 'เกี่ยวกับแรงดันแบต';
    if (/COOLDOWN|INTERVAL|_MS$|_SEC$|DELAY/.test(name)) return 'ระยะเวลา';
    if (/VOL/.test(name)) return 'ระดับเสียง';
    return '';
  }

  function parseSettings(src) {
    const lines = src.split(/\r?\n/);
    const stop = lines.findIndex((l) => /^\s*(void|int|bool|float)\s+\w+\s*\([^)]*\)\s*\{?\s*$/.test(l));
    const head = stop > 0 ? lines.slice(0, stop) : lines;
    const out = [];
    const reDefine = /^\s*#define\s+([A-Z_][A-Z0-9_]*)\s+([^/\n]+?)\s*(?:\/\/\s*(.*))?$/;
    const reConst = /^\s*(?:static\s+)?(?:const|constexpr)\s+(?:[\w:<>]+[\s*&]+)+?([A-Za-z_]\w*)\s*(?:\[\s*\])?\s*=\s*([^;]+);\s*(?:\/\/\s*(.*))?$/;
    for (const line of head) {
      const m = line.match(reDefine) || line.match(reConst);
      if (m) out.push({ name: m[1], value: m[2].trim(), comment: (m[3] || '').trim() });
    }
    return out;
  }

  function renderSettings(rows, found) {
    const tbody = $('#fwSettings tbody');
    if (!found) {
      tbody.innerHTML = Object.entries(KNOWN_SETTINGS).map(([name, desc]) =>
        `<tr><td><code>${esc(name)}</code></td><td class="val">—<span class="badge">รอไฟล์ .ino</span></td><td>${esc(desc)}</td></tr>`
      ).join('');
      return;
    }
    const names = new Set(rows.map((r) => r.name));
    const missing = Object.keys(KNOWN_SETTINGS).filter((n) => !names.has(n));
    tbody.innerHTML = rows.map((r) => {
      const desc = KNOWN_SETTINGS[r.name] || r.comment || guessMeaning(r.name);
      const extra = KNOWN_SETTINGS[r.name] && r.comment ? `<br><span class="note">ในโค้ด: ${esc(r.comment)}</span>` : '';
      return `<tr><td><code>${esc(r.name)}</code></td><td class="val">${esc(r.value)}</td><td>${esc(desc)}${extra}</td></tr>`;
    }).join('') + missing.map((name) =>
      `<tr><td><code>${esc(name)}</code></td><td class="val">—<span class="badge">ไม่พบในโค้ด</span></td><td>${esc(KNOWN_SETTINGS[name])}</td></tr>`
    ).join('');
  }

  const TOKEN_RE = new RegExp([
    String.raw`(\/\/[^\n]*|\/\*[\s\S]*?\*\/)`,                                  // 1 comment
    String.raw`("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')`,                      // 2 string
    String.raw`(^[ \t]*#[ \t]*\w+)`,                                           // 3 preprocessor
    String.raw`\b(0x[0-9a-fA-F]+[uUlL]*|\d+(?:\.\d+)?[fFuUlL]*)\b`,            // 4 number
    String.raw`\b(if|else|for|while|do|return|break|continue|switch|case|default|const|static|constexpr|volatile|struct|class|enum|true|false|nullptr|NULL|HIGH|LOW|INPUT|OUTPUT|INPUT_PULLUP|INPUT_PULLDOWN|sizeof|new|delete|typedef|using|namespace|public|private|inline)\b`, // 5 keyword
    String.raw`\b(void|int|long|short|char|bool|float|double|unsigned|signed|u?int(?:8|16|32|64)_t|size_t|byte|word|String|auto|HardwareSerial|DFRobotDFPlayerMini)\b` // 6 type
  ].join('|'), 'gm');
  const TOKEN_CLASS = [null, 'tk-com', 'tk-str', 'tk-pre', 'tk-num', 'tk-kw', 'tk-type'];

  function highlight(src) {
    let html = '';
    let pos = 0;
    TOKEN_RE.lastIndex = 0;
    let m;
    while ((m = TOKEN_RE.exec(src))) {
      if (m[0] === '') { TOKEN_RE.lastIndex++; continue; }
      html += esc(src.slice(pos, m.index));
      const g = m.findIndex((v, i) => i > 0 && v !== undefined);
      html += `<span class="${TOKEN_CLASS[g]}">${esc(m[0])}</span>`;
      pos = m.index + m[0].length;
    }
    return html + esc(src.slice(pos));
  }

  async function initFirmware() {
    const codeEl = $('#fwCode');
    const status = $('#fwStatus');
    const copyBtn = $('#fwCopy');
    const dl = $('#fwDownload');
    let src;
    try {
      src = await fetchText(FIRMWARE_PATH);
      if (/^\s*<!doctype html/i.test(src)) throw new Error('got html'); // SPA-style 404 fallbacks
    } catch {
      codeEl.textContent = `// ยังไม่พบไฟล์ ${FIRMWARE_PATH}\n// วางไฟล์ bird_scarer_solar.ino ไว้ในโฟลเดอร์ firmware/ แล้วรีเฟรชหน้านี้`;
      status.textContent = 'ยังไม่มีไฟล์เฟิร์มแวร์ในโปรเจกต์';
      dl.setAttribute('aria-disabled', 'true');
      dl.removeAttribute('href');
      renderSettings([], false);
      return;
    }
    codeEl.innerHTML = highlight(src);
    const lines = src.split(/\r?\n/).length;
    status.textContent = `${lines.toLocaleString('th-TH')} บรรทัด`;
    copyBtn.disabled = false;
    copyBtn.addEventListener('click', async () => {
      const ok = await copyText(src);
      flash(copyBtn, ok ? 'คัดลอกแล้ว ✓' : 'คัดลอกไม่ได้');
    });
    renderSettings(parseSettings(src), true);
  }

  /* ---------- nav, back-to-top, print ---------- */
  function initNav() {
    const links = $$('.nav-list a');
    const list = $('.nav-list');
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          links.forEach((a) => a.classList.remove('active'));
          const a = byId.get(en.target.id);
          if (a) {
            a.classList.add('active');
            a.setAttribute('aria-current', 'true');
            list.scrollTo({ left: a.offsetLeft - list.clientWidth / 2 + a.clientWidth / 2, behavior: 'smooth' });
          }
          links.filter((l) => l !== a).forEach((l) => l.removeAttribute('aria-current'));
        }
      }, { rootMargin: '-45% 0px -50% 0px' });
      $$('main section[id]').forEach((s) => io.observe(s));
    }

    const toTop = $('#toTop');
    const onScroll = () => toTop.classList.toggle('show', window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0 });
      $('#top').focus({ preventScroll: true });
    });
    $('#top').setAttribute('tabindex', '-1');

    // print everything: open accordions and the code block
    let reopened = [];
    window.addEventListener('beforeprint', () => {
      reopened = $$('details:not([open])');
      reopened.forEach((d) => { d.open = true; });
    });
    window.addEventListener('afterprint', () => {
      reopened.forEach((d) => { d.open = false; });
      reopened = [];
    });
  }

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initBom();
    initSteps();
    initFirmware();
    inlineSvgs().then(initZoom);
  });
})();
