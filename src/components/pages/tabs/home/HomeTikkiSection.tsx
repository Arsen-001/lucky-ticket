'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { TikkiTapPop } from '@/components/shared/tikki/TikkiTapPop';
import {
  perHourPerLevel,
  tapPerLevel,
  tikkiTiers,
  type TikkiTier,
} from '@/components/shared/tikki/tikki.constants';
import { tikkiImages } from '@/components/shared/tikki/tikki.images';
import { pendingFor, useTikkiProgress } from '@/components/shared/tikki/useTikkiProgress';
import { GlobalConstants } from '@/constants/global.constants';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useFeature } from '@/hooks/useFeature';
import { formatCompact, formatNumber } from '@/utils/global/number.utils';
import '@/styles/components/tikki.css';

interface Pop {
  id: number;
  x: number;
  y: number;
  amount: number;
}

/**
 * Тикки на главной: тапается тот, что старше всех открытых, а рядом стоит
 * общий сбор со всех — на главной место есть на одно действие, не на пять
 * карточек. Прокачка живёт на своей странице, сюда ведёт стрелка.
 *
 * Виден только тем, кому фича открыта: стадию (выключено / тестерам / всем)
 * решает сервер, экран о ней не спорит.
 */
export function HomeTikkiSection({ className }: { className?: string }) {
  const t = useAppTranslations();
  const enabled = useFeature('tikkiClicker');
  const { progress, ready, tap, claim } = useTikkiProgress();
  const [now, setNow] = useState(() => Date.now());
  const [pops, setPops] = useState<Pop[]>([]);
  const [squash, setSquash] = useState(false);
  const popId = useRef(0);
  const squashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const unlocked = tikkiTiers.filter(tier => progress.tikki[tier].level > 0);
  // Старший открытый — он же самый выгодный: и за тап, и в час.
  const hero: TikkiTier | undefined = unlocked[unlocked.length - 1];
  const heroLevel = hero ? progress.tikki[hero].level : 0;
  const tapValue = hero ? tapPerLevel(hero, heroLevel) : 0;
  const totalPending = unlocked.reduce(
    (sum, tier) => sum + pendingFor(tier, progress.tikki[tier], now),
    0
  );
  const totalPerHour = unlocked.reduce(
    (sum, tier) => sum + perHourPerLevel(tier, progress.tikki[tier].level),
    0
  );

  const handleTap = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!hero) return;
      const box = e.currentTarget.getBoundingClientRect();
      const id = ++popId.current;
      setPops(prev => [
        ...prev.slice(-5),
        {
          id,
          x: ((e.clientX - box.left) / box.width) * 100,
          y: ((e.clientY - box.top) / box.height) * 100,
          amount: tapValue,
        },
      ]);
      setTimeout(() => setPops(prev => prev.filter(p => p.id !== id)), 800);

      setSquash(true);
      if (squashTimer.current) clearTimeout(squashTimer.current);
      squashTimer.current = setTimeout(() => setSquash(false), 320);

      tap(tapValue);
    },
    [hero, tapValue, tap]
  );

  const collectAll = useCallback(() => {
    unlocked.forEach(tier => {
      const amount = pendingFor(tier, progress.tikki[tier], Date.now());
      if (amount > 0) claim(tier, amount);
    });
  }, [unlocked, progress.tikki, claim]);

  if (!enabled || !ready || !hero) return null;

  return (
    <section className={twMerge('px-2.5', className)}>
      <div className="card-outlined flex items-center gap-3 rounded-2xl p-3">
        <button
          type="button"
          onPointerDown={handleTap}
          aria-label={t('tap tikki')}
          className="focus-visible:outline-teal relative flex-none touch-manipulation select-none rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Image
            src={squash ? tikkiImages[hero].happy : tikkiImages[hero].idle}
            alt=""
            width={84}
            height={92}
            className={twMerge(
              'h-[92px] w-[84px] object-contain',
              squash ? 'animate-tikki-squash' : 'animate-tikki-breathe'
            )}
          />
          {pops.map(p => (
            <TikkiTapPop key={p.id} x={p.x} y={p.y} amount={p.amount} />
          ))}
        </button>

        <div className="flex flex-available flex-col gap-2">
          <Link
            href={routes.tikki}
            className="flex items-center justify-between gap-1 text-sm font-bold"
          >
            {t('tikki')}
            <span className="text-muted inline-flex items-center gap-0.5 text-[11px] font-semibold">
              {t('all tikki', { count: unlocked.length })}
              <ChevronRight size={13} />
            </span>
          </Link>

          <p className="text-muted text-[11px] leading-tight">
            {t('tap for {tap}, {perHour} per hour', {
              tap: `${formatCompact(tapValue)} ${GlobalConstants.coinName}`,
              perHour: `${formatCompact(totalPerHour)} ${GlobalConstants.coinName}`,
            })}
          </p>

          <Button
            variant="primary"
            className="w-full whitespace-nowrap py-2 text-[11px]"
            disabled={totalPending < 1}
            onClick={collectAll}
          >
            {totalPending > 0
              ? t('collect {amount}', {
                  amount: `${formatNumber(totalPending)} ${GlobalConstants.coinName}`,
                })
              : t('empty for now')}
          </Button>
        </div>
      </div>
    </section>
  );
}
