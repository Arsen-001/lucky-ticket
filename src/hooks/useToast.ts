'use client';

import { nanoid } from '@reduxjs/toolkit';
import { useAppDispatch } from '@/lib/rtk/hooks';
import { addToast, type ToastVariant } from '@/lib/rtk/features/toasts.slice';

/**
 * App-wide toast trigger. Pass already-translated text (call `t()` at the
 * callsite). Used mainly to surface mutation failures so a backend error is
 * never a silent no-op.
 */
export function useToast() {
  const dispatch = useAppDispatch();

  const show = (variant: ToastVariant, message: string) =>
    dispatch(addToast({ id: nanoid(), variant, message }));

  return {
    error: (message: string) => show('error', message),
    success: (message: string) => show('success', message),
    info: (message: string) => show('info', message),
  };
}
