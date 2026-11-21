import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LuCircleCheck, LuTriangleAlert, LuInfo, LuX, LuCircleX } from 'react-icons/lu';

/**
 * ToastProvider — the app's notification surface.
 *
 * Replaces the mix of `window.alert` and silent `console.error` the UI used
 * before. Toasts are announced (role="status" / "alert"), auto-dismiss
 * (errors stay until dismissed), and stack bottom-centre on mobile /
 * bottom-right on desktop so they never cover the header.
 */

const ToastContext = createContext(null);

const ICONS = {
  success: LuCircleCheck,
  error: LuCircleX,
  warning: LuTriangleAlert,
  info: LuInfo,
};

const DEFAULT_DURATION = { success: 3200, info: 3600, warning: 5200, error: 0 };

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message, { tone = 'info', duration } = {}) => {
      if (!message) return null;
      const id = (nextId += 1);
      const life = duration ?? DEFAULT_DURATION[tone] ?? 4000;
      setToasts((current) => [...current, { id, message, tone }].slice(-4));
      if (life > 0) {
        timers.current.set(id, setTimeout(() => dismiss(id), life));
      }
      return id;
    },
    [dismiss]
  );

  // Clear pending timers on unmount so nothing fires into a dead tree.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const api = useMemo(
    () => ({
      toast: push,
      dismiss,
      success: (message, options) => push(message, { ...options, tone: 'success' }),
      error: (message, options) => push(message, { ...options, tone: 'error' }),
      warning: (message, options) => push(message, { ...options, tone: 'warning' }),
      info: (message, options) => push(message, { ...options, tone: 'info' }),
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.tone] ?? LuInfo;
          return (
            <div
              key={toast.id}
              className={`toast toast--${toast.tone} glass--float`}
              role={toast.tone === 'error' ? 'alert' : 'status'}
            >
              <Icon className="toast__icon" aria-hidden="true" />
              <span className="toast__message">{toast.message}</span>
              <button
                type="button"
                className="toast__close"
                onClick={() => dismiss(toast.id)}
                aria-label="Fermer la notification"
              >
                <LuX aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- provider + its hook live together
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
