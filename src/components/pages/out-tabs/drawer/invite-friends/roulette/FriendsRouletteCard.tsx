'use client';

import { useState } from 'react';
import { Info, Lock } from 'lucide-react';
import { useGetRouletteQuery, useSpinRouletteMutation } from '@/api/roulette.api';
import { Button } from '@/components/shared/buttons/Button';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { RouletteGrid } from './RouletteGrid';
import { RouletteOddsModal } from './RouletteOddsModal';
import { RoulettePrizeModal } from './RoulettePrizeModal';
import { RouletteTape } from './RouletteTape';
import { RouletteWheel } from './RouletteWheel';
import type { RoulettePrize } from '@/types/interfaces/roulette.interfaces';
import '@/styles/components/roulette.css';

/**
 * «Рулетка за друзей» на экране приглашений.
 *
 * Три правила, которые держат этот компонент честным:
 *
 *  1. **Приз выбирает сервер.** `spin()` возвращает уже выданный приз; барабан
 *     доигрывает до него. Ни одна из трёх механик не решает исход.
 *  2. **Барабан выбирает панель.** `state.style` приходит с сервера, поэтому
 *     колесо, ленту и поле можно переключать без деплоя.
 *  3. **`available: false` — не рисуем ничего.** Игра выключена, или игрок уже
 *     забрал подарок на «скоро», или сессии нет: для экрана это один и тот же
 *     ответ, и блока просто не существует.
 */
export function FriendsRouletteCard() {
  const t = useAppTranslations();
  const toast = useToast();
  const { data, isLoading } = useGetRouletteQuery();
  const [spinRoulette, { isLoading: spinning }] = useSpinRouletteMutation();

  // Приз держим локально: он должен показаться ПОСЛЕ анимации, а не в момент
  // ответа сервера — иначе барабан крутится уже после того, как всё сказано.
  const [pending, setPending] = useState<RoulettePrize | null>(null);
  const [revealed, setRevealed] = useState<RoulettePrize | null>(null);
  const [oddsOpen, setOddsOpen] = useState(false);

  if (isLoading) {
    return <Skeleton variant="rounded-rectangle" className="h-52 w-full rounded-2xl" />;
  }
  if (!data?.available) return null;

  const spin = async () => {
    if (spinning || pending) return;
    try {
      const result = await spinRoulette().unwrap();
      setPending(result.prize);
    } catch {
      toast.error(t('roulette spin failed'));
    }
  };

  // Анимация доехала — только теперь показываем, что выпало.
  const settle = () => {
    if (!pending) return;
    setRevealed(pending);
    setPending(null);
  };

  const barrel = {
    slots: data.slots,
    landedKey: pending?.slotKey ?? null,
    spinning: !!pending,
    onSettled: settle,
  };

  const caption = (() => {
    if (pending) return t('roulette spinning');
    if (data.spinsAvailable > 0) return t('roulette ready', { count: data.spinsAvailable });
    if (data.blockedBy === 'budget') return t('roulette closed today');
    if (data.blockedBy === 'limit') return t('roulette closed today');
    if (data.friendsToNextSpin > 0)
      return t('roulette need friends', { count: data.friendsToNextSpin });
    return t('roulette no spins');
  })();

  const progress = Math.min(
    100,
    Math.round(
      ((data.friendsPerSpin - data.friendsToNextSpin) / Math.max(1, data.friendsPerSpin)) * 100
    )
  );

  return (
    <section
      className="shine-card relative overflow-hidden rounded-2xl p-3"
      style={{ ['--shine-card-accent' as string]: 'var(--color-gold)' }}
      data-tour="roulette"
    >
      <div className="relative mb-2.5 flex items-center gap-2">
        <div className="bg-gold/15 ring-gold/30 flex-center h-9 w-9 flex-shrink-0 rounded-xl text-lg ring-1">
          🎰
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-sm font-extrabold leading-tight text-white">{t('roulette title')}</h2>
          <p className="text-pink-secondary truncate text-[11px]">
            {t('roulette subtitle', { count: data.friendsPerSpin })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOddsOpen(true)}
          aria-label={t('roulette odds title')}
          className="tap-target relative flex-center h-8 w-8 flex-shrink-0 rounded-lg bg-white/8 text-white/70"
        >
          <Info size={15} />
        </button>
      </div>

      <div className="relative">
        {data.style === 'WHEEL' ? (
          <RouletteWheel {...barrel} />
        ) : data.style === 'GRID' ? (
          <RouletteGrid {...barrel} />
        ) : (
          <RouletteTape {...barrel} />
        )}
      </div>

      {/* Прогресс к следующему спину — только когда спина нет. Полоса «10 из 10»
          рядом с готовой кнопкой не говорит ничего, чего не говорит кнопка. */}
      {data.spinsAvailable === 0 && data.friendsToNextSpin > 0 && (
        <div className="relative mt-2.5 flex flex-col gap-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className="bg-pink-gradient h-full rounded-full transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-white-secondary text-[10px] font-semibold tabular-nums">
            {t('roulette friends progress', {
              have: data.friends,
              need: data.friends + data.friendsToNextSpin,
            })}
          </span>
        </div>
      )}

      <div className="relative mt-2.5 flex flex-col gap-1.5">
        <Button
          variant="primary"
          disabled={!data.canSpin || spinning || !!pending}
          loading={spinning}
          onClick={spin}
          className={`bg-pink-gradient tap-target relative h-10 w-full rounded-lg text-xs font-extrabold ${
            data.canSpin && !pending ? 'roulette-ready' : ''
          }`}
        >
          {data.canSpin ? (
            t('roulette spin')
          ) : (
            <span className="flex items-center gap-1.5">
              <Lock size={13} />
              {t('roulette locked')}
            </span>
          )}
        </Button>
        <p className="text-white-secondary text-center text-[10px] leading-snug">{caption}</p>
      </div>

      {/* Последние выигрыши: доказательство, что призы существуют — и место, где
          подарок Telegram честно висит «ждёт отправки», пока его не отправят.
          Во время анимации скрыто: рефетч приносит свежий выигрыш раньше, чем
          барабан доедет, и список проговаривал приз до того, как он выпал. */}
      {!pending && data.history.length > 0 && (
        <div className="relative mt-2.5 flex flex-col gap-1 border-t border-white/8 pt-2">
          <span className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
            {t('roulette history')}
          </span>
          {data.history.slice(0, 3).map(prize => (
            <div key={prize.id} className="flex items-center gap-2">
              <span aria-hidden className="text-sm leading-none">
                {prize.emoji}
              </span>
              <span className="flex-1 truncate text-[11px] font-semibold text-white/85">
                {prize.title}
              </span>
              <span
                className={
                  prize.status === 'PENDING'
                    ? 'text-warning text-[10px] font-bold'
                    : prize.status === 'SENT'
                      ? 'text-success-text text-[10px] font-bold'
                      : 'text-success-text text-[10px] font-bold'
                }
              >
                {prize.status === 'PENDING'
                  ? t('roulette status pending')
                  : prize.status === 'SENT'
                    ? t('roulette status sent')
                    : t('roulette status granted')}
              </span>
            </div>
          ))}
        </div>
      )}

      <RoulettePrizeModal
        prize={revealed}
        spinsLeft={data.spinsAvailable}
        onSpinAgain={() => {
          setRevealed(null);
          void spin();
        }}
        onClose={() => setRevealed(null)}
      />

      <RouletteOddsModal open={oddsOpen} slots={data.slots} onClose={() => setOddsOpen(false)} />
    </section>
  );
}
