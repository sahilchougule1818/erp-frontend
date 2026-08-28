import { useToast } from './use-toast';
import { cn } from './utils';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-base font-medium pointer-events-auto',
            'animate-in slide-in-from-bottom-2 fade-in duration-200',
            t.variant === 'destructive'
              ? 'bg-red-600 text-white border-red-700'
              : 'bg-white text-slate-800 border-slate-200'
          )}
        >
          <span className="mt-0.5 shrink-0">
            {t.variant === 'destructive'
              ? <AlertCircle className="h-4 w-4 text-white" />
              : <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            }
          </span>
          <span className="flex-1 leading-snug">{t.title}</span>
          <button
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            onClick={() => dismiss(t.id)}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
