'use client';
import { PageHeader } from '@/components/layout-elements/PageHeader';
import { CheckCheck } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useGetNotificationsQuery, useMarkAllAsReadMutation } from '@/api/notifications.api';

export default function NotificationsHeader() {
  const t = useAppTranslations();
  const { data: notifications } = useGetNotificationsQuery();
  const [markAllAsRead, { isLoading }] = useMarkAllAsReadMutation();

  const hasUnread = notifications?.some(n => !n.read);
  const handleMarkAllAsRead = () => markAllAsRead();

  return (
    <PageHeader
      title={t('notifications')}
      extraButtonProps={
        hasUnread && { icon: <CheckCheck />, loading: isLoading, onClick: handleMarkAllAsRead }
      }
    />
  );
}
