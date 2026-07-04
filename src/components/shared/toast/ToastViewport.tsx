'use client';

import { ClientPortal } from '@/components/shared/ClientPortal';
import { selectToasts } from '@/lib/rtk/features/toasts.slice';
import { useAppSelector } from '@/lib/rtk/hooks';
import { ToastItem } from './ToastItem';

/**
 * Renders the active toast stack via a portal, above modals. Mounted once in the
 * root layout. Pointer events pass through the gutter so toasts never block taps.
 */
export function ToastViewport() {
  const toasts = useAppSelector(selectToasts);

  if (!toasts.length) return null;

  return (
    <ClientPortal>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[1000] flex justify-center px-4 pt-[calc(var(--tg-inset-top)+12px)]">
        <div className="flex w-full max-w-140 flex-col gap-2">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} />
          ))}
        </div>
      </div>
    </ClientPortal>
  );
}
