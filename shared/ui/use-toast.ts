import { useState, useEffect, useCallback } from 'react';

interface ToastOptions {
  title: string;
  variant?: 'default' | 'destructive';
}

interface Toast extends ToastOptions {
  id: string;
}

// Module-level singleton — shared across all components
let toastCount = 0;
let listeners: Array<(toasts: Toast[]) => void> = [];
let currentToasts: Toast[] = [];

function emitChange(toasts: Toast[]) {
  currentToasts = toasts;
  listeners.forEach(l => l(toasts));
}

export function addToast(options: ToastOptions) {
  const id = (++toastCount).toString();
  const next = [...currentToasts, { ...options, id }];
  emitChange(next);
  setTimeout(() => {
    emitChange(currentToasts.filter(t => t.id !== id));
  }, 3500);
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>(currentToasts);

  useEffect(() => {
    const listener = (t: Toast[]) => setToasts([...t]);
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }, []);

  const toast = useCallback((options: ToastOptions) => addToast(options), []);
  const dismiss = useCallback((id: string) => {
    emitChange(currentToasts.filter(t => t.id !== id));
  }, []);

  return { toast, toasts, dismiss };
};
