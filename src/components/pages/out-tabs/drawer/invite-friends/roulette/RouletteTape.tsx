'use client';

import { useEffect, useRef, useState } from 'react';
import { RoulettePrizeTile } from './RoulettePrizeTile';
import type { RouletteSlot } from '@/types/interfaces/roulette.interfaces';
import '@/styles/components/roulette.css';

/** На какой карточке ленты останавливаемся. Дальше — запас, чтобы не кончилась. */
const LANDING = 34;
const TAPE_LENGTH = 46;
/** Столько же, сколько длится переход в roulette.css. */
const SPIN_MS = 4600;

export interface RouletteTapeProps {
  slots: RouletteSlot[];
  /** Ключ выпавшего приза. Пока null — лента стоит. */
  landedKey: string | null;
  /** Крутится прямо сейчас. */
  spinning: boolean;
  /** Анимация доехала — экран показывает приз. */
  onSettled: () => void;
}

/**
 * Лента: призы едут мимо метки и замедляются на выпавшем.
 *
 * Приз известен ДО начала движения — он приходит с сервера, лента лишь
 * доигрывает до него. Поэтому целевая карточка подставляется в позицию
 * `LANDING` перед стартом, а не выбирается по месту остановки: обратный порядок
 * означал бы, что исход решает браузер.
 *
 * Разгон разбит на две фазы (`armed` → `running`) по одной причине: позиция
 * остановки измеряется по РЕАЛЬНОЙ карточке, а измерить её можно только после
 * того, как React её отрисовал. Попытка сделать это в том же кадре, что и
 * заполнение ленты, читает ещё пустой список — и лента просто не трогается с
 * места, что и происходило, пока фаза была одна.
 */
export function RouletteTape({ slots, landedKey, spinning, onSettled }: RouletteTapeProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const tapeRef = useRef<HTMLDivElement>(null);
  // Спин инвалидирует кэш, и `slots` приезжает НОВЫМ массивом посреди
  // анимации. В зависимостях эффекта это перезапускало прокрутку с нуля —
  // лента дёргалась в начало и ехала второй раз.
  const slotsRef = useRef(slots);
  const settleRef = useRef(onSettled);
  // Синхронизация в эффекте, а не в теле: писать в ref во время рендера
  // запрещено React Compiler'ом. Этот эффект объявлен ПЕРВЫМ, поэтому к моменту
  // запуска анимации ниже обе ссылки уже свежие.
  useEffect(() => {
    slotsRef.current = slots;
    settleRef.current = onSettled;
  });

  const [tape, setTape] = useState<RouletteSlot[]>([]);
  const [offset, setOffset] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'armed' | 'running'>('idle');

  // Лента до первого спина: просто набор призов, чтобы блок не выглядел пустым.
  // Заполняется один раз — после спина `slots` приезжает новым массивом, и
  // пересборка здесь сбрасывала бы уже остановленную ленту.
  useEffect(() => {
    if (!slots.length) return;
    setTape(current =>
      current.length ? current : Array.from({ length: 12 }, (_, i) => slots[i % slots.length])
    );
  }, [slots]);

  // Фаза 1 — зарядить ленту: выпавший приз встаёт на позицию LANDING.
  useEffect(() => {
    const pool = slotsRef.current;
    if (!spinning || !landedKey || !pool.length) return;

    const landed = pool.find(slot => slot.key === landedKey) ?? pool[0];
    setTape(
      Array.from({ length: TAPE_LENGTH }, (_, i) =>
        i === LANDING ? landed : pool[Math.floor(Math.random() * pool.length)]
      )
    );
    setOffset(0);
    setPhase('armed');
  }, [spinning, landedKey]);

  /**
   * Фаза 2 — поехали. Запускается только когда лента уже в DOM.
   *
   * Таймер, а не `requestAnimationFrame`: в фоновой вкладке кадры не идут
   * вовсе, и спин, начатый до сворачивания приложения, так и оставался бы на
   * нуле — лента стоит, кнопка заблокирована, приз не показан. Задержки хватает
   * ровно чтобы браузер увидел стартовое положение отдельно от конечного.
   */
  useEffect(() => {
    if (phase !== 'armed' || tape.length !== TAPE_LENGTH) return;

    const frame = window.setTimeout(() => {
      const viewport = viewportRef.current;
      const target = tapeRef.current?.children[LANDING] as HTMLElement | undefined;
      if (!viewport || !target) return;

      // Небольшой разброс внутри карточки: остановка ровно по центру каждый раз
      // выглядит подстроенной — потому что она и есть подстроенная.
      const jitter = (Math.random() - 0.5) * (target.offsetWidth * 0.35);
      setPhase('running');
      setOffset(target.offsetLeft + target.offsetWidth / 2 - viewport.clientWidth / 2 + jitter);
    }, 32);

    return () => window.clearTimeout(frame);
  }, [phase, tape.length]);

  // Доехали. Таймер живёт отдельно от запуска, чтобы отсчёт начинался с момента,
  // когда лента реально тронулась, а не когда её только собрали.
  useEffect(() => {
    if (phase !== 'running') return;
    const done = setTimeout(() => {
      setPhase('idle');
      settleRef.current();
    }, SPIN_MS + 100);
    return () => clearTimeout(done);
  }, [phase]);

  return (
    <div
      ref={viewportRef}
      className="relative overflow-hidden rounded-xl border border-white/8 bg-black/25 py-3"
      style={{
        maskImage: 'linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)',
      }}
    >
      <span
        aria-hidden
        className="from-gold/90 pointer-events-none absolute inset-y-0 left-1/2 z-10 w-0.5 -translate-x-1/2 bg-gradient-to-b to-transparent"
      />

      <div
        ref={tapeRef}
        className={`roulette-tape ${phase === 'running' ? 'roulette-tape--spinning' : ''}`}
        style={{ transform: `translateX(${-offset}px)` }}
      >
        {tape.map((slot, index) => (
          <RoulettePrizeTile
            key={`${slot.key}-${index}`}
            emoji={slot.emoji}
            title={slot.title}
            rarity={slot.rarity}
            hit={!spinning && index === LANDING && tape.length === TAPE_LENGTH}
          />
        ))}
      </div>
    </div>
  );
}
