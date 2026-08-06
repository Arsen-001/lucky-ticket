'use client';

import { twMerge } from 'tailwind-merge';
import { Star } from 'lucide-react';
import type { TicketType } from '@/types/types/ticket.types';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { tierAccentColors } from '@/constants/tier-colors';

export interface EngineLevelBadgeProps {
  level: number;
  tier: TicketType;
  className?: string;
}

export function EngineLevelBadge({ level, tier, className }: EngineLevelBadgeProps) {
  const t = useAppTranslations();
  const glow = tierAccentColors[tier];

  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white',
        className
      )}
      style={{
        background: `linear-gradient(90deg, ${glow}33, ${glow}11)`,
        border: `1px solid ${glow}66`,
        boxShadow: `0 0 8px ${glow}33`,
      }}
    >
      <Star size={10} fill={glow} stroke={glow} />
      <span className="mt-0.5 font-bold">{t('lv {level}', { level })}</span>
    </span>
  );
}
