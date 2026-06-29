'use client';

import { ChevronRight, Sparkles } from 'lucide-react';
import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';

/**
 * Compact, unmistakable entry to the jackpot page at the top of Home. Kept
 * deliberately small (no live pot number) so it reads as a clear button, not a
 * banner — the live odometer lives on the jackpot page itself.
 */
export function HomeJackpotButton() {
  const t = useAppTranslations();

  return (
    <div className="px-4">
      <Link
        href={routes.jackpot}
        className="bg-electric-pink/15 border-electric-pink/30 inline-flex items-center gap-2 rounded-full border py-1.5 pl-2 pr-3 transition-transform active:scale-95"
      >
        <span className="bg-electric-pink/25 text-electric-pink flex-center h-6 w-6 rounded-full">
          <Sparkles size={13} strokeWidth={2.8} />
        </span>
        <span className="text-sm font-extrabold text-white">{t('jackpot')}</span>
        <ChevronRight size={14} className="text-electric-pink -mr-0.5" />
      </Link>
    </div>
  );
}
