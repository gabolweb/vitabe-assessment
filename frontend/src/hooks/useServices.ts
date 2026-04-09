import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Service } from '../types';

export function useServices() {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getServices()
      .then((res) => setData(res.data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
