/**
 * แผงขั้นตอน: ด้านล่างบนมือถือ / ด้านขวาบนจอใหญ่
 * เส้นเวลาระยะ 0–7 · ข้อความขั้น · ⚠️ คำเตือน · ปุ่มเล่น ย้อน ถัดไป เล่นซ้ำ ความเร็ว
 */
import { forwardRef, useEffect, useRef } from 'react';
import { PHASES, STEPS, type Step } from '../data/steps';
import { FINAL } from '../anim/sceneState';

export interface StepPanelProps {
  idx: number;
  paused: boolean;
  speed: number;
  tl: React.MutableRefObject<gsap.core.Timeline | null>;
  onGo: (idx: number) => void;
  onTogglePlay: () => void;
  onReplay: () => void;
  onSpeed: (s: number) => void;
}

const SPEEDS = [0.5, 1, 2];
const firstOfPhase = (n: number) => STEPS.findIndex((s) => s.phase === n);

export const StepPanel = forwardRef<HTMLDivElement, StepPanelProps>(function StepPanel(p, ref) {
  const step: Step | undefined = STEPS[p.idx];
  const phase = step ? PHASES.find((ph) => ph.n === step.phase)! : null;
  const inPhase = step ? STEPS.filter((s) => s.phase === step.phase) : [];
  const bar = useRef<HTMLDivElement>(null);

  // แถบความคืบหน้าของขั้น (อ่านจากไทม์ไลน์ทุกเฟรม ไม่ต้อง render ใหม่)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (bar.current) bar.current.style.width = `${((p.tl.current?.progress() ?? 1) * 100).toFixed(1)}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [p.tl]);

  return (
    <div
      ref={ref}
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 flex max-h-[48vh] flex-col rounded-t-2xl bg-slate-900/95 text-slate-100 shadow-2xl ring-1 ring-white/10 lg:inset-y-3 lg:left-auto lg:right-3 lg:max-h-none lg:w-[400px] lg:rounded-2xl"
    >
      {/* เส้นเวลาระยะ */}
      <nav className="flex shrink-0 gap-1 overflow-x-auto px-3 pt-3" aria-label="ระยะ">
        {PHASES.map((ph) => {
          const active = step?.phase === ph.n;
          return (
            <button
              key={ph.n}
              onClick={() => p.onGo(firstOfPhase(ph.n))}
              title={`ระยะ ${ph.n} ${ph.title}`}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${active ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {ph.n}
            </button>
          );
        })}
        <button
          onClick={() => p.onGo(FINAL)}
          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${p.idx >= FINAL ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          สรุป
        </button>
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2 pt-3">
        {step && phase ? (
          <>
            <p className="text-xs font-medium text-orange-300">
              ระยะ {phase.n} · {phase.title} <span className="text-slate-400">({phase.when}{phase.people ? ` · ${phase.people}` : ''})</span>
            </p>
            <h2 className="mt-0.5 text-lg font-semibold leading-snug">
              <span className="text-orange-400">
                {step.phase}-{step.n}
              </span>{' '}
              {step.title}
            </h2>
            {step.n === 1 && phase.warn && <Box tone="warn">⚠️ {phase.warn}</Box>}
            {step.n === 1 && phase.intro && <p className="mt-2 text-sm text-slate-300">{phase.intro}</p>}
            <p className="mt-2 text-[15px] leading-relaxed text-slate-100">{step.text}</p>
            {step.warn && <Box tone="warn">⚠️ {step.warn}</Box>}
            {step.note && <Box tone="note">💡 {step.note}</Box>}
            {step.n === 1 && phase.rust && (
              <details className="mt-2 rounded-lg bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
                <summary className="cursor-pointer font-medium text-slate-200">กันสนิมในระยะนี้</summary>
                <p className="mt-1 leading-relaxed">{phase.rust}</p>
              </details>
            )}
            {/* ขั้นในระยะเดียวกัน */}
            <div className="mt-3 flex flex-wrap gap-1">
              {inPhase.map((s) => {
                const i = STEPS.indexOf(s);
                return (
                  <button
                    key={s.id}
                    onClick={() => p.onGo(i)}
                    title={s.title}
                    className={`h-7 min-w-7 rounded-md px-1.5 text-xs ${i === p.idx ? 'bg-orange-500 font-semibold text-white' : i < p.idx ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {s.n}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold">เสร็จสมบูรณ์</h2>
            <p className="mt-1 text-sm text-slate-300">โรงเรือนพร้อมกล่องโฟมบนชั้นวาง ลากหมุนดูรอบ ๆ ได้</p>
          </>
        )}
      </div>

      {/* ปุ่มควบคุม */}
      <div className="shrink-0 border-t border-white/10 px-3 pb-3 pt-2">
        <div className="mb-2 h-1 overflow-hidden rounded bg-slate-700">
          <div ref={bar} className="h-full bg-orange-500" style={{ width: '0%' }} />
        </div>
        <div className="flex items-center gap-1.5">
          <Btn label="ขั้นก่อนหน้า" onClick={() => p.onGo(Math.max(0, p.idx - 1))} disabled={p.idx <= 0}>
            ⏮
          </Btn>
          <Btn label={p.paused ? 'เล่น' : 'หยุดชั่วคราว'} onClick={p.onTogglePlay} primary>
            {p.paused ? '▶' : '⏸'}
          </Btn>
          <Btn label="ขั้นถัดไป" onClick={() => p.onGo(Math.min(FINAL, p.idx + 1))} disabled={p.idx >= FINAL}>
            ⏭
          </Btn>
          <Btn label="เล่นขั้นนี้ซ้ำ" onClick={p.onReplay}>
            ↺
          </Btn>
          <div className="ml-auto flex overflow-hidden rounded-lg ring-1 ring-white/15" role="group" aria-label="ความเร็ว">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => p.onSpeed(s)}
                className={`px-2 py-1.5 text-xs font-semibold ${p.speed === s ? 'bg-slate-100 text-slate-900' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

function Box({ tone, children }: { tone: 'warn' | 'note'; children: React.ReactNode }) {
  const cls = tone === 'warn' ? 'bg-amber-500/15 text-amber-200 ring-amber-400/40' : 'bg-sky-500/10 text-sky-100 ring-sky-400/30';
  return <p className={`mt-2 rounded-lg px-3 py-2 text-sm leading-relaxed ring-1 ${cls}`}>{children}</p>;
}

function Btn({ children, label, onClick, disabled, primary }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-10 w-11 items-center justify-center rounded-lg text-lg disabled:opacity-30 ${primary ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-slate-800 text-slate-100 hover:bg-slate-700'}`}
    >
      {children}
    </button>
  );
}
