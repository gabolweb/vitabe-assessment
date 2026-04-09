import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}

export function Toast({ message, type, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const enterClass = visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2';

  return (
    <div
      role="alert"
      className={`fixed top-4 right-4 z-50 ${bgColor} px-4 py-3 rounded-lg shadow-lg text-white text-sm font-normal max-w-sm transition-all duration-300 ${enterClass}`}
    >
      {message}
      <button
        onClick={onDismiss}
        className="ml-4 font-bold hover:opacity-80"
        aria-label="Fechar notificação"
      >
        x
      </button>
    </div>
  );
}
