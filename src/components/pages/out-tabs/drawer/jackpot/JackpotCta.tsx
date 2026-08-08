'use client';

import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import '@/styles/components/jackpot.css';

/**
 * The one action the page exists for, pinned to the bottom of the scrollport.
 * Before, the way into a tournament was a small button inside a card that left
 * the screen as soon as the player scrolled to the drops — the page could be
 * read end to end with nothing to press.
 */
export function JackpotCta() {
  const t = useAppTranslations();

  return (
    <div className="jackpot-cta sticky bottom-0 z-10 -mx-5 mt-2 px-5 pb-2 pt-9">
      <Link
        href={routes.tournaments.index}
        className="bg-pink-gradient flex-center rounded-xl px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-transform active:scale-[0.98]"
      >
        {t('play')}
      </Link>
    </div>
  );
}
