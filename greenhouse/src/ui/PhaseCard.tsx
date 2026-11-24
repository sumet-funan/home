/** การ์ด "เช็กก่อนไปต่อ" ตอนจบแต่ละระยะ — ติ๊กได้ และจำไว้ในเบราว์เซอร์ */
import type { Phase } from '../data/steps';
import { checkKey, type Checks } from './storage';

export interface CheckCardProps {
  title: string;
  subtitle?: string;
  group: string;
  items: string[];
  checks: Checks;
  onToggle: (key: string, on: boolean) => void;
  emptyText?: string;
  primary?: { text: string; onClick: () => void };
  secondary?: { text: string; onClick: () => void };
  onClose: () => void;
}

export function CheckCard(p: CheckCardProps) {
  const done = p.items.filter((_, i) => p.checks[checkKey(p.group, i)]).length;
  return (
    <div className="pointer-events-auto w-full max-w-md rounded-2xl bg-white p-4 text-slate-800 shadow-2xl ring-1 ring-black/10" role="dialog" aria-label={p.title}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{p.title}</h2>
          {p.subtitle && <p className="text-sm text-slate-500">{p.subtitle}</p>}
        </div>
        <button className="rounded-lg px-2 text-xl leading-none text-slate-400 hover:bg-slate-100" onClick={p.onClose} aria-label="ปิด">
          ×
        </button>
      </div>
      {p.items.length > 0 ? (
        <>
          <ul className="mt-3 flex flex-col gap-2">
            {p.items.map((t, i) => {
              const k = checkKey(p.group, i);
              return (
                <li key={k}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-slate-50 px-3 py-2 hover:bg-orange-50">
                    <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-orange-500" checked={!!p.checks[k]} onChange={(e) => p.onToggle(k, e.target.checked)} />
                    <span className="text-[15px] leading-relaxed">{t}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            ติ๊กแล้ว {done}/{p.items.length} ข้อ (จำไว้ในเครื่องนี้)
          </p>
        </>
      ) : (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{p.emptyText}</p>
      )}
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {p.secondary && (
          <button className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100" onClick={p.secondary.onClick}>
            {p.secondary.text}
          </button>
        )}
        {p.primary && (
          <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600" onClick={p.primary.onClick}>
            {p.primary.text}
          </button>
        )}
      </div>
    </div>
  );
}

export const phaseCardTitle = (ph: Phase) => `เช็กก่อนไปต่อ · จบระยะ ${ph.n}`;
