import { useState } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (title: string, description?: string) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, title, description };
    
    setToasts((prev) => [...prev, newToast]);
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, removeToast };
} 