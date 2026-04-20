'use client';

import { Modal } from '@/components/shared/modals/Modal';
import { Notification } from '@/types/interfaces/notifications.interfaces';
import { Bell } from 'lucide-react';
import { formatDate } from '@/utils/global/date.utils';

interface NotificationModalProps {
  notification: Notification | null;
  open: boolean;
  onClose: () => void;
}

export function NotificationModal({ notification, open, onClose }: NotificationModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient rounded-xl overflow-hidden">
        <div className="flex flex-col items-center text-center px-6 pt-8 pb-6">
          <div className="w-14 h-14 bg-electric-pink/15 rounded-full flex-center mb-4 border border-electric-pink/30">
            <Bell className="text-electric-pink" size={26} />
          </div>

          <h3 className="text-lg font-bold leading-snug mb-3">{notification?.title}</h3>
          <p className="text-white/65 text-sm whitespace-pre-wrap leading-relaxed">
            {notification?.content}
          </p>
        </div>

        <div className="border-t border-white/10 px-6 py-3 flex justify-end">
          <span className="text-xs text-white/40">{formatDate(notification?.date)}</span>
        </div>
      </div>
    </Modal>
  );
}
