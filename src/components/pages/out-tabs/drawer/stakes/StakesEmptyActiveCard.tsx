'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TicketType } from '@/types/types/ticket.types';

const TIERS: TicketType[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

export function StakesEmptyActiveCard() {
  const t = useAppTranslations();

  return (
    <Link
      href={routes.stakes.new}
      className="flex flex-col items-center rounded-2xl border border-dashed border-purple-secondary/40 bg-electric-purple/10 px-5 py-6 text-center transition-transform active:scale-99"
    >
      <div className="bg-electric-purple/25 border-electric-purple/40 mb-2.5 flex h-12 w-12 items-center justify-center rounded-full border">
        <Lock size={20} className="text-electric-purple" />
      </div>
      <div className="text-sm font-extrabold text-white">{t('no active stakes')}</div>
      {/* This used to read "Lock LC for 3 HOURS to earn guaranteed TICKETS" —
          copy from a mechanic that no longer exists. A stake runs 1–12 months
          and pays LC yield, Activity Points and Lucky Stars; no tickets, no
          hours. It is also the first thing a brand-new player reads about
          staking, since it only shows when there is nothing else on the screen. */}
      <p className="text-white-secondary mt-1 text-[11px] leading-relaxed">
        {t('lock LC to earn description')}
      </p>
      <div className="mt-3 flex items-center gap-1">
        {TIERS.map(tier => (
          <span
            key={tier}
            className="h-1.5 w-6 rounded-full"
            style={{ background: `var(--color-${tier})` }}
            aria-hidden
          />
        ))}
      </div>
      <span className="bg-pink-gradient mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-wider text-white">
        {t('start a stake')} →
      </span>
    </Link>
  );
}
