import type { Service, Appointment, CreateAppointmentPayload, AdminUser } from '../types';

const BASE = '/api';

let runtimeToken: string | null = localStorage.getItem('admin_token');

export function setAuthToken(token: string | null) {
  runtimeToken = token;
  if (token) localStorage.setItem('admin_token', token);
  else localStorage.removeItem('admin_token');
}

export function getAuthToken(): string | null {
  return runtimeToken;
}

function effectiveToken(): string {
  return runtimeToken ?? (import.meta.env.VITE_API_TOKEN ?? '');
}

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
  const token = effectiveToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
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

  login: (email: string, password: string) =>
    request<{ token: string; user: AdminUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request<void>('/auth/logout', { method: 'POST' }),

  deleteAppointment: (id: number) =>
    request<void>(`/appointments/${id}`, { method: 'DELETE' }),
};
