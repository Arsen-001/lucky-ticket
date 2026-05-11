import { Trophy } from 'lucide-react';
import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';

export function LeaderboardEmptyState() {
  const t = useAppTranslations();
  return (
    <div className="bg-background-overlay flex flex-col items-center gap-3 rounded-2xl border border-white/10 p-6 text-center">
      <div className="bg-electric-pink/20 border-electric-pink/40 flex-center h-14 w-14 rounded-full border">
        <Trophy size={26} className="text-electric-pink" strokeWidth={2.2} />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-extrabold text-white">{t('no activity yet')}</h3>
        <p className="text-pink-secondary text-xs leading-snug">{t('be the first')}</p>
      </div>
      <Link
        href={routes.home}
        className="bg-electric-pink mt-1 inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white"
      >
        {t('play now')}
      </Link>
    </div>
  );
}
