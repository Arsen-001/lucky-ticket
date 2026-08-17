'use client';

import { EyeOff } from 'lucide-react';
import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';

/**
 * Shown in place of an informational page an admin switched off from the panel
 * (`GET /config` → `pages`). The drawer entry is already gone by then, so the
 * only way here is a deep link, a bookmark or a tab that was open when the
 * switch flipped — all of which must land on an explanation rather than on an
 * empty screen or a retry button that can never succeed.
 *
 * Deliberately not the "coming soon" lock the leaderboard uses: that copy
 * promises a release, and a document that was taken down may simply be gone.
 * The page's own name is already in the header above this card.
 */
export function PageDisabledState() {
  const t = useAppTranslations();

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-2">
      <div className="bg-background-overlay flex flex-col items-center gap-3 rounded-2xl border border-white/10 p-6 text-center">
        <div className="flex-center h-14 w-14 rounded-full border border-white/15 bg-white/5">
          <EyeOff size={24} className="text-white/70" strokeWidth={2.2} />
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-base font-extrabold text-white">{t('page switched off')}</h3>
          <p className="text-pink-secondary text-xs leading-snug">
            {t('page switched off description')}
          </p>
        </div>

        <Link
          href={routes.home}
          className="bg-electric-pink tap-target relative mt-1 inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white"
        >
          {t('play now')}
        </Link>
      </div>
    </div>
  );
}
