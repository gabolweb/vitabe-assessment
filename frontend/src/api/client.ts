import type { Service, Appointment, CreateAppointmentPayload } from '../types';

const BASE = '/api';
const TOKEN = import.meta.env.VITE_API_TOKEN ?? '';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.message ?? 'Erro desconhecido.',
      body.errors
    );
  }

  return res.json() as Promise<T>;
}

export const api = {
  getServices: () =>
    request<{ data: Service[] }>('/services'),

  getAppointments: () =>
    request<{ data: Appointment[] }>('/appointments'),

  createAppointment: (payload: CreateAppointmentPayload) =>
    request<{ data: Appointment }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
