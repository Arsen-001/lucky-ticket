import { Lock, Trophy } from 'lucide-react';
import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';

/**
 * Shown instead of the board while the leaderboard master switch is off
 * (`GET /config` → `leaderboardEnabled`, DOCS §16.4). During the closed beta the
 * standings cover a handful of testers, so publishing them would read as the real
 * ranking — the screen says the board opens once the test period ends, and points
 * the player back at the activity that will decide their place.
 */
export function LeaderboardLockedState() {
  const t = useAppTranslations();

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-2">
      <div className="bg-background-overlay flex flex-col items-center gap-3 rounded-2xl border border-white/10 p-6 text-center">
        <div className="bg-electric-purple/20 border-electric-purple/40 flex-center relative h-14 w-14 rounded-full border">
          <Trophy size={26} className="text-electric-purple" strokeWidth={2.2} />
          <span className="flex-center bg-background absolute -bottom-1 -right-1 h-6 w-6 rounded-full border border-white/15">
            <Lock size={12} className="text-white/70" />
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-base font-extrabold text-white">{t('leaderboard locked title')}</h3>
          <p className="text-pink-secondary text-xs leading-snug">
            {t('leaderboard locked description')}
          </p>
        </div>

        <span className="border-electric-purple/40 bg-electric-purple/15 mt-1 rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase leading-none tracking-[0.14em]">
          <span className="from-electric-pink to-electric-purple via-white bg-gradient-to-r bg-clip-text text-transparent">
            {t('coming soon')}
          </span>
        </span>

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
