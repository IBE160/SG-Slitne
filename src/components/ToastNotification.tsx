// EPIC-8: Toast Notifications
// Purpose: Non-blocking feedback for sync operations

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // Auto-dismiss after ms (0 = no auto-dismiss)
}

interface ToastNotificationProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export default function ToastNotification({ toast, onDismiss }: ToastNotificationProps) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toast.id, toast.duration, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  const getColorClasses = () => {
    switch (toast.type) {
      case 'success': return 'bg-green-100 border-green-400 text-green-800';
      case 'error': return 'bg-red-100 border-red-400 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'info': return 'bg-blue-100 border-blue-400 text-blue-800';
      default: return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border-2 shadow-lg ${getColorClasses()} animate-slide-in`}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      <span className="text-xl flex-shrink-0">{getIcon()}</span>
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button
        type="button"
        className="flex-shrink-0 ml-2 text-current opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-1 rounded transition-opacity"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

// Container component to manage multiple toasts
interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div 
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
