'use client';
import { useState } from 'react';
import { LogOut } from 'lucide-react';
import dayjs from 'dayjs';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { ProfileSupportIds } from '@/components/pages/out-tabs/drawer/profile/ProfileSupportIds';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface ProfileFooterProps {
  isOwn: boolean;
  memberSince: string;
  userId: string;
  onSignOut?: () => void;
}

export function ProfileFooter({ isOwn, memberSince, userId, onSignOut }: ProfileFooterProps) {
  const t = useAppTranslations();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const formattedDate = dayjs(memberSince).format('MMM D, YYYY');

  const handleSignOutConfirm = () => {
    setSignOutOpen(false);
    onSignOut?.();
  };

  return (
    <section className="flex flex-col gap-2.5">
      {isOwn && <ProfileSupportIds userId={userId} />}

      {isOwn && (
        <button
          type="button"
          onClick={() => setSignOutOpen(true)}
          className="text-error/80 hover:text-error border-error/30 bg-error/10 hover:bg-error/15 inline-flex items-center justify-center gap-1.5 self-center rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors"
        >
          <LogOut size={12} strokeWidth={2.6} />
          {t('sign out')}
        </button>
      )}

      <span className="text-center text-[10px] uppercase tracking-wider text-white/30">
        {t('member since', { date: formattedDate })}
      </span>

      <ConfirmModal
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        onConfirm={handleSignOutConfirm}
        title={t('sign out confirm title')}
        content={<p className="text-sm text-white/80">{t('sign out confirm description')}</p>}
        confirmText={t('sign out')}
      />
    </section>
  );
}
