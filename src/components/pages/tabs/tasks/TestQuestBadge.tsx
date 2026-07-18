import { Crown, FlaskConical } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface TestQuestBadgeProps {
  /** Frozen final level (1–31). Crown levels (1–3) render in gold. */
  level: number;
  className?: string;
}

/**
 * Permanent "Тестировщик · N" badge, minted when the test ends. Crown levels
 * (1–3) get the gold Genesis treatment; everything else the pink-purple seal.
 * Never issued again after the test — the founder mark.
 */
export function TestQuestBadge({ level, className }: TestQuestBadgeProps) {
  const t = useAppTranslations();
  const isCrown = level <= 3;
  const Icon = isCrown ? Crown : FlaskConical;

  return (
    <div
      className={twMerge(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-md shadow-black/30',
        isCrown
          ? 'border-gold/50 bg-gradient-to-br from-gold/25 to-orange/15'
          : 'border-electric-pink/40 bg-gradient-to-br from-electric-pink/20 to-electric-purple/15',
        className
      )}
    >
      <span
        className={twMerge(
          'flex-center h-6 w-6 rounded-full bg-gradient-to-br',
          isCrown ? 'from-warning to-gold' : 'from-electric-pink to-electric-purple'
        )}
      >
        <Icon size={13} className="text-white" />
      </span>
      <div className="flex flex-col leading-none">
        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/60">
          {t('tester')}
        </span>
        <span
          className={twMerge(
            'text-sm font-extrabold tabular-nums',
            isCrown ? 'text-gold' : 'text-white'
          )}
        >
          {t('level')} {level}
        </span>
      </div>
    </div>
  );
}
