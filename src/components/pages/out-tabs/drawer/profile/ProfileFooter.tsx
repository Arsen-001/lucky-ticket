'use client';
import dayjs from 'dayjs';
import { ProfileSupportIds } from '@/components/pages/out-tabs/drawer/profile/ProfileSupportIds';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { englishMonthKey } from '@/lib/dayjs/locale';
import type { MessageIds } from '@/types/types/i18n.types';

export interface ProfileFooterProps {
  isOwn: boolean;
  memberSince: string;
  userId: string;
}

export function ProfileFooter({ isOwn, memberSince, userId }: ProfileFooterProps) {
  const t = useAppTranslations();

  const memberDate = dayjs(memberSince);
  // English on purpose — this is the translation key, not the visible month.
  const monthKey = englishMonthKey(memberDate) as MessageIds;
  const formattedDate = `${memberDate.format('DD')} ${t(monthKey)} ${memberDate.format('YYYY')}`;

  return (
    <section className="flex flex-col gap-2.5">
      {isOwn && <ProfileSupportIds userId={userId} />}

      <span className="text-center text-[10px] uppercase tracking-wider text-white/30">
        {t('member since', { date: formattedDate })}
      </span>
    </section>
  );
}
