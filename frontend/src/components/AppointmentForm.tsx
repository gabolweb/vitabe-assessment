import { useState } from 'react';
import type { Service, CreateAppointmentPayload } from '../types';
import type { ApiError } from '../api/client';
import { StepIndicator } from './StepIndicator';
import { ServiceSelector } from './ServiceSelector';
import { DateTimePicker } from './DateTimePicker';

interface AppointmentFormProps {
  services: Service[];
  servicesLoading: boolean;
  servicesError: string | null;
  onSubmit: (payload: CreateAppointmentPayload) => Promise<void>;
  onSuccess: () => void;
  onError: (error: ApiError) => void;
}

const STEPS = ['Serviço', 'Horário', 'Confirmar'];

const ERROR_MAP: Record<string, string> = {
  'The starts at must be a date after now.': 'O horário selecionado já passou. Escolha uma data futura.',
  'The starts at does not match the format Y-m-d H:i:s.': 'Data ou horário inválido. Tente novamente.',
  'The selected service id is invalid.': 'O serviço selecionado não está disponível.',
  'The client name field is required.': 'O nome do cliente é obrigatório.',
  'The service id field is required.': 'Selecione um serviço.',
  'The starts at field is required.': 'Informe a data e o horário do agendamento.',
  'Unauthenticated.': 'Sessão expirada. Recarregue a página.',
};

function translate(msg: string) { return ERROR_MAP[msg] ?? msg; }

export function AppointmentForm({
  services, servicesLoading, servicesError, onSubmit, onSuccess, onError,
}: AppointmentFormProps) {
  const [step, setStep]                     = useState(1);
  const [service, setService]               = useState<Service | null>(null);
  const [date, setDate]                     = useState('');
  const [time, setTime]                     = useState('');
  const [name, setName]                     = useState('');
  const [submitting, setSubmitting]         = useState(false);
  const [fieldErrors, setFieldErrors]       = useState<Record<string, string[]> | null>(null);

  const canNext1 = service !== null;
  const canNext2 = date !== '' && time !== '';
  const canSubmit = name.trim().length > 0 && !submitting;

  const reset = () => { setStep(1); setService(null); setDate(''); setTime(''); setName(''); setFieldErrors(null); };
  const back  = () => { setStep(s => s - 1); setFieldErrors(null); };
  const next  = () => setStep(s => s + 1);

  const handleSubmit = async () => {
    if (!service || !date || !time || !name.trim()) return;
    setSubmitting(true);
    setFieldErrors(null);
    try {
      await onSubmit({ client_name: name.trim(), service_id: service.id, starts_at: `${date} ${time}:00` });
      onSuccess();
      reset();
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.errors) {
        const t: Record<string, string[]> = {};
        for (const [k, v] of Object.entries(apiError.errors)) t[k] = v.map(translate);
        setFieldErrors(t);
      }
      const msg = apiError.status === 409
        ? 'Este horário já está ocupado. Escolha outro.'
        : apiError.errors
          ? Object.values(apiError.errors).flat().map(translate)[0] ?? apiError.message
          : translate(apiError.message);
      onError({ ...apiError, message: msg } as ApiError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-5 sm:p-6 shadow-sm">
      <StepIndicator currentStep={step} steps={STEPS} />

      <div className="min-h-[300px]">
        {/* Step 1 — Serviço */}
        {step === 1 && (
          <div className="animate-fade-in">
            <p className="text-xs text-stone-400 mb-3">Escolha o serviço desejado</p>
            <ServiceSelector
              services={services}
              loading={servicesLoading}
              error={servicesError}
              selectedId={service?.id ?? null}
              onSelect={setService}
            />
          </div>
        )}

        {/* Step 2 — Data e Hora */}
        {step === 2 && (
          <div className="animate-fade-in">
            <p className="text-xs text-stone-400 mb-3">
              Selecione data e horário para{' '}
              <span className="font-semibold text-stone-700">{service?.name}</span>{' '}
              <span className="text-stone-400">({service?.duration_min} min)</span>
            </p>
            <DateTimePicker
              selectedDate={date}
              selectedTime={time}
              onDateChange={setDate}
              onTimeChange={setTime}
              serviceDuration={service?.duration_min}
            />
          </div>
        )}

        {/* Step 3 — Confirmar */}
        {step === 3 && (
          <div className="animate-fade-in space-y-4">
            <p className="text-xs text-stone-400">Confirme os dados e informe seu nome</p>

            {/* Summary */}
            <div className="rounded-xl bg-stone-50 border border-stone-200/60 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Serviço</span>
                <span className="font-semibold text-stone-800">
                  {service?.name}&nbsp;
                  <span className="font-normal text-stone-400 text-xs">({service?.duration_min} min)</span>
                </span>
              </div>
              <div className="h-px bg-stone-200/60" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Data</span>
                <span className="font-semibold text-stone-800">
                  {date && new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).format(new Date(date + 'T12:00:00'))}
                </span>
              </div>
              <div className="h-px bg-stone-200/60" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Horário</span>
                <span className="font-bold text-brand">{time}</span>
              </div>
            </div>

            {/* Name input */}
            <div>
              <label htmlFor="clientName" className="block text-xs font-semibold text-stone-600 mb-1.5">
                Nome do cliente
              </label>
              <input
                id="clientName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                autoFocus
                className={`input-field ${fieldErrors?.client_name ? 'error' : ''}`}
              />
              {fieldErrors?.client_name && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.client_name[0]}</p>
              )}
            </div>

            {/* Other field errors */}
            {fieldErrors && !fieldErrors.client_name && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2 space-y-1">
                {Object.values(fieldErrors).flat().map((m, i) => (
                  <p key={i} className="text-xs text-red-500">{m}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-stone-100">
        {step > 1 ? (
          <button type="button" onClick={back} className="btn btn-ghost text-xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Voltar
          </button>
        ) : <div />}

        {step < 3 ? (
          <button
            type="button"
            onClick={next}
            disabled={(step === 1 && !canNext1) || (step === 2 && !canNext2)}
            className="btn btn-primary text-xs"
          >
            Próximo
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn btn-primary text-xs"
          >
            {submitting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Agendando...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Confirmar agendamento
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
