'use client';

import Image from 'next/image';
import { Button } from '@/components/shared/buttons/Button';
import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { tikkiImages } from './tikki.images';
import type { TikkiUnit } from './tikki.constants';
import { tikkiMergeResult, tikkiTierBase } from './tikki.utils';
import { tierAccentColors } from '@/constants/tier-colors';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact, formatNumber } from '@/utils/global/number.utils';

export interface TikkiMergeResultProps {
  /** Что отмечено прямо сейчас — панель считается от этого набора. */
  selected: readonly TikkiUnit[];
  balance: number;
  onMerge: () => void;
}

/**
 * Что получится из отмеченных — считается на каждое нажатие, до сплава.
 *
 * Формула написана строкой нарочно: цена сплава фиксированная, поэтому класть
 * больше четверых всегда выгоднее, и увидеть это можно только на числах — пятая
 * карточка цену не двигает, а базу двигает.
 */
export function TikkiMergeResult({ selected, balance, onMerge }: TikkiMergeResultProps) {
  const t = useAppTranslations();
  const result = tikkiMergeResult(selected);

  if (!result) return null;

  const plain = tikkiTierBase(result.to);
  const accent = tierAccentColors[result.to];
  const affordable = balance >= result.cost;
  const short = Math.max(0, Math.round(result.cost - balance));

  return (
    <section className="card-outlined flex flex-col gap-3 rounded-2xl p-3">
      <div className="flex items-center gap-3">
        <Image
          src={tikkiImages[result.to].idle}
          alt=""
          width={44}
          height={48}
          className="h-12 w-11 flex-none object-contain"
        />

        <div className="flex flex-available flex-col gap-0.5">
          <span className="text-sm font-bold capitalize" style={{ color: accent }}>
            {t(result.to)}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold tabular-nums">
            <CoinIcon size={12} />
            {formatNumber(result.base)}
            <span className="text-muted font-semibold">
              {t('in hour, plain one gives {amount}', { amount: formatNumber(plain) })}
            </span>
          </span>
        </div>

        <div className="flex flex-none flex-col items-end">
          <span className="text-base font-extrabold tabular-nums" style={{ color: accent }}>
            ×{(result.base / plain).toFixed(1).replace('.0', '')}
          </span>
          <span className="text-muted text-[9px] font-bold uppercase tracking-wide">
            {t('vs bought')}
          </span>
        </div>
      </div>

      {/* Ровно то, что решено 02.09: сумма + база нового тира, и процент на всё. */}
      <p className="text-gold rounded-xl bg-white/5 px-3 py-2 text-[11px] font-semibold leading-snug">
        {t('merge formula', {
          sum: formatNumber(result.clickerSum),
          gift: formatNumber(result.gift),
          percent: result.percent,
          total: formatNumber(result.base),
        })}
      </p>

      <div className="flex flex-col gap-1 text-[11px]">
        <span className="text-muted flex items-center justify-between gap-2">
          {t('passive per hour')}
          <span className="flex items-center gap-1 font-bold tabular-nums text-white">
            <CoinIcon size={12} />
            {formatNumber(result.passiveBase)}
          </span>
        </span>
        <span className="text-muted flex items-center justify-between gap-2">
          {t('goes in')}
          <span className="font-bold text-white">{selected.length}</span>
        </span>
      </div>

      <Button
        variant="primary"
        className="w-full py-3 text-sm"
        disabled={!affordable}
        onClick={onMerge}
      >
        {affordable
          ? `${t('merge')} · ${formatCompact(result.cost)}`
          : t('not enough by {amount}', { amount: formatCompact(short) })}
      </Button>

      <p className="text-faint text-[10px] leading-snug">{t('merge note')}</p>
    </section>
  );
}
