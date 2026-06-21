import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

const ICONS = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type, message, duration = 4000) => {
    const id = ++idRef.current;
    setToasts((list) => [...list, { id, type, message }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  // Stable API: toast.success(msg) / .error / .warning / .info
  const toast = useRef({
    success: (m, d) => push('success', m, d),
    error:   (m, d) => push('error', m, d),
    warning: (m, d) => push('warning', m, d),
    info:    (m, d) => push('info', m, d),
  }).current;

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`} role="status">
            <span className="material-symbols-outlined toast__icon" aria-hidden="true">
              {ICONS[t.type] || 'info'}
            </span>
            <span className="toast__msg">{t.message}</span>
            <button className="toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
