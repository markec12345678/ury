'use client';

import { useEffect } from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useURYStore, type ToastMessage } from '@/lib/ury-store';

const toastIcons: Record<ToastMessage['type'], React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles: Record<ToastMessage['type'], string> = {
  success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
};

const iconStyles: Record<ToastMessage['type'], string> = {
  success: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
};

function ToastItem({ toast }: { toast: ToastMessage }) {
  const removeToast = useURYStore((s) => s.removeToast);
  const Icon = toastIcons[toast.type];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm animate-in slide-in-from-right-full ${toastStyles[toast.type]}`}
      style={{ animationDuration: '300ms' }}
    >
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconStyles[toast.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && (
          <p className="text-xs mt-0.5 opacity-80">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useURYStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
