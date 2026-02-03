'use client';

import { Modal } from '@/components/shared/modals/Modal';
import { Notification } from '@/types/interfaces/notifications.interfaces';
import { Bell } from 'lucide-react';
import { formatDate } from '@/utils/global/date.utils';
import { Divider } from '@/components/shared/Divider';

interface NotificationModalProps {
  notification: Notification | null;
  open: boolean;
  onClose: () => void;
}

export function NotificationModal({ notification, open, onClose }: NotificationModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient p-5 rounded-xl">
        <div className="flex flex-col items-center text-center mt-4">
          <div className="w-16 h-16 bg-pink/20 rounded-full flex items-center justify-center mb-4">
            <Bell className="text-pink" size={32} />
          </div>

          <h3 className="text-xl font-bold mb-2">{notification?.title}</h3>
          <p className="text-white/70 text-sm whitespace-pre-wrap">{notification?.content}</p>

          <div className="mt-6 w-full text-right">
            <Divider className="border-white/10 mb-3" />
            <span className="text-xs text-white/50">{formatDate(notification?.date)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
