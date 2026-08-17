'use client';

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { RoulettePrizeTile } from './RoulettePrizeTile';
import type { RouletteSlot } from '@/types/interfaces/roulette.interfaces';
import '@/styles/components/roulette.css';

/** Восемь ячеек по периметру 3×3, по часовой стрелке. Центр — не приз. */
const RING = [0, 1, 2, 5, 8, 7, 6, 3];

export interface RouletteGridProps {
  slots: RouletteSlot[];
  landedKey: string | null;
  spinning: boolean;
  onSettled: () => void;
}

/**
 * Поле: огонёк бежит по восьми призам и замедляется на выпавшем.
 *
 * Самый компактный барабан из трёх и единственный, где все нарисованные призы
 * видно и до спина, и в момент остановки. Как и у остальных — приз известен
 * заранее, бег огонька лишь доводит до него.
 */
export function RouletteGrid({ slots, landedKey, spinning, onSettled }: RouletteGridProps) {
  const [face, setFace] = useState<RouletteSlot[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [hit, setHit] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Тот же приём, что у ленты и колеса: рефетч после спина не должен запускать
  // бег огонька заново.
  const slotsRef = useRef(slots);
  const settleRef = useRef(onSettled);
  // Синхронизация в эффекте, а не в теле: писать в ref во время рендера
  // запрещено React Compiler'ом. Этот эффект объявлен ПЕРВЫМ, поэтому к моменту
  // запуска анимации ниже обе ссылки уже свежие.
  useEffect(() => {
    slotsRef.current = slots;
    settleRef.current = onSettled;
  });

  useEffect(() => {
    if (!slots.length) return;
    const step = Math.max(1, Math.floor(slots.length / RING.length));
    setFace(Array.from({ length: RING.length }, (_, i) => slots[(i * step) % slots.length]));
  }, [slots]);

  useEffect(() => {
    if (!spinning || !landedKey || !face.length) return;

    const existing = face.findIndex(slot => slot.key === landedKey);
    const target = existing >= 0 ? existing : Math.floor(Math.random() * RING.length);
    if (existing < 0) {
      const landed = slotsRef.current.find(slot => slot.key === landedKey);
      if (landed) setFace(current => current.map((slot, i) => (i === target ? landed : slot)));
    }

    setHit(null);
    const total = RING.length * 3 + target + 1;
    let step = 0;
    let delay = 70;

    const tick = () => {
      setLit(step % RING.length);
      step += 1;

      if (step >= total) {
        setLit(null);
        setHit(target);
        settleRef.current();
        return;
      }
      // Последняя треть ползёт — там и живёт напряжение.
      if (step > total * 0.62) delay += 26;
      timer.current = setTimeout(tick, delay);
    };

    tick();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [spinning, landedKey, face.length]);

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-1.5">
      {Array.from({ length: 9 }, (_, cell) => {
        if (cell === 4) {
          return (
            <span
              key="hub"
              aria-hidden
              className="bg-pink-gradient flex-center flex-col rounded-xl text-[10px] font-extrabold text-white"
            >
              <span className="text-lg leading-none">🎰</span>
            </span>
          );
        }
        const index = RING.indexOf(cell);
        const slot = face[index];
        if (!slot) return <span key={cell} className="rounded-xl bg-white/5" />;

        return (
          <RoulettePrizeTile
            key={`${slot.key}-${cell}`}
            emoji={slot.emoji}
            title={slot.title}
            rarity={slot.rarity}
            size="sm"
            hit={hit === index}
            className={twMerge(
              'h-auto w-auto py-2',
              lit === index && 'border-electric-pink bg-electric-pink/25 scale-105'
            )}
          />
        );
      })}
    </div>
  );
}
