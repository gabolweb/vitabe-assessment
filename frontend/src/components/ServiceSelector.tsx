import { useState, useMemo } from 'react';
import type { Service } from '../types';

interface ServiceSelectorProps {
  services: Service[];
  loading: boolean;
  error: string | null;
  selectedId: number | null;
  onSelect: (service: Service) => void;
}

const ICONS: { key: string; el: JSX.Element }[] = [
  { key: 'corte', el: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zm1.536.887a2.165 2.165 0 011.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 1.199M7.848 15.75l1.536-.887m-1.536.887a3 3 0 11-5.196 3 3 3 0 015.196-3zm1.536-.887a2.165 2.165 0 001.083-1.838c.005-.352.054-.695.14-1.025m-1.223 2.863l2.077-1.199m0-3.328a4.323 4.323 0 012.068-1.379l5.325-1.628a4.5 4.5 0 012.48-.044l.803.215-7.794 4.5m-2.882-1.664A4.331 4.331 0 0010.607 12m3.736 0l7.794 4.5-.802.215a4.5 4.5 0 01-2.48-.043l-5.326-1.629a4.324 4.324 0 01-2.068-1.379M14.343 12l-2.882 1.664" />
    </svg>
  )},
  { key: 'manicure', el: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  )},
  { key: 'pedicure', el: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  )},
  { key: 'hidrat', el: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
    </svg>
  )},
  { key: 'design', el: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )},
];

const defaultIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

function getIcon(name: string) {
  const lower = name.toLowerCase();
  return ICONS.find((i) => lower.includes(i.key))?.el ?? defaultIcon;
}

export function ServiceSelector({ services, loading, error, selectedId, onSelect }: ServiceSelectorProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return q ? services.filter((s) => s.name.toLowerCase().includes(q)) : services;
  }, [services, query]);

  if (error) {
    return (
      <p className="text-sm text-center text-stone-400 py-6">
        Erro ao carregar serviços. Tente recarregar a página.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-9 w-full rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton h-[72px] rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          id="service-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar serviço..."
          className="input-field pl-9"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-4">
          Nenhum resultado para "<span className="text-stone-600 font-medium">{query}</span>"
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {filtered.map((service) => {
            const sel = selectedId === service.id;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => onSelect(service)}
                className={
                  sel
                    ? 'relative text-left px-3 py-2.5 rounded-xl border transition-all duration-200 border-transparent shadow-md bg-brand'
                    : 'relative text-left px-3 py-2.5 rounded-xl border transition-all duration-200 bg-white border-stone-200 hover:border-stone-300 hover:shadow-sm'
                }
              >
                {/* Checkmark */}
                {sel && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}

                {/* Icon */}
                <div className={
                  sel
                    ? 'w-7 h-7 rounded-lg flex items-center justify-center mb-2 bg-white/15 text-white'
                    : 'w-7 h-7 rounded-lg flex items-center justify-center mb-2 bg-stone-100 text-stone-500'
                }>
                  {getIcon(service.name)}
                </div>

                {/* Name */}
                <p className={sel ? 'text-xs font-semibold leading-tight text-white' : 'text-xs font-semibold leading-tight text-stone-800'}>
                  {service.name}
                </p>

                {/* Duration */}
                <p className={sel ? 'text-[11px] mt-0.5 text-white/50' : 'text-[11px] mt-0.5 text-stone-400'}>
                  {service.duration_min} min
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
