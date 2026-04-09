import { useState } from 'react';
import { useServices } from './hooks/useServices';
import { useAppointments } from './hooks/useAppointments';
import { AppointmentForm } from './components/AppointmentForm';
import { AppointmentList } from './components/AppointmentList';
import { Toast } from './components/Toast';
import { ApiError } from './api/client';
import type { ToastState } from './types';

type Tab = 'agendar' | 'historico';

const PRIMARY = '#00285c';

function App() {
  const [tab, setTab]     = useState<Tab>('agendar');
  const [toast, setToast] = useState<ToastState | null>(null);

  const services     = useServices();
  const appointments = useAppointments();

  const handleSuccess = () => setToast({ message: 'Agendamento realizado com sucesso! ✨', type: 'success' });
  const handleError   = (e: ApiError) => setToast({ message: e.message, type: e.status === 409 ? 'warning' : 'error' });

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center">
      
      {/* Header — Inverted: Navy background, White content */}
      <header className="sticky top-0 z-40 w-full flex justify-center shadow-md overflow-hidden" style={{ background: PRIMARY }}>
        {/* Subtle glass effect on top of navy */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-md" />
        
        <div className="relative w-full max-w-2xl px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo — Expanded, no text */}
          <div className="flex items-center">
            <div className="w-14 h-14 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="VITABE Logo"
                className="w-12 h-12 object-contain drop-shadow-md"
              />
            </div>
          </div>

          {/* Navigation Group — White text */}
          <div className="flex items-center h-full gap-6">
            <nav className="flex items-center h-full gap-2">
              {([
                { id: 'agendar',   label: 'Agendar'   },
                { id: 'historico', label: 'Histórico' },
              ] as { id: Tab; label: string }[]).map(({ id, label }) => {
                const isActive = tab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className="relative h-full px-3 text-[12px] font-bold tracking-widest uppercase transition-all duration-200"
                    style={isActive ? { color: '#FFFFFF' } : { color: 'rgba(255,255,255,0.5)' }}
                  >
                    {label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Notifications Badge */}
            {appointments.data.length > 0 && (
              <span className="flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white text-[#00285c]">
                {appointments.data.length}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}

      {/* Content */}
      <main className="w-full max-w-2xl px-4 sm:px-6 py-8">
        {tab === 'agendar' && (
          <AppointmentForm
            services={services.data}
            servicesLoading={services.loading}
            servicesError={services.error}
            onSubmit={appointments.createAppointment}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}
        {tab === 'historico' && (
          <AppointmentList appointments={appointments.data} loading={appointments.loading} />
        )}
      </main>
    </div>
  );
}

export default App;
