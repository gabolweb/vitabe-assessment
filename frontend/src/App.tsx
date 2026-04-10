import { useState, type FormEvent } from 'react';
import { useServices } from './hooks/useServices';
import { useAppointments } from './hooks/useAppointments';
import { AppointmentForm } from './components/AppointmentForm';
import { AppointmentList } from './components/AppointmentList';
import { Toast } from './components/Toast';
import { api, ApiError, setAuthToken, getAuthToken } from './api/client';
import type { ToastState, AdminUser } from './types';

type Tab = 'agendar' | 'historico';

function App() {
  const [tab, setTab] = useState<Tab>('agendar');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const services = useServices();
  const appointments = useAppointments();

  const isAdmin = admin !== null && getAuthToken() !== null;

  const handleSuccess = () => {
    setToast({ message: 'Agendamento realizado com sucesso!', type: 'success' });
    setTab('historico');
  };

  const handleError = (e: ApiError) =>
    setToast({ message: e.message, type: e.status === 409 ? 'warning' : 'error' });

  const handleDelete = async (id: number) => {
    try {
      await appointments.deleteAppointment(id);
      setToast({ message: 'Agendamento excluído.', type: 'success' });
    } catch (err) {
      const apiErr = err as ApiError;
      appointments.refresh();
      setToast({
        message: apiErr.status === 404
          ? 'Agendamento não encontrado. A lista foi atualizada.'
          : 'Não foi possível excluir o agendamento. Tente novamente.',
        type: 'error',
      });
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await api.login(loginEmail, loginPassword);
      setAuthToken(res.token);
      setAdmin(res.user);
      localStorage.setItem('admin_user', JSON.stringify(res.user));
      setShowLogin(false);
      setLoginEmail('');
      setLoginPassword('');
      setTab('historico');
    } catch (err) {
      const apiErr = err as ApiError;
      setLoginError(apiErr.message ?? 'Erro ao autenticar. Tente novamente.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore logout errors — clear state regardless
    }
    setAuthToken(null);
    setAdmin(null);
    localStorage.removeItem('admin_user');
    setTab('agendar');
  };

  const tabs = isAdmin
    ? [{ id: 'historico' as Tab, label: 'Agendamentos' }]
    : [
      { id: 'agendar' as Tab, label: 'Agendar' },
      { id: 'historico' as Tab, label: 'Histórico' },
    ];

  const activeTab = isAdmin ? 'historico' : tab;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center">

      {/* Header */}
      <header className="sticky top-0 z-40 w-full flex justify-center shadow-md overflow-hidden bg-brand">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-md" />

        <div className="relative w-full max-w-2xl px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center">
            <div className="w-14 h-14 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="VITABE Logo"
                className="w-12 h-12 object-contain drop-shadow-md"
              />
            </div>
          </div>

          {/* Navigation + auth group */}
          <div className="flex items-center h-full gap-4">
            <nav className="flex items-center h-full gap-2">
              {tabs.map(({ id, label }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => !isAdmin && setTab(id)}
                    className={`relative h-full px-3 text-[12px] font-bold tracking-widest uppercase transition-all duration-200 ${isActive ? 'text-white' : 'text-white/50'}`}
                  >
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Badge de contagem (apenas usuário comum) */}
            {!isAdmin && appointments.data.length > 0 && (
              <span className="flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white text-brand">
                {appointments.data.length}
              </span>
            )}

            {/* Admin: info + logout */}
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-[11px] text-white/70 font-medium">{admin.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Admin
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}

      {/* Login modal */}
      {showLogin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={(e) => e.target === e.currentTarget && setShowLogin(false)}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-stone-800">Acesso Administrativo</h2>
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@vitabe.com"
                  required
                  autoFocus
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Senha</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field"
                />
              </div>

              {loginError && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="btn btn-primary w-full justify-center mt-1"
              >
                {loginLoading ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Entrando...
                  </>
                ) : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="w-full max-w-2xl px-4 sm:px-6 py-8">
        {activeTab === 'agendar' && !isAdmin && (
          <AppointmentForm
            services={services.data}
            servicesLoading={services.loading}
            servicesError={services.error}
            onSubmit={appointments.createAppointment}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}
        {activeTab === 'historico' && (
          <AppointmentList
            appointments={appointments.data}
            loading={appointments.loading}
            isAdmin={isAdmin}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}

export default App;
