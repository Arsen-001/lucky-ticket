'use client';

import Link from 'next/link';
import { Send, Sparkles, Trophy } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { routes } from '@/constants/routes';

export interface PromoSourceRowProps {
  className?: string;
}

const CELL =
  'flex min-h-13 flex-1 items-center justify-center gap-1.5 px-1 text-[11px] font-extrabold uppercase tracking-wide transition-colors hover:bg-white/4';

/**
 * Where the rewards come from, as the card's own footer — the same three-cell
 * strip `/lc` puts under its balance. The channel is first because it is the
 * only one of the three that hands out codes.
 */
export function PromoSourceRow({ className }: PromoSourceRowProps) {
  const t = useAppTranslations();

  return (
    <div
      className={twMerge(
        'relative flex divide-x divide-white/8 border-t border-white/8',
        className
      )}
    >
      <a
        href={GlobalConstants.telegramChannelUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={CELL}
      >
        <Send size={15} strokeWidth={2.5} className="text-telegram flex-shrink-0" />
        <span className="truncate text-white/85">{t('channel')}</span>
      </a>
      <Link href={routes.tasks} className={CELL}>
        <Sparkles size={15} strokeWidth={2.5} className="text-gold flex-shrink-0" />
        <span className="truncate text-white/85">{t('tasks')}</span>
      </Link>
      <Link href={routes.tournaments.index} className={CELL}>
        <Trophy size={15} strokeWidth={2.5} className="text-gold flex-shrink-0" />
        <span className="truncate text-white/85">{t('tournaments')}</span>
      </Link>
    </div>
  );
}
