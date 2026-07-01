'use client';

import { useEffect, useState } from 'react';
import { useGetNotificationsQuery, useMarkAsReadMutation } from '@/api/notifications.api';
import { NotificationModal } from '@/components/shared/modals/NotificationModal';
import { NotificationBanner } from '@/components/layout-elements/NotificationBanner';
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
  const { data: notifications } = useGetNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();

  const [modalNotification, setModalNotification] = useState<Notification | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    setTimeout(() => setModalNotification(null), MODAL_CLOSE_MS);
  };

  // Newest unread `banner` notification — stays until dismissed.
  const banner = notifications?.find(n => !n.read && n.displayMode === 'banner') ?? null;

  return (
    <>
      <NotificationModal
        notification={modalNotification}
        open={modalOpen}
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
