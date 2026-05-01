'use client';

import { twMerge } from 'tailwind-merge';
import { Star } from 'lucide-react';
import type { TicketType } from '@/types/types/ticket.types';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface EngineLevelBadgeProps {
  level: number;
  tier: TicketType;
  className?: string;
}

const TIER_GLOW: Record<TicketType, string> = {
  bronze: '#E08A3A',
  silver: '#D8D8D8',
  gold: '#FFD56A',
  platinum: '#E2E0D0',
  diamond: '#3FD9CF',
};

export function EngineLevelBadge({ level, tier, className }: EngineLevelBadgeProps) {
  const t = useAppTranslations();
  const glow = TIER_GLOW[tier];

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
