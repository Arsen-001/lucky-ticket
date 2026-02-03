'use client';

import { useGetNotificationsQuery, useMarkAllAsReadMutation } from '@/api/notifications.api';
import { Button } from '@/components/shared/buttons/Button';
import { CheckCheck } from 'lucide-react';

export function MarkAllAsReadButton() {
  const { data: notifications } = useGetNotificationsQuery();
  const [markAllAsRead, { isLoading }] = useMarkAllAsReadMutation();

  const hasUnread = notifications?.some(n => !n.read);

  if (!hasUnread) return null;

  return (
    <Button
      variant="secondary"
      onClick={() => markAllAsRead()}
      loading={isLoading}
      className="flex items-center text-pink hover:text-pink-secondary transition-colors p-2"
      iconSize={18}
    >
      <CheckCheck size={18} />
    </Button>
  );
}
