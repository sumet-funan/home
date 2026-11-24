/**
 * แอปหลัก: ตัวเล่นขั้นตอน (ไทม์ไลน์ GSAP ต่อขั้น) + แผงขั้นตอน + การ์ดเช็กก่อนไปต่อ + การ์ดชิ้นส่วน
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Scene } from './scene/Scene';
import { PHASES, STEPS, stepIndexById } from './data/steps';
import { PARTS, type PartId } from './data/parts';
import { MEMBER_BY_ID } from './data/geometry';
import { PART_STEPS } from './data/usage';
import { TIMING } from './anim/config';
import { ANIM } from './anim/state';
import { buildTimeline, stepCamera, viewOf } from './anim/timeline';
import { FINAL, boltsAt, displayAt, enteringAt, tightenAt } from './anim/sceneState';
import { StepPanel } from './ui/StepPanel';
import { CheckCard, phaseCardTitle } from './ui/PhaseCard';
import { loadChecks, saveChecks, type Checks } from './ui/storage';

/** ป้ายชื่อที่แสดงในหน้าสรุป */
const SUMMARY_LABELS = ['roof-plastic', 'curtains', 'door', 'gable-posts', 'shelf-beams', 'foam-boxes'];

const reducedMotion = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** #step-4-3 → index · #summary → หน้าสรุป */
function idxFromHash(): number | null {
  const h = window.location.hash.slice(1);
  if (h === 'summary') return FINAL;
  const i = stepIndexById(h);
  return i >= 0 ? i : null;
}
const hashOf = (idx: number) => (idx >= FINAL ? 'summary' : STEPS[idx].id);
const isPhaseEnd = (idx: number) => idx < FINAL && STEPS[idx + 1]?.phase !== STEPS[idx].phase;

