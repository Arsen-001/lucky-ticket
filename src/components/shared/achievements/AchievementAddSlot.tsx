'use client';
import { Plus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';

export interface AchievementAddSlotProps {
  costLs: number;
  onClick?: () => void;
  className?: string;
  size?: number;
}

export function AchievementAddSlot({ costLs, onClick, className, size }: AchievementAddSlotProps) {
  const t = useAppTranslations();

  return (
    <button
      type="button"
      onClick={onClick}
      style={size ? { width: size, height: size } : undefined}
      className={twMerge(
        'add-slot-pulse flex flex-col items-center justify-center gap-0.5 rounded-2xl border border-dashed border-electric-pink/60 bg-electric-pink/10 text-white transition-transform active:scale-95',
        className
      )}
      aria-label={t('add slot')}
    >
      <Plus size={Math.round((size || 64) * 0.3)} className="text-electric-pink" strokeWidth={3} />
      <span className="text-[9px] font-bold uppercase tracking-wider text-electric-pink">
        {costLs} {GlobalConstants.starName}
      </span>
    </button>
  );
}
