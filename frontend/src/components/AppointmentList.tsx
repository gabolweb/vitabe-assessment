import type { Appointment } from '../types';

interface AppointmentListProps {
  appointments: Appointment[];
  loading: boolean;
}

function formatDateRange(starts_at: string, ends_at: string): string {
  const startDate = new Date(starts_at);
  const endDate = new Date(ends_at);

  const datePart = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(startDate);

  const startTime = startDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const endTime = endDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${datePart} às ${startTime} – ${endTime}`;
}

export function AppointmentList({ appointments, loading }: AppointmentListProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <h2 className="text-xl font-semibold text-gray-900 p-6 pb-0">Agendamentos</h2>

      {loading ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-sm font-normal text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-sm font-normal text-gray-500 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-sm font-normal text-gray-500 uppercase tracking-wider">Data/Hora</th>
                <th className="px-6 py-3 text-sm font-normal text-gray-500 uppercase tracking-wider">Duração</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <tr key={i} className="border-t border-gray-200">
                  <td className="px-6 py-4"><div className="bg-gray-200 animate-pulse rounded h-4 w-3/4"></div></td>
                  <td className="px-6 py-4"><div className="bg-gray-200 animate-pulse rounded h-4 w-3/4"></div></td>
                  <td className="px-6 py-4"><div className="bg-gray-200 animate-pulse rounded h-4 w-3/4"></div></td>
                  <td className="px-6 py-4"><div className="bg-gray-200 animate-pulse rounded h-4 w-3/4"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : appointments.length === 0 ? (
        <p className="text-gray-500 p-6">Nenhum agendamento encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-sm font-normal text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-sm font-normal text-gray-500 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-sm font-normal text-gray-500 uppercase tracking-wider">Data/Hora</th>
                <th className="px-6 py-3 text-sm font-normal text-gray-500 uppercase tracking-wider">Duração</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-t border-gray-200">
                  <td className="px-6 py-4 text-sm text-gray-900">{appointment.client_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{appointment.service.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDateRange(appointment.starts_at, appointment.ends_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{appointment.duration_snapshot} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