export default function App() {
  const [idx, setIdx] = useState(() => idxFromHash() ?? 0);
  const [paused, setPaused] = useState(reducedMotion);
  const [speed, setSpeed] = useState(1);
  const [replay, setReplay] = useState(0);
  const [card, setCard] = useState<number | null>(null);
  const [freeCam, setFreeCam] = useState(false);
  const [skins, setSkins] = useState(true);
  const [labels, setLabels] = useState(true);
  const [xray, setXray] = useState(false);
  const [dims, setDims] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [checks, setChecks] = useState<Checks>(() => loadChecks());
  const [inset, setInset] = useState({ right: 0, bottom: 0 });
  const tl = useRef<gsap.core.Timeline | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const autoplay = useRef(!reducedMotion);
  const speedRef = useRef(speed);
  const timer = useRef<number>();

  // ฉากระหว่างเล่นขั้น = หลังขั้นนี้ + ของที่กำลังหายไป
  const state = useMemo(() => displayAt(idx), [idx]);
  const step = idx < FINAL ? STEPS[idx] : null;
  const highlight = useMemo(() => new Set(step?.add ?? []), [step]);
  // ป้ายชื่อเฉพาะชิ้นที่ปรากฏใหม่ในขั้นนี้ (หน้าสรุปแสดงเฉพาะป้ายภาพรวม)
  const labelTags = useMemo(() => new Set(idx >= FINAL ? SUMMARY_LABELS : enteringAt(idx)), [idx]);
  const animBolts = useMemo(() => new Set([...boltsAt(idx).map((j) => j.id), ...tightenAt(idx)]), [idx]);

  const go = useCallback((i: number) => {
    window.clearTimeout(timer.current);
    setCard(null);
    setIdx(Math.max(0, Math.min(FINAL, i)));
  }, []);

  // เมื่อเล่นขั้นจบ: จบระยะ → การ์ดเช็ก · ไม่จบ → เล่นขั้นถัดไปเอง (ถ้ากำลังเล่นอัตโนมัติ)
  const onComplete = useRef(() => {});
  onComplete.current = () => {
    if (idx >= FINAL) return;
    if (isPhaseEnd(idx)) setCard(STEPS[idx].phase);
    else if (autoplay.current) timer.current = window.setTimeout(() => go(idx + 1), (TIMING.gap * 1000) / speedRef.current);
  };

  // สร้างไทม์ไลน์ใหม่ทุกครั้งที่เปลี่ยนขั้นหรือกดเล่นซ้ำ (ก่อนวาดเฟรมแรก เพื่อไม่ให้ชิ้นใหม่โผล่ก่อนลอย)
  useLayoutEffect(() => {
    tl.current?.kill();
    setFreeCam(false);
    const t = buildTimeline(idx);
    t.timeScale(speedRef.current);
    t.eventCallback('onComplete', () => onComplete.current());
    tl.current = t;
    if (reducedMotion) t.progress(1); // ลดการเคลื่อนไหว: แสดงภาพนิ่งตอนจบขั้น
    else {
      t.play();
      setPaused(false);
    }
    return () => {
      t.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, replay]);

  // ตัวช่วยตรวจตอนพัฒนา: window.__player.seek(0.5) เลื่อนไทม์ไลน์ไปครึ่งขั้น
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    (window as unknown as { __player: unknown }).__player = {
      go,
      seek: (p: number) => {
        tl.current?.pause();
        tl.current?.progress(p, true);
        setPaused(true);
      },
      finish: () => tl.current?.progress(1),
      duration: () => tl.current?.duration(),
    };
  }, [go]);

  // URL #step-x-y
  useEffect(() => {
    const h = hashOf(idx);
    if (window.location.hash.slice(1) !== h) window.history.replaceState(null, '', `#${h}`);
  }, [idx]);
  useEffect(() => {
    const on = () => {
      const i = idxFromHash();
      if (i !== null) go(i);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, [go]);

  // วัดขนาดแผง เพื่อจัดภาพ 3 มิติให้อยู่กลางส่วนที่ไม่ถูกบัง
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const wide = window.matchMedia('(min-width: 1024px)').matches;
      setInset(wide ? { right: window.innerWidth - r.left, bottom: 0 } : { right: 0, bottom: window.innerHeight - r.top });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const togglePlay = () => {
    const t = tl.current;
    if (!paused) {
      autoplay.current = false;
      window.clearTimeout(timer.current);
      t?.pause();
      setPaused(true);
      return;
    }
    autoplay.current = true;
    setPaused(false);
    if (t && t.progress() < 1) t.play();
    else if (idx < FINAL && !isPhaseEnd(idx)) go(idx + 1);
    else if (idx < FINAL) setCard(STEPS[idx].phase);
  };

  const changeSpeed = (s: number) => {
    speedRef.current = s;
    setSpeed(s);
    tl.current?.timeScale(s);
  };

  const resetCamera = () => {
    ANIM.camDriven = true;
    setFreeCam(false);
    gsap.to(ANIM.cam, { ...viewOf(stepCamera(idx)), duration: reducedMotion ? 0 : 1, ease: 'power2.inOut' });
  };

  const toggleCheck = (key: string, on: boolean) => {
    setChecks((c) => {
      const next = { ...c, [key]: on };
      saveChecks(next);
      return next;
    });
  };

  // การ์ดชิ้นส่วน
  const partId: PartId | null = selected
    ? selected.startsWith('sheet:')
      ? (selected.slice(6) as PartId)
      : (MEMBER_BY_ID.get(selected)?.part ?? [...MEMBER_BY_ID.values()].find((m) => m.piece === selected)?.part ?? null)
    : null;
  const part = partId ? PARTS[partId] : null;
  const memberLabel = selected && !selected.startsWith('sheet:') ? [...MEMBER_BY_ID.values()].find((m) => m.piece === selected)?.label : null;
  const cardPhase = card !== null ? PHASES.find((ph) => ph.n === card)! : null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Scene
        visible={state.visible}
        poses={state.poses}
        highlight={highlight}
        selected={selected}
        showSkins={skins}
        showLabels={labels}
        showDims={dims}
        xray={xray}
        stepIdx={idx}
        animBolts={animBolts}
        labelTags={labelTags}
        inset={inset}
        onSelect={setSelected}
        onUserOrbit={() => setFreeCam(true)}
      />

      {/* หัวเรื่อง + สวิตช์มุมมอง */}
      <div className="pointer-events-none absolute left-0 top-0 z-30 flex w-full flex-wrap items-start gap-2 p-3 lg:w-[calc(100%-420px)]">
        <div className="pointer-events-auto rounded-xl bg-slate-900/85 px-3 py-1.5 shadow-lg ring-1 ring-white/10">
          <h1 className="text-sm font-semibold text-white sm:text-base">โรงเรือนผักสลัด 3×6 ม.</h1>
        </div>
        <div className="pointer-events-auto flex flex-wrap gap-1.5 rounded-xl bg-slate-900/85 px-2 py-1.5 text-xs shadow-lg ring-1 ring-white/10">
          <Toggle on={skins} set={setSkins} text="พลาสติก-มุ้ง" />
          <Toggle on={labels} set={setLabels} text="ป้ายชื่อ" />
          <Toggle on={dims} set={setDims} text="ระยะ" />
          <Toggle on={xray} set={setXray} text="X-ray" />
        </div>
        {freeCam && (
          <button className="pointer-events-auto rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg hover:bg-orange-600" onClick={resetCamera}>
            ⟲ กลับมุมแนะนำ
          </button>
        )}
      </div>

      <StepPanel ref={panel} idx={idx} paused={paused} speed={speed} tl={tl} onGo={go} onTogglePlay={togglePlay} onReplay={() => setReplay((r) => r + 1)} onSpeed={changeSpeed} checks={checks} onCheck={toggleCheck} />

      {cardPhase && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-3 lg:pr-[420px]">
          <CheckCard
            title={phaseCardTitle(cardPhase)}
            subtitle={cardPhase.title}
            group={`p${cardPhase.n}`}
            items={cardPhase.checks}
            checks={checks}
            onToggle={toggleCheck}
            emptyText="สเปกไม่ได้กำหนดรายการเช็กสำหรับระยะนี้ ทบทวนขั้นตอนให้ครบก่อนไปต่อ"
            primary={{
              text: idx + 1 >= FINAL ? 'ดูหน้าสรุป' : `ไปต่อระยะ ${cardPhase.n + 1}`,
              onClick: () => go(idx + 1),
            }}
            secondary={{ text: 'ดูขั้นนี้อีกครั้ง', onClick: () => { setCard(null); setReplay((r) => r + 1); } }}
            onClose={() => setCard(null)}
          />
        </div>
      )}

      {part && (
        <div className="absolute inset-x-3 top-14 z-30 max-h-[40%] overflow-auto rounded-xl bg-white/95 p-3 text-sm text-slate-800 shadow-xl lg:bottom-3 lg:left-3 lg:right-auto lg:top-auto lg:w-96">
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
          {partId && PART_STEPS[partId] && (
            <div className="mt-2">
              <p className="text-xs text-slate-500">ใช้ในขั้น (กดเพื่อไปดู)</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {PART_STEPS[partId].map((i) => (
                  <button
                    key={i}
                    onClick={() => go(i)}
                    title={STEPS[i]?.title ?? 'หน้าสรุป'}
                    className={'rounded-md px-2 py-0.5 text-xs font-medium ' + (i === idx ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-700 hover:bg-orange-100')}
                  >
                    {i >= FINAL ? 'สรุป' : `${STEPS[i].phase}-${STEPS[i].n}`}
                  </button>
                ))}
              </div>
            </div>
          )}
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
    <label className="flex cursor-pointer items-center gap-1 px-1 text-slate-100">
      <input type="checkbox" className="accent-orange-500" checked={on} onChange={(e) => set(e.target.checked)} />
      {text}
    </label>
  );
}
