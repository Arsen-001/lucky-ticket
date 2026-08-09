'use client';

import { ChevronRight, Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useJackpotDisplayConfig } from '@/hooks/useJackpotDisplayConfig';
import { routes } from '@/constants/routes';

/**
 * Compact teaser on the tournament detail view: surfaces that part of this
 * tournament's prize pool feeds the single global Jackpot (DOCS §20), and links
 * straight to the jackpot page. The percentage comes from the live server
 * config (admin-editable), never hardcoded.
 */
export function TournamentJackpotNote({ className }: { className?: string }) {
  const t = useAppTranslations();
  const jackpot = useJackpotDisplayConfig();

  return (
    <Link
      href={routes.jackpot}
      className={twMerge(
        'bg-electric-pink/10 border-electric-pink/25 flex items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-transform active:scale-99',
        className
      )}
    >
      <Sparkles className="text-electric-pink h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
      <span className="text-electric-pink flex-1 text-[11px] font-bold leading-none">
        {t('{percent}% of the pool feeds the jackpot', {
          percent: jackpot.accrualPercent,
        })}
      </span>
      <ChevronRight className="text-electric-pink/70 h-3.5 w-3.5 shrink-0" />
    </Link>
  );
}
