'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { tikkiImages } from './tikki.images';
import { TikkiTapPop } from './TikkiTapPop';
import type { TikkiTier } from './tikki.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { triggerHaptic } from '@/utils/global/haptic.utils';
import '@/styles/components/tikki.css';

interface Pop {
  id: number;
  x: number;
  y: number;
  amount: number;
}

export interface TikkiHeroProps {
  tier: TikkiTier;
  /** Сколько уносит одно нажатие прямо сейчас. */
  tapValue: number;
  /** Кликер пуст — нажимать можно, но брать нечего. */
  empty: boolean;
  onTap: () => void;
  className?: string;
  /** Картинка отдельно: на главной Тикки стоит в карточке, а не на сцене. */
  classNames?: { image?: string };
}

/** Сколько цифр держим в воздухе: больше не читается, а рендерятся все. */
const MAX_POPS = 6;

/**
 * Тикки на сцене — главное действие экрана и единственное, ради которого сюда
 * заходят чаще раза в день.
 *
 * Нажатие обрабатывается по `pointerdown`, а не по `click`: на телефоне между
 * касанием и `click` проходит до 300 мс, и при быстрых тапах половина их
 * терялась бы — а тап тут повторяют десятками подряд.
 */
export function TikkiHero({ tier, tapValue, empty, onTap, className, classNames }: TikkiHeroProps) {
  const t = useAppTranslations();
  const [pops, setPops] = useState<Pop[]>([]);
  const [squash, setSquash] = useState(false);
  const popId = useRef(0);
  const squashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (squashTimer.current) clearTimeout(squashTimer.current);
    },
    []
  );

  const handleTap = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      const box = event.currentTarget.getBoundingClientRect();
      const id = ++popId.current;

      if (!empty) {
        triggerHaptic('light');
        setPops(prev => [
          ...prev.slice(-MAX_POPS),
          {
            id,
            x: ((event.clientX - box.left) / box.width) * 100,
            y: ((event.clientY - box.top) / box.height) * 100,
            amount: tapValue,
          },
        ]);
        setTimeout(() => setPops(prev => prev.filter(pop => pop.id !== id)), 800);
      }

      setSquash(true);
      if (squashTimer.current) clearTimeout(squashTimer.current);
      squashTimer.current = setTimeout(() => setSquash(false), 320);

      onTap();
    },
    [empty, tapValue, onTap]
  );

  return (
    <button
      type="button"
      onPointerDown={handleTap}
      aria-label={t('tap tikki')}
      className={twMerge(
        'relative mx-auto block touch-manipulation select-none rounded-3xl',
        'focus-visible:outline-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4',
        className
      )}
    >
      <Image
        src={squash ? tikkiImages[tier].happy : tikkiImages[tier].idle}
        alt=""
        width={232}
        height={252}
        // Тикки — самая крупная картинка первого экрана: ждать ленивой загрузки
        // нечего. `priority` в Next 16 молча ничего не делает, поэтому словами.
        loading="eager"
        fetchPriority="high"
        className={twMerge(
          'mx-auto h-auto w-[62vw] max-w-[248px] object-contain drop-shadow-[0_18px_34px_rgba(0,0,0,0.45)]',
          squash ? 'animate-tikki-squash' : 'animate-tikki-breathe',
          classNames?.image
        )}
      />
      {pops.map(pop => (
        <TikkiTapPop key={pop.id} x={pop.x} y={pop.y} amount={pop.amount} />
      ))}
    </button>
  );
}
