'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { ArrowUp, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';
import '@/styles/components/tikki.css';
import {
  maxLevel,
  perHourPerLevel,
  tapPerLevel,
  tikkiRates,
  upgradeCost,
  type TikkiTier,
} from './tikki.constants';
import { tikkiImages } from './tikki.images';
import { TikkiTapPop } from './TikkiTapPop';

interface Pop {
  id: number;
  x: number;
  y: number;
  amount: number;
}

export interface TikkiCardProps {
  tier: TikkiTier;
  level: number;
  pending: number;
  balance: number;
  onTap: (amount: number) => void;
  onClaim: () => void;
  onUpgrade: () => void;
  onUnlock: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Один Тикки: тапается ради LC здесь и сейчас и капает доход, пока его не
 * трогают. Уровень поднимает и то и другое, поэтому обе цифры стоят рядом с
 * кнопкой апгрейда — иначе непонятно, за что платишь.
 */
export function TikkiCard({
  tier,
  level,
  pending,
  balance,
  onTap,
  onClaim,
  onUpgrade,
  onUnlock,
  className,
  style,
}: TikkiCardProps) {
  const t = useAppTranslations();
  const [pops, setPops] = useState<Pop[]>([]);
  const [squash, setSquash] = useState(false);
  const popId = useRef(0);
  const squashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const locked = level < 1;
  const tap = tapPerLevel(tier, level);
  const perHour = perHourPerLevel(tier, level);
  const cost = upgradeCost(tier, level);
  const unlockCost = tikkiRates[tier].unlock;
  const maxed = level >= maxLevel;

  const handleTap = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (locked) return;
      const box = e.currentTarget.getBoundingClientRect();
      const id = ++popId.current;
      setPops(prev => [
        ...prev.slice(-5),
        {
          id,
          x: ((e.clientX - box.left) / box.width) * 100,
          y: ((e.clientY - box.top) / box.height) * 100,
          amount: tap,
        },
      ]);
      setTimeout(() => setPops(prev => prev.filter(p => p.id !== id)), 800);

      setSquash(true);
      if (squashTimer.current) clearTimeout(squashTimer.current);
      squashTimer.current = setTimeout(() => setSquash(false), 320);

      onTap(tap);
    },
    [locked, tap, onTap]
  );

  return (
    <section
      className={twMerge('card-outlined flex flex-col gap-3 rounded-2xl p-3', className)}
      style={style}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onPointerDown={handleTap}
          disabled={locked}
          aria-label={t('tap tikki')}
          className={twMerge(
            'relative flex-none touch-manipulation select-none rounded-xl',
            'focus-visible:outline-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            locked && 'opacity-45 grayscale'
          )}
        >
          <Image
            src={squash ? tikkiImages[tier].happy : tikkiImages[tier].idle}
            alt=""
            width={96}
            height={104}
            className={twMerge(
              'h-[104px] w-24 object-contain',
              squash ? 'animate-tikki-squash' : 'animate-tikki-breathe'
            )}
          />
          {pops.map(p => (
            <TikkiTapPop key={p.id} x={p.x} y={p.y} amount={p.amount} />
          ))}
        </button>

        <div className="flex flex-available flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-bold capitalize">{t(tier)}</h2>
            <span className="text-muted text-[11px] font-semibold uppercase tracking-wide">
              {locked ? t('locked') : `${t('level')} ${level}`}
            </span>
          </div>

          {locked ? (
            <p className="text-muted text-xs">
              {t('unlock to start earning {coin}', { coin: GlobalConstants.coinName })}
            </p>
          ) : (
            <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
              <dt className="text-muted">{t('per tap')}</dt>
              <dd className="text-right font-bold tabular-nums">
                {formatCompact(tap)} {GlobalConstants.coinName}
              </dd>
              <dt className="text-muted">{t('per hour')}</dt>
              <dd className="text-right font-bold tabular-nums">
                {formatCompact(perHour)} {GlobalConstants.coinName}
              </dd>
            </dl>
          )}
        </div>
      </div>

      {locked ? (
        <Button
          variant="secondary"
          className="w-full whitespace-nowrap py-2.5 text-[11px]"
          icon={<Lock size={15} />}
          disabled={balance < unlockCost}
          onClick={onUnlock}
        >
          {t('unlock for {amount}', {
            amount: `${formatCompact(unlockCost)} ${GlobalConstants.coinName}`,
          })}
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="primary"
            className="flex-available whitespace-nowrap py-2.5 text-[11px]"
            disabled={pending < 1}
            onClick={onClaim}
          >
            {pending > 0
              ? t('collect {amount}', {
                  amount: `${formatCompact(pending)} ${GlobalConstants.coinName}`,
                })
              : t('empty for now')}
          </Button>
          <Button
            variant="outlined"
            className="flex-available whitespace-nowrap py-2.5 text-[11px]"
            icon={<ArrowUp size={15} />}
            disabled={maxed || balance < cost}
            onClick={onUpgrade}
          >
            {maxed
              ? t('max level')
              : `${t('level')} ${level + 1} · ${formatCompact(cost)} ${GlobalConstants.coinName}`}
          </Button>
        </div>
      )}
    </section>
  );
}
