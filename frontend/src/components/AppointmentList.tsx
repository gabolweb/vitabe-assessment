import type React from 'react';
import type { Appointment } from '../types';

interface AppointmentListProps {
  appointments: Appointment[];
  loading: boolean;
  isAdmin?: boolean;
  onDelete?: (id: number) => void;
}

function formatDT(starts_at: string, ends_at: string) {
  const s = new Date(starts_at);
  const e = new Date(ends_at);
  const date = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).format(s);
  const st   = s.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const et   = e.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return { date: date.charAt(0).toUpperCase() + date.slice(1), time: `${st} – ${et}` };
}

export function AppointmentList({ appointments, loading, isAdmin = false, onDelete }: AppointmentListProps) {
  if (loading) {
    return (
      <div className="space-y-2.5">
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="card text-center py-12 px-6 animate-fade-in">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-stone-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-stone-600">Nenhum agendamento</p>
        <p className="text-xs text-stone-400 mt-0.5">
          {isAdmin ? 'Nenhum agendamento registrado ainda.' : 'Vá para "Agendar" para começar ☝️'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 animate-fade-in">
      {appointments.map((a, i) => {
        const { time } = formatDT(a.starts_at, a.ends_at);
        return (
          <div
            key={a.id}
            className="card card-hover px-4 py-3.5 flex items-center gap-4 animate-slide-up stagger-delay"
            style={{ '--stagger-delay': `${i * 40}ms` } as React.CSSProperties}
          >
            {/* Date block */}
            <div className="flex-shrink-0 w-10 text-center">
              <div className="text-base font-black text-stone-900 leading-none">
                {new Date(a.starts_at).getDate().toString().padStart(2,'0')}
              </div>
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mt-0.5">
                {new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(a.starts_at))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-10 bg-surface-200 flex-shrink-0" />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-800 truncate">{a.client_name}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full text-brand bg-brand/8 border border-brand/15">
                  {a.service.name}
                </span>
                <span className="text-[11px] text-stone-400">{time}</span>
              </div>
            </div>

            {/* Duration */}
            <div className="flex-shrink-0 text-[11px] font-semibold text-stone-400 tabular-nums">
              {a.duration_snapshot} min
            </div>

            {/* Admin delete */}
            {isAdmin && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(a.id)}
                title="Excluir agendamento"
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
