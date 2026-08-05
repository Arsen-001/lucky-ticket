'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useGetNotificationsFeedInfiniteQuery,
  useMarkAsReadMutation,
} from '@/api/notifications.api';
import { NotificationModal } from '@/components/shared/modals/NotificationModal';
import { NotificationBanner } from '@/components/layout-elements/NotificationBanner';
import { useAutoSurfaceSlot } from '@/hooks/useAutoSurfaceSlot';
import type { Notification } from '@/types/interfaces/notifications.interfaces';

/** Time to let the modal close animation finish before surfacing the next one. */
const MODAL_CLOSE_MS = 250;

/**
 * Surfaces admin-authored notifications by their display mode on app entry:
 * `modal` notifications auto-open as a modal (one at a time), `banner` ones show
 * as a dismissible banner. Both mark themselves read on dismiss so they never
 * pop again. `feed` notifications stay quietly in the list only.
 */
export function NotificationAutoSurface() {
  // Only the newest page: a banner or a modal is something just published, and
  // this shares the exact cache entry the notifications screen opens on.
  const { data } = useGetNotificationsFeedInfiniteQuery('all');
  const notifications = data?.pages[0]?.items;
  const [markAsRead] = useMarkAsReadMutation();

  const [modalNotification, setModalNotification] = useState<Notification | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearTimeout(clearTimer.current ?? undefined), []);

  // Pick the newest unread `modal` notification to auto-open, one at a time.
  useEffect(() => {
    if (modalNotification) return;
    const next = notifications?.find(n => !n.read && n.displayMode === 'modal');
    if (next) {
      setModalNotification(next);
      setModalOpen(true);
    }
  }, [notifications, modalNotification]);

  const handleModalClose = () => {
    setModalOpen(false);
    if (modalNotification) markAsRead(modalNotification.id);
    // Clear after the close animation so the effect can surface the next one.
    clearTimer.current = setTimeout(() => setModalNotification(null), MODAL_CLOSE_MS);
  };

  // Newest unread `banner` notification — stays until dismissed. A banner is
  // not modal, so it needs no turn at the shared popup slot.
  const banner = notifications?.find(n => !n.read && n.displayMode === 'banner') ?? null;

  // Waits its turn behind the tournament result popup instead of stacking on
  // top of it — two `aria-modal` dialogs at once left the lower one unreachable.
  const canShowModal = useAutoSurfaceSlot('notification', modalOpen);

  return (
    <>
      <NotificationModal
        notification={modalNotification}
        open={canShowModal}
        onClose={handleModalClose}
      />
      {banner && (
        <NotificationBanner
          key={banner.id}
          notification={banner}
          onDismiss={() => markAsRead(banner.id)}
        />
      )}
    </>
  );
}
