'use client';

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { EngineIcon } from '@/components/shared/icons/EngineIcon';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { TicketRewardIcon } from '@/components/shared/icons/TicketRewardIcon';
import { tierTicketNameId } from '@/constants/tier-names';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { staggerMs } from '@/utils/global/animation.utils';
import { formatNumber } from '@/utils/global/number.utils';

/** Currencies a Test-Quest level can pay — one row each. */
export type TestQuestGrantKind = 'lc' | 'ticket' | 'star' | 'ap' | 'lp' | 'engine';

export interface TestQuestClaimRewardRowProps {
  kind: TestQuestGrantKind;
  /** How much of it — LP counts days, everything else counts units. */
  amount: number;
  /** Position in the list, for the entry stagger. */
  index?: number;
  /** Second line under the name — the term an LP grant now runs to. */
  note?: string;
  className?: string;
}

/** Tile tint per currency, so a row is recognisable before it is read. */
const TINT: Record<TestQuestGrantKind, string> = {
  lc: 'bg-gold/15',
  ticket: 'bg-teal/15',
  star: 'bg-electric-purple/15',
  ap: 'bg-pink/15',
  lp: 'bg-electric-pink/15',
  engine: 'bg-diamond/15',
};

/**
 * One line of "what you just got": the currency's own mark, its name, and the
 * amount.
 *
 * The mark is the whole point of the row — a level pays LC, Bronze tickets,
 * Lucky Stars, Lucky-Player days and (once) an engine, and the burst that used
 * to be the only feedback named none of them.
 */
export function TestQuestClaimRewardRow({
  kind,
  amount,
  index = 0,
  note,
  className,
}: TestQuestClaimRewardRowProps) {
  const t = useAppTranslations();

  const icon: Record<TestQuestGrantKind, ReactNode> = {
    lc: <CoinIcon size={22} />,
    // Every Test-Quest level credits its tickets to Bronze
    // (`test-quest.service`), so the row shows that exact ticket. Not
    // interactive: the modal's own tap target is the Continue button.
    ticket: <TicketRewardIcon tier="bronze" size={16} interactive={false} />,
    star: <TelegramStarIcon size={20} />,
    ap: <BoltIcon size={26} />,
    lp: <LuckyPlayerIcon size={24} />,
    engine: <EngineIcon tier="bronze" size={26} />,
  };

  const name: Record<TestQuestGrantKind, string> = {
    lc: GlobalConstants.coinName,
    ticket: t(tierTicketNameId.bronze),
    star: t('stars wallet'),
    ap: t('activity points'),
    lp: t('lucky player'),
    engine: t('bronze engine'),
  };

  // LP is paid in days, not in units of itself — "+2" beside "Lucky Player"
  // would read as two subscriptions.
  const value = kind === 'lp' ? t('+{days} days', { days: amount }) : `+${formatNumber(amount)}`;

  return (
    <div
      className={twMerge(
        'animate-slide-in-bottom flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-2.5 py-2',
        className
      )}
      style={{ animationDelay: `${staggerMs(index, 100)}ms` }}
    >
      <span className={twMerge('flex-center h-9 w-9 shrink-0 rounded-lg', TINT[kind])}>
        {icon[kind]}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] font-semibold text-white">{name[kind]}</span>
        {/* Lucky-Player days are the one reward with an end: the number alone
            says how many were added, not what the player now holds. */}
        {note && <span className="truncate text-[10.5px] text-white/50">{note}</span>}
      </span>
      <span className="shrink-0 text-[15px] font-extrabold tabular-nums text-white">{value}</span>
    </div>
  );
}
