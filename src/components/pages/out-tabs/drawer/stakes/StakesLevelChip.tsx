import { Star } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { twMerge } from 'tailwind-merge';
import type { TicketType } from '@/types/types/ticket.types';

export type StakesLevelChipSize = 'sm' | 'md' | 'lg';

export interface StakesLevelChipProps {
  level: number;
  tier: TicketType;
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

export function StakesLevelChip({ level, tier, size = 'md', className }: StakesLevelChipProps) {
  const t = useAppTranslations();

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
