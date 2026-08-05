'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import dayjs from 'dayjs';
import { useLogoutMutation } from '@/api/auth.api';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { ProfileSupportIds } from '@/components/pages/out-tabs/drawer/profile/ProfileSupportIds';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { englishMonthKey } from '@/lib/dayjs/locale';
import { routes } from '@/constants/routes';
import type { MessageIds } from '@/types/types/i18n.types';

export interface ProfileFooterProps {
  isOwn: boolean;
  memberSince: string;
  userId: string;
}

export function ProfileFooter({ isOwn, memberSince, userId }: ProfileFooterProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const [logout] = useLogoutMutation();
  const [signOutOpen, setSignOutOpen] = useState(false);

  const memberDate = dayjs(memberSince);
  // English on purpose — this is the translation key, not the visible month.
  const monthKey = englishMonthKey(memberDate) as MessageIds;
  const formattedDate = `${memberDate.format('DD')} ${t(monthKey)} ${memberDate.format('YYYY')}`;

  const handleSignOutConfirm = async () => {
    try {
      await logout().unwrap();
    } catch {
      // logout still clears local tokens in the mutation's onQueryStarted
    } finally {
      setSignOutOpen(false);
      router.push(routes.login);
    }
  };

  return (
    <section className="flex flex-col gap-2.5">
      {isOwn && <ProfileSupportIds userId={userId} />}

      {isOwn && (
        <button
          type="button"
          onClick={() => setSignOutOpen(true)}
          className="text-error-text/80 hover:text-error-text border-error/30 bg-error/10 hover:bg-error/15 inline-flex items-center justify-center gap-1.5 self-center rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors"
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
