import type { Service } from '../types';

interface ServiceListProps {
  services: Service[];
  loading: boolean;
  error: string | null;
}

export function ServiceList({ services, loading, error }: ServiceListProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Serviços Disponíveis</h2>

      {error && (
        <p className="text-red-600">Erro ao carregar serviços. Tente recarregar a página.</p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-gray-200 animate-pulse rounded-lg h-20 w-full"></div>
          <div className="bg-gray-200 animate-pulse rounded-lg h-20 w-full"></div>
          <div className="bg-gray-200 animate-pulse rounded-lg h-20 w-full"></div>
        </div>
      ) : !error && services.length === 0 ? (
        <p className="text-gray-500">Nenhum serviço disponível.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <p className="text-base font-normal text-gray-900">{service.name}</p>
              <p className="text-sm text-gray-500">{service.duration_min} min</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
