'use client';

import { ChevronRight, UserPlus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { routes } from '@/constants/routes';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';

export function HomeInviteCard({ className }: ClassNameProps) {
  const t = useAppTranslations();

  return (
    <div className={twMerge('px-4', className)}>
      <Link
        href={routes.inviteFriends}
        className="bg-pink-gradient relative flex items-center gap-3 overflow-hidden rounded-2xl p-4 transition-transform active:scale-99"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/15 blur-md"
        />
        <div className="bg-white/20 flex-center relative h-11 w-11 flex-shrink-0 rounded-xl">
          <UserPlus className="text-white" size={22} strokeWidth={2.2} />
        </div>
        <div className="relative flex min-w-0 flex-1 flex-col">
          <span className="text-sm font-bold text-white">{t('invite friends')}</span>
          <span className="text-xs text-white/85">
            {t('earn percent from referrals', {
              percent: GlobalConstants.referralPercentage,
            })}
          </span>
        </div>
        <span className="text-electric-pink relative inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold tracking-wide">
          {t('invite')}
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
      </Link>
    </div>
  );
}
