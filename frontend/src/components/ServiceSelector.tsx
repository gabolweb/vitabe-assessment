import { useState, useMemo } from 'react';
import type { Service } from '../types';
import { getServiceIcon } from './icons';

interface ServiceSelectorProps {
  services: Service[];
  loading: boolean;
  error: string | null;
  selectedId: number | null;
  onSelect: (service: Service) => void;
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
                  {getServiceIcon(service.name)}
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
