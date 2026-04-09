import { useState } from 'react';
import type { Service, CreateAppointmentPayload } from '../types';
import type { ApiError } from '../api/client';

interface AppointmentFormProps {
  services: Service[];
  onSubmit: (payload: CreateAppointmentPayload) => Promise<void>;
  onSuccess: () => void;
  onError: (error: ApiError) => void;
}

export function AppointmentForm({ services, onSubmit, onSuccess, onError }: AppointmentFormProps) {
  const [clientName, setClientName] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors(null);

    const normalizedDate = startsAt.replace('T', ' ') + ':00';

    try {
      await onSubmit({
        client_name: clientName,
        service_id: Number(serviceId),
        starts_at: normalizedDate,
      });
      onSuccess();
      setClientName('');
      setServiceId('');
      setStartsAt('');
      setFieldErrors(null);
    } catch (error) {
      const apiError = error as ApiError;
      onError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Novo Agendamento</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="clientName" className="block text-sm font-normal text-gray-700 mb-1">
            Nome do Cliente
          </label>
          <input
            id="clientName"
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Seu nome completo"
            required
            className={`w-full rounded-md border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
              fieldErrors?.client_name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {fieldErrors?.client_name && (
            <p className="text-red-600 text-sm mt-1">{fieldErrors.client_name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="serviceId" className="block text-sm font-normal text-gray-700 mb-1">
            Serviço
          </label>
          <select
            id="serviceId"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            required
            className={`w-full rounded-md border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
              fieldErrors?.service_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="" disabled>Selecione um serviço</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
          {fieldErrors?.service_id && (
            <p className="text-red-600 text-sm mt-1">{fieldErrors.service_id[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="startsAt" className="block text-sm font-normal text-gray-700 mb-1">
            Data e Hora
          </label>
          <input
            id="startsAt"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
            className={`w-full rounded-md border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
              fieldErrors?.starts_at ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {fieldErrors?.starts_at && (
            <p className="text-red-600 text-sm mt-1">{fieldErrors.starts_at[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className={`w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 ${
            submitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? 'Agendando...' : 'Agendar'}
        </button>
      </form>
    </div>
  );
}
