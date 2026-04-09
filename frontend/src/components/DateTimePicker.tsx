import { useState, useMemo } from 'react';

interface DateTimePickerProps {
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const TIME_SLOTS: string[] = [];
for (let h = 8; h < 18; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2,'0')}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2,'0')}:30`);
}

function pad(n: number) { return String(n).padStart(2,'0'); }
function dateKey(y: number, m: number, d: number) { return `${y}-${pad(m+1)}-${pad(d)}`; }

export function DateTimePicker({ selectedDate, selectedTime, onDateChange, onTimeChange }: DateTimePickerProps) {
  const now = new Date();
  const [viewY, setViewY] = useState(now.getFullYear());
  const [viewM, setViewM] = useState(now.getMonth());

  const days = useMemo(() => {
    const firstDay    = new Date(viewY, viewM, 1).getDay();
    const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewY, viewM]);

  const canPrev = useMemo(() => {
    const t = new Date();
    return viewY > t.getFullYear() || (viewY === t.getFullYear() && viewM > t.getMonth());
  }, [viewY, viewM]);

  const prevMonth = () => {
    if (!canPrev) return;
    if (viewM === 0) { setViewY(y => y - 1); setViewM(11); } else setViewM(m => m - 1);
  };
  const nextMonth = () => {
    if (viewM === 11) { setViewY(y => y + 1); setViewM(0); } else setViewM(m => m + 1);
  };

  const isPast = (d: number) => {
    const t = new Date(); t.setHours(0,0,0,0);
    return new Date(viewY, viewM, d) < t;
  };
  const isToday = (d: number) => {
    const t = new Date();
    return viewY === t.getFullYear() && viewM === t.getMonth() && d === t.getDate();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_150px] gap-3">

      {/* Calendar */}
      <div className="card p-4">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button" onClick={prevMonth} disabled={!canPrev}
            className={canPrev
              ? 'w-7 h-7 rounded-lg flex items-center justify-center hover:bg-stone-100 text-stone-600 transition'
              : 'w-7 h-7 rounded-lg flex items-center justify-center text-stone-300 cursor-not-allowed'
            }
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-stone-800">{MONTHS[viewM]} {viewY}</span>
          <button
            type="button" onClick={nextMonth}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-stone-100 text-stone-600 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((w, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-stone-400">{w}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {days.map((day, idx) => {
            if (day === null) return <div key={`e-${idx}`} className="aspect-square" />;
            const key  = dateKey(viewY, viewM, day);
            const past = isPast(day);
            const tod  = isToday(day);
            const sel  = selectedDate === key;

            let cls = 'aspect-square rounded-lg text-xs transition-all duration-150 ';

            if (past) {
              cls += 'text-stone-300 cursor-not-allowed';
            } else if (sel) {
              cls += 'font-bold text-white shadow-sm bg-brand';
            } else if (tod) {
              cls += 'font-semibold text-blue-700 bg-blue-50 ring-1 ring-blue-300';
            } else {
              cls += 'text-stone-700 hover:bg-stone-100 active:scale-95';
            }

            return (
              <button
                key={key}
                type="button"
                onClick={() => !past && onDateChange(key)}
                disabled={past}
                className={cls}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div className="card p-3">
        <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Horário</p>
        {!selectedDate ? (
          <p className="text-xs text-stone-400 leading-snug">Selecione uma data primeiro</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-1 max-h-[220px] overflow-y-auto">
            {TIME_SLOTS.map((time) => {
              const sel = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => onTimeChange(time)}
                  className={sel
                    ? 'text-xs font-bold py-2 px-2 rounded-lg border transition-all duration-150 text-white border-transparent shadow-sm bg-brand'
                    : 'text-xs font-semibold py-2 px-2 rounded-lg border transition-all duration-150 border-stone-200 text-stone-600 hover:border-stone-400 hover:bg-stone-50 active:scale-95'
                  }
                >
                  {time}
                </button>
              );
            })}
          </div>
        )}
        <p className="text-[9px] text-stone-300 mt-2 leading-snug">
          Conflitos verificados ao confirmar
        </p>
      </div>
    </div>
  );
}
