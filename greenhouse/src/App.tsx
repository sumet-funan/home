/**
 * ขั้นที่ 3 (เช็กหน้าตา): ฉากโรงเรือนนิ่ง ๆ ไม่มีแอนิเมชัน
 * เลือกดูสถานะหลังแต่ละขั้นได้ สวิตช์พลาสติก-มุ้ง/ป้ายชื่อ/X-ray และคลิกชิ้นส่วนเพื่อดูการ์ด
 */
import { useMemo, useState } from 'react';
import { Scene } from './scene/Scene';
import { STEPS, PHASES, finalState, stateAt, type CameraName } from './data/steps';
import { PARTS, type PartId } from './data/parts';
import { MEMBER_BY_ID } from './data/geometry';

const FINAL = STEPS.length;

export default function App() {
  const [idx, setIdx] = useState(FINAL);
  const [skins, setSkins] = useState(true);
  const [labels, setLabels] = useState(true);
  const [xray, setXray] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const state = useMemo(() => (idx >= FINAL ? finalState() : stateAt(idx)), [idx]);
  const step = idx < FINAL ? STEPS[idx] : null;
  const highlight = useMemo(() => new Set(step?.add ?? []), [step]);
  const camera: CameraName = step?.camera ?? 'overview';

  const partId: PartId | null = selected
    ? selected.startsWith('sheet:')
      ? (selected.slice(6) as PartId)
      : (MEMBER_BY_ID.get(selected)?.part ?? [...MEMBER_BY_ID.values()].find((m) => m.piece === selected)?.part ?? null)
    : null;
  const part = partId ? PARTS[partId] : null;
  const memberLabel = selected && !selected.startsWith('sheet:') ? [...MEMBER_BY_ID.values()].find((m) => m.piece === selected)?.label : null;

  return (
    <div className="relative h-full w-full">
      <Scene

        visible={state.visible}
        poses={state.poses}
        highlight={highlight}
        selected={selected}
        showSkins={skins}
        showLabels={labels}
        xray={xray}
        camera={camera}
        onSelect={setSelected}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-2 p-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="pointer-events-auto rounded-xl bg-slate-900/85 px-3 py-2 shadow-lg ring-1 ring-white/10">
          <h1 className="text-base font-semibold text-white sm:text-lg">โรงเรือนผักสลัด 3×6 ม.</h1>
          <p className="text-xs text-slate-300">ขั้นที่ 3: ตรวจหน้าตาฉาก (ยังไม่มีแอนิเมชัน)</p>
        </div>
        <div className="pointer-events-auto flex flex-col gap-2 rounded-xl bg-slate-900/85 p-3 text-sm shadow-lg ring-1 ring-white/10 sm:w-80">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-300">ดูสภาพหลังขั้น</span>
            <select className="rounded-md bg-slate-800 px-2 py-1.5 text-slate-100" value={idx} onChange={(e) => setIdx(Number(e.target.value))}>
              {PHASES.map((ph) => (
                <optgroup key={ph.n} label={`ระยะ ${ph.n} · ${ph.title}`}>
                  {STEPS.map((s, i) =>
                    s.phase === ph.n ? (
                      <option key={s.id} value={i}>
                        {s.phase}-{s.n} {s.title}
                      </option>
                    ) : null,
                  )}
                </optgroup>
              ))}
              <option value={FINAL}>เสร็จสมบูรณ์ (+ กล่องโฟม)</option>
            </select>
          </label>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Toggle on={skins} set={setSkins} text="พลาสติก-มุ้ง" />
            <Toggle on={labels} set={setLabels} text="ป้ายชื่อ" />
            <Toggle on={xray} set={setXray} text="X-ray" />
          </div>
          {step && (
            <p className="text-xs leading-relaxed text-slate-200">
              <b>
                {step.phase}-{step.n} {step.title}
              </b>{' '}
              {step.text}
            </p>
          )}
        </div>
      </div>

      {part && (
        <div className="absolute inset-x-3 bottom-3 max-h-[45%] overflow-auto rounded-xl bg-white/95 p-3 text-sm text-slate-800 shadow-xl sm:left-auto sm:w-96">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">{part.name}</h2>
              {memberLabel && <p className="text-xs text-slate-500">{memberLabel}</p>}
            </div>
            <button className="rounded px-2 text-lg leading-none text-slate-500 hover:bg-slate-200" onClick={() => setSelected(null)} aria-label="ปิด">
              ×
            </button>
          </div>
          <dl className="mt-2 grid grid-cols-[auto,1fr] gap-x-3 gap-y-1">
            {part.section && <Row k="หน้าตัด" v={part.section} />}
            {part.size && <Row k="ขนาด" v={part.size} />}
            {part.holes && <Row k="รู" v={part.holes} />}
            <Row k="จำนวน" v={part.qty} />
            {part.ends && <Row k="ปลาย" v={part.ends} />}
            {part.note && <Row k="หมายเหตุ" v={part.note} />}
          </dl>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-slate-500">{k}</dt>
      <dd>{v}</dd>
    </>
  );
}

function Toggle({ on, set, text }: { on: boolean; set: (v: boolean) => void; text: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 text-slate-100">
      <input type="checkbox" className="accent-orange-500" checked={on} onChange={(e) => set(e.target.checked)} />
      {text}
    </label>
  );
}
