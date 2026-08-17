'use client';

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import type { RouletteSlot } from '@/types/interfaces/roulette.interfaces';
import '@/styles/components/roulette.css';

/** Секторов на колесе. Больше восьми — подписи перестают читаться. */
const SECTORS = 8;
const SECTOR_DEG = 360 / SECTORS;

export interface RouletteWheelProps {
  slots: RouletteSlot[];
  landedKey: string | null;
  spinning: boolean;
  onSettled: () => void;
}

/**
 * Колесо: восемь секторов, стрелка сверху.
 *
 * Восемь — не выбор дизайна, а предел читаемости: в пуле из двадцати восьми
 * призов на колесо попадает выборка, а полный список живёт в «шансах» под
 * барабаном. Выпавший приз всегда среди нарисованных — он подставляется в
 * сектор перед вращением, потому что решение уже принято сервером.
 */
export function RouletteWheel({ slots, landedKey, spinning, onSettled }: RouletteWheelProps) {
  const [face, setFace] = useState<RouletteSlot[]>([]);
  const [angle, setAngle] = useState(0);
  const angleRef = useRef(0);
  // Спин инвалидирует кэш, и `slots` приезжает новым массивом посреди
  // вращения — в зависимостях эффекта это откручивало колесо заново.
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
    // Ровный срез по всему пулу, а не первые восемь: иначе колесо показывало бы
    // одни джекпоты и обещало то, чего в нём почти нет.
    const step = Math.max(1, Math.floor(slots.length / SECTORS));
    setFace(Array.from({ length: SECTORS }, (_, i) => slots[(i * step) % slots.length]));
  }, [slots]);

  useEffect(() => {
    if (!spinning || !landedKey || !face.length) return;

    // Выпавший приз ставим в сектор — тот, где он уже есть, или первый попавшийся.
    const existing = face.findIndex(slot => slot.key === landedKey);
    const target = existing >= 0 ? existing : Math.floor(Math.random() * SECTORS);
    if (existing < 0) {
      const landed = slotsRef.current.find(slot => slot.key === landedKey);
      if (landed) {
        setFace(current => current.map((slot, i) => (i === target ? landed : slot)));
      }
    }

    const need = 360 - (target * SECTOR_DEG + SECTOR_DEG / 2);
    const delta = (need - (angleRef.current % 360) + 360) % 360;
    angleRef.current += 360 * 4 + delta;
    setAngle(angleRef.current);

    const done = setTimeout(() => settleRef.current(), 4500);
    return () => clearTimeout(done);
  }, [spinning, landedKey, face.length]);

  return (
    <div className="relative mx-auto aspect-square w-[248px] max-w-full">
      <span
        aria-hidden
        className="border-t-gold absolute -top-1 left-1/2 z-20 h-0 w-0 -translate-x-1/2 border-x-[8px] border-t-[14px] border-x-transparent drop-shadow"
      />

      <div
        className="roulette-wheel absolute inset-0 rounded-full border-2 border-white/12"
        style={{
          transform: `rotate(${angle}deg)`,
          background:
            'conic-gradient(#2b2545 0deg 45deg, #3a2350 45deg 90deg, #2b2545 90deg 135deg, #3a2350 135deg 180deg, #2b2545 180deg 225deg, #3a2350 225deg 270deg, #2b2545 270deg 315deg, #3a2350 315deg 360deg)',
        }}
      >
        {face.map((slot, index) => {
          const a = index * SECTOR_DEG + SECTOR_DEG / 2;
          return (
            <span
              key={`${slot.key}-${index}`}
              className="absolute left-1/2 top-1/2 -ml-7 -mt-4 flex w-14 flex-col items-center text-center leading-tight"
              style={{ transform: `rotate(${a}deg) translateY(-84px) rotate(${-a}deg)` }}
            >
              <span aria-hidden className="text-xl leading-none">
                {slot.emoji}
              </span>
              <span
                className={twMerge(
                  'line-clamp-2 text-[8px] font-extrabold',
                  slot.rarity === 'EPIC'
                    ? 'text-gold'
                    : slot.rarity === 'RARE'
                      ? 'text-electric-purple'
                      : 'text-white/75'
                )}
              >
                {slot.title}
              </span>
            </span>
          );
        })}
      </div>

      {/* Ступица — не кнопка: жать нужно кнопку под барабаном, одну на все три
          механики, иначе у каждой был бы свой способ начать игру. */}
      <span
        aria-hidden
        className="bg-pink-gradient flex-center absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/15 text-2xl"
      >
        🎰
      </span>
    </div>
  );
}
