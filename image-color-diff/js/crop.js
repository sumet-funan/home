// Full-screen editor for the product area of one photo.
// Drag the frame to move it, drag a corner to resize, or drag on the photo to draw a new frame.

const MIN = 0.08; // smallest frame side, as a share of the photo

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/**
 * @param {{ src: string, region: {x,y,w,h}, defaultRegion: {x,y,w,h}, preview: (region) => Promise<Array> }} opts
 * @returns {Promise<{x,y,w,h} | null>} the new region, or null when cancelled
 */
export function openCropEditor({ src, region, defaultRegion, preview }) {
  return new Promise((resolve) => {
    let r = { ...region };
    const opener = document.activeElement;

    const modal = document.createElement('div');
    modal.className = 'crop-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'crop-title');
    modal.innerHTML = `
      <div class="crop-sheet">
        <h2 id="crop-title">ปรับกรอบพื้นที่สี</h2>
        <p class="crop-help">ลากกรอบไปวางบนสินค้า ลากมุมเพื่อย่อหรือขยาย หรือลากบนรูปเพื่อวาดกรอบใหม่</p>
        <div class="crop-stage">
          <img src="${src}" alt="รูปสินค้า" draggable="false">
          <div class="crop-box">
            <span class="handle nw" data-h="nw"></span><span class="handle ne" data-h="ne"></span>
            <span class="handle sw" data-h="sw"></span><span class="handle se" data-h="se"></span>
          </div>
        </div>
        <div class="crop-preview" aria-live="polite"><span class="muted">กำลังหาสี…</span></div>
        <div class="crop-actions">
          <button class="btn small ghost" data-crop="reset">กลับค่าเริ่มต้น</button>
          <span class="spacer"></span>
          <button class="btn ghost" data-crop="cancel">ยกเลิก</button>
          <button class="btn primary" data-crop="ok">ใช้กรอบนี้</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');

    const stage = modal.querySelector('.crop-stage');
    const box = modal.querySelector('.crop-box');
    const out = modal.querySelector('.crop-preview');

    function draw() {
      box.style.left = `${r.x * 100}%`;
      box.style.top = `${r.y * 100}%`;
      box.style.width = `${r.w * 100}%`;
      box.style.height = `${r.h * 100}%`;
    }

    let previewRun = 0;
    async function refresh() {
      const run = ++previewRun;
      try {
        const palette = await preview(r);
        if (run !== previewRun) return;
        out.innerHTML = palette
          .map((c, i) => `<span class="chip${i === 0 ? ' main' : ''}"><span class="sw" style="background:${c.hex}"></span>${esc(c.name)}</span>`)
          .join('');
      } catch {
        if (run === previewRun) out.innerHTML = '<span class="muted">หาสีในกรอบนี้ไม่ได้</span>';
      }
    }

    // ---------- dragging ----------
    let drag = null;

    function point(e) {
      const rect = stage.getBoundingClientRect();
      return { x: clamp((e.clientX - rect.left) / rect.width, 0, 1), y: clamp((e.clientY - rect.top) / rect.height, 0, 1) };
    }

    stage.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      const p = point(e);
      const handle = e.target.dataset && e.target.dataset.h;
      if (handle) drag = { mode: handle, start: p, r0: { ...r } };
      else if (e.target === box) drag = { mode: 'move', start: p, r0: { ...r } };
      else drag = { mode: 'new', start: p, r0: { ...r } };
      try { stage.setPointerCapture(e.pointerId); } catch { /* still works without capture */ }
      modal.classList.add('dragging');
    });

    stage.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const p = point(e);
      const { r0, start } = drag;
      if (drag.mode === 'move') {
        r.x = clamp(r0.x + p.x - start.x, 0, 1 - r0.w);
        r.y = clamp(r0.y + p.y - start.y, 0, 1 - r0.h);
      } else if (drag.mode === 'new') {
        const w = Math.abs(p.x - start.x), h = Math.abs(p.y - start.y);
        if (w < 0.02 && h < 0.02) return; // a plain tap keeps the old frame
        r.w = Math.max(MIN, w);
        r.h = Math.max(MIN, h);
        r.x = clamp(Math.min(p.x, start.x), 0, 1 - r.w);
        r.y = clamp(Math.min(p.y, start.y), 0, 1 - r.h);
      } else {
        // corner resize: the opposite corner stays put
        let left = r0.x, top = r0.y, right = r0.x + r0.w, bottom = r0.y + r0.h;
        if (drag.mode.includes('w')) left = clamp(p.x, 0, right - MIN);
        if (drag.mode.includes('e')) right = clamp(p.x, left + MIN, 1);
        if (drag.mode.includes('n')) top = clamp(p.y, 0, bottom - MIN);
        if (drag.mode.includes('s')) bottom = clamp(p.y, top + MIN, 1);
        r = { x: left, y: top, w: right - left, h: bottom - top };
      }
      draw();
    });

    function endDrag() {
      if (!drag) return;
      drag = null;
      modal.classList.remove('dragging');
      refresh();
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    // ---------- closing ----------
    function close(result) {
      document.removeEventListener('keydown', onKey);
      modal.remove();
      document.body.classList.remove('modal-open');
      if (opener && opener.focus) opener.focus();
      resolve(result);
    }

    function onKey(e) {
      if (e.key === 'Escape') close(null);
    }
    document.addEventListener('keydown', onKey);

    modal.addEventListener('click', (e) => {
      const action = e.target.closest('[data-crop]')?.dataset.crop;
      if (action === 'cancel') close(null);
      else if (action === 'ok') {
        const round = (v) => Math.round(v * 1000) / 1000;
        close({ x: round(r.x), y: round(r.y), w: round(r.w), h: round(r.h) });
      } else if (action === 'reset') {
        r = { ...defaultRegion };
        draw();
        refresh();
      } else if (e.target === modal) close(null);
    });

    draw();
    refresh();
    modal.querySelector('[data-crop="ok"]').focus();
  });
}
