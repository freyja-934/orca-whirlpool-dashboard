'use client';
import { Toast } from '@/hooks/useToast';
import { Check } from 'lucide-react';

interface SimpleToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export function SimpleToastContainer({ toasts, removeToast }: SimpleToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-3 shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-300"
          onClick={() => removeToast(toast.id)}
        >
          <Check className="h-4 w-4" />
          <div className="flex-1">
            <div className="font-medium">{toast.title}</div>
            {toast.description && (
              <div className="text-sm opacity-90">{toast.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 