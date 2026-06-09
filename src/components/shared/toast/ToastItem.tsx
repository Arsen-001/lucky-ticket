'use client';

import { useEffect, useState } from 'react';
import { CircleAlert, CircleCheck, Info, type LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppDispatch } from '@/lib/rtk/hooks';
import { dismissToast, type Toast, type ToastVariant } from '@/lib/rtk/features/toasts.slice';

// How long a toast stays before auto-dismissing (lifecycle, not animation).
const TOAST_DURATION = 4000;

const variantConfig: Record<ToastVariant, { icon: LucideIcon; className: string }> = {
  error: { icon: CircleAlert, className: 'border-error/45 text-error' },
  success: { icon: CircleCheck, className: 'border-success/45 text-success' },
  info: { icon: Info, className: 'border-teal/45 text-teal' },
};

interface ToastItemProps {
  toast: Toast;
}

export function ToastItem({ toast }: ToastItemProps) {
  const dispatch = useAppDispatch();
  const [leaving, setLeaving] = useState(false);
  const { icon: Icon, className } = variantConfig[toast.variant];

  useEffect(() => {
    const timer = window.setTimeout(() => setLeaving(true), TOAST_DURATION);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={() => setLeaving(true)}
      onAnimationEnd={() => {
        if (leaving) dispatch(dismissToast(toast.id));
      }}
      className={twMerge(
        'bg-background-overlay pointer-events-auto flex w-full cursor-pointer items-center gap-2.5 rounded-2xl border px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-sm',
        className,
        leaving ? 'toast-item-leave' : 'toast-item-enter'
      )}
    >
      <Icon size={18} strokeWidth={2.4} className="flex-shrink-0" />
      <p className="text-[13px] font-semibold leading-snug text-white">{toast.message}</p>
    </div>
  );
}
