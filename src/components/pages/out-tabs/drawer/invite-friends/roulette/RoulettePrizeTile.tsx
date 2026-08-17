'use client';

import { twMerge } from 'tailwind-merge';
import type { RouletteRarity } from '@/types/interfaces/roulette.interfaces';

export type RoulettePrizeTileSize = 'sm' | 'md';

export interface RoulettePrizeTileProps {
  emoji: string;
  title: string;
  rarity: RouletteRarity;
  size?: RoulettePrizeTileSize;
  /** Выпавший приз — подсвечен и один раз дёргается. */
  hit?: boolean;
  className?: string;
}

const rarityClasses: Record<RouletteRarity, string> = {
  COMMON: 'border-white/10 bg-white/5',
  RARE: 'border-electric-purple/45 bg-electric-purple/10',
  EPIC: 'border-gold/55 bg-gold/10',
};

const rarityText: Record<RouletteRarity, string> = {
  COMMON: 'text-white/70',
  RARE: 'text-electric-purple',
  EPIC: 'text-gold',
};

const sizeClasses: Record<RoulettePrizeTileSize, string> = {
  sm: 'h-[68px] w-[62px] gap-0.5 rounded-lg',
  md: 'h-[78px] w-[68px] gap-1 rounded-xl',
};

/**
 * Один приз в барабане — общая плитка для ленты и поля.
 *
 * Редкость несёт рамка, а не подпись: на 62 пикселях слово «легендарный» не
 * помещается, а разница между обычным и джекпотом должна читаться за то время,
 * пока лента едет мимо.
 */
export function RoulettePrizeTile({
  emoji,
  title,
  rarity,
  size = 'md',
  hit = false,
  className,
}: RoulettePrizeTileProps) {
  return (
    <div
      className={twMerge(
        'flex flex-shrink-0 flex-col items-center justify-center border text-center transition-colors',
        sizeClasses[size],
        rarityClasses[rarity],
        hit && 'roulette-hit border-gold bg-gold/20',
        className
      )}
    >
      <span
        aria-hidden
        className={size === 'sm' ? 'text-xl leading-none' : 'text-2xl leading-none'}
      >
        {emoji}
      </span>
      <span
        className={twMerge(
          'line-clamp-2 px-1 text-[8.5px] font-extrabold leading-tight',
          rarityText[rarity]
        )}
      >
        {title}
      </span>
    </div>
  );
}
