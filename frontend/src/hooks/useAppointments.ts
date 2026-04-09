import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { Appointment, CreateAppointmentPayload } from '../types';

export function useAppointments() {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(() => {
    setLoading(true);
    api.getAppointments()
      .then((res) => setData(res.data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const createAppointment = async (payload: CreateAppointmentPayload) => {
    await api.createAppointment(payload);
    fetchAppointments();
  };

  return { data, loading, error, createAppointment };
}
