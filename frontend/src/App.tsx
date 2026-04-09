import { useState } from 'react';
import { useServices } from './hooks/useServices';
import { useAppointments } from './hooks/useAppointments';
import { ServiceList } from './components/ServiceList';
import { AppointmentForm } from './components/AppointmentForm';
import { AppointmentList } from './components/AppointmentList';
import { Toast } from './components/Toast';
import { ApiError } from './api/client';
import type { ToastState } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'agendar' | 'agendamentos'>('agendar');
  const [toast, setToast] = useState<ToastState | null>(null);

  const services = useServices();
  const appointments = useAppointments();

  const handleSuccess = () => {
    setToast({ message: 'Agendamento criado com sucesso!', type: 'success' });
  };

  const handleError = (error: ApiError) => {
    if (error.errors) {
      const firstField = Object.keys(error.errors)[0];
      const firstMessage = error.errors[firstField]?.[0] ?? error.message;
      setToast({ message: firstMessage, type: 'error' });
    } else {
      setToast({ message: error.message, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header>
        <div className="h-1 bg-amber-500"></div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-gray-900">VitaBee</h1>
          <p className="text-gray-500">Agendamento de Serviços</p>
        </div>
      </header>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      <main className="max-w-4xl mx-auto px-4 pb-12">
        <div className="flex gap-4 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('agendar')}
            className={activeTab === 'agendar'
              ? 'border-b-2 border-amber-500 text-amber-600 font-semibold pb-2 text-sm'
              : 'text-gray-500 pb-2 text-sm hover:text-gray-700'}
          >
            Agendar
          </button>
          <button
            onClick={() => setActiveTab('agendamentos')}
            className={activeTab === 'agendamentos'
              ? 'border-b-2 border-amber-500 text-amber-600 font-semibold pb-2 text-sm'
              : 'text-gray-500 pb-2 text-sm hover:text-gray-700'}
          >
            Agendamentos
          </button>
        </div>

        {activeTab === 'agendar' && (
          <section className="space-y-8">
            <ServiceList
              services={services.data}
              loading={services.loading}
              error={services.error}
            />
            <AppointmentForm
              services={services.data}
              onSubmit={appointments.createAppointment}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </section>
        )}

        {activeTab === 'agendamentos' && (
          <section>
            <AppointmentList
              appointments={appointments.data}
              loading={appointments.loading}
            />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
