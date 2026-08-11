import { Star } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { twMerge } from 'tailwind-merge';
import type { StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

export type StakesLevelChipSize = 'sm' | 'md' | 'lg';

export interface StakesLevelChipProps {
  /** Band number, or `0`/`null` band for a deposit that cleared none. */
  level: number;
  tier: TicketType | null;
  size?: StakesLevelChipSize;
  className?: string;
}

const tierColorClass: Record<TicketType, string> = {
  bronze: 'text-bronze border-bronze/40 bg-bronze/15',
  silver: 'text-silver border-silver/40 bg-silver/15',
  gold: 'text-gold border-gold/40 bg-gold/15',
  platinum: 'text-platinum border-platinum/40 bg-platinum/15',
  diamond: 'text-diamond border-diamond/40 bg-diamond/15',
};

const sizeClass: Record<StakesLevelChipSize, string> = {
  sm: 'px-2 py-0.5 text-[9px]',
  md: 'px-2 py-0.5 text-[10px]',
  lg: 'px-2.5 py-1 text-[11px]',
};

const iconSize: Record<StakesLevelChipSize, number> = {
  sm: 9,
  md: 10,
  lg: 12,
};

/**
 * The accent a stake card paints itself with — its band's tier colour, or a
 * neutral purple when the deposit cleared no band. Every stake surface reads
 * this so a bandless stake looks deliberate instead of borrowing bronze.
 */
export const stakeAccent = (levelDef: StakeLevelDefinition | null) =>
  levelDef ? `var(--color-${levelDef.tier})` : 'var(--color-electric-purple)';

export function StakesLevelChip({ level, tier, size = 'md', className }: StakesLevelChipProps) {
  const t = useAppTranslations();

  // A stake below the cheapest band is a stake, not an error: it says "no
  // level" rather than disappearing or claiming a band it never reached.
  if (!tier || level <= 0) {
    return (
      <span
        className={twMerge(
          'inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 font-extrabold uppercase tracking-wider text-white/50',
          sizeClass[size],
          className
        )}
      >
        {t('no level')}
      </span>
    );
  }

  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1 rounded-full border font-extrabold uppercase tracking-wider',
        tierColorClass[tier],
        sizeClass[size],
        className
      )}
    >
      <Star size={iconSize[size]} fill="currentColor" strokeWidth={0} />
      {t('level {level}', { level })}
    </span>
  );
}
