import type React from 'react';
import { useEffect, useState, useCallback } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onDismiss: () => void;
  duration?: number;
}

const CONFIG = {
  success: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg:   'bg-emerald-100',
    iconColor:'text-emerald-600',
    barColor: 'bg-emerald-500',
    textColor:'text-surface-800',
  },
  error: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg:   'bg-red-100',
    iconColor:'text-red-500',
    barColor: 'bg-red-500',
    textColor:'text-surface-800',
  },
  warning: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    iconBg:   'bg-amber-100',
    iconColor:'text-amber-600',
    barColor: 'bg-amber-500',
    textColor:'text-surface-800',
  },
};

export function Toast({ message, type, onDismiss, duration = 4500 }: ToastProps) {
  const [visible, setVisible]   = useState(false);
  const [exiting, setExiting]   = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(onDismiss, 280);
  }, [onDismiss]);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  useEffect(() => {
    const t = setTimeout(dismiss, duration);
    return () => clearTimeout(t);
  }, [dismiss, duration]);

  const c = CONFIG[type];

  return (
    <div
      role="alert"
      className={`
        fixed top-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm
        toast-glass shadow-lg overflow-hidden
        transition-all duration-280 ease-out
        ${visible && !exiting ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      <div className="flex items-start gap-3 p-3.5">
        {/* Icon */}
        <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${c.iconBg} ${c.iconColor}`}>
          {c.icon}
        </div>
        {/* Text */}
        <p className={`flex-1 text-xs font-medium leading-snug pt-1 ${c.textColor}`}>{message}</p>
        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-md text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition mt-0.5"
          aria-label="Fechar"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-[2px] bg-surface-100">
        <div
          className={`h-full ${c.barColor} origin-left animate-progress-bar`}
          style={{ '--progress-duration': `${duration}ms` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
