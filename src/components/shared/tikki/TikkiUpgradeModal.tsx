'use client';

import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import type { TikkiUnit } from './tikki.constants';
import { tikkiMaxHours } from './tikki.constants';
import {
  tikkiCapacity,
  tikkiClickerRate,
  tikkiPassiveRate,
  tikkiTapPresses,
  tikkiTapValue,
  tikkiWindowHours,
} from './tikki.utils';
import { applyUpgrade, upgradeCost, type TikkiUpgrade } from './useTikkiProgress';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';
import { TikkiChangeRow } from './TikkiChangeRow';

export interface TikkiUpgradeModalProps {
  open: boolean;
  unit: TikkiUnit | null;
  kind: TikkiUpgrade;
  balance: number;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Окно покупки: что покупаешь, что от этого изменится и сколько это стоит.
 *
 * Денег не хватает — окно всё равно открывается и называет, сколько не хватает.
 * Молча неактивная кнопка на сцене не объясняет ничего, а цена здесь зависит от
 * прокачки и меняется под руками.
 */
export function TikkiUpgradeModal({
  open,
  unit,
  kind,
  balance,
  onClose,
  onConfirm,
}: TikkiUpgradeModalProps) {
  const t = useAppTranslations();

  if (!unit) return null;

  const next = applyUpgrade(unit, kind);
  const price = upgradeCost(unit, kind);
  // Лестница кончилась: ступени больше нет, а не «нет денег».
  const maxed = !Number.isFinite(price);
  const affordable = !maxed && balance >= price;
  const short = maxed ? 0 : Math.max(0, Math.round(price - balance));

  const titles: Record<TikkiUpgrade, string> = {
    clicker: t('clicker level'),
    passive: t('passive level'),
    window: t('window'),
    tap: t('per tap'),
  };

  const rows: Record<TikkiUpgrade, React.ReactNode> = {
    clicker: (
      <>
        <TikkiChangeRow
          label={t('clicker per hour')}
          from={formatNumber(tikkiClickerRate(unit))}
          to={formatNumber(tikkiClickerRate(next))}
        />
        <TikkiChangeRow
          label={t('holds')}
          from={formatNumber(tikkiCapacity(unit))}
          to={formatNumber(tikkiCapacity(next))}
        />
        <TikkiChangeRow label={t('level')} from={unit.level} to={next.level} />
      </>
    ),
    passive: (
      <>
        <TikkiChangeRow
          label={t('passive per hour')}
          from={formatNumber(tikkiPassiveRate(unit))}
          to={formatNumber(tikkiPassiveRate(next))}
        />
        <TikkiChangeRow
          label={t('passive per day')}
          from={formatNumber(tikkiPassiveRate(unit) * 24)}
          to={formatNumber(tikkiPassiveRate(next) * 24)}
        />
        <TikkiChangeRow label={t('level')} from={unit.passiveLevel} to={next.passiveLevel} />
      </>
    ),
    window: (
      <>
        <TikkiChangeRow
          label={t('window')}
          from={`${tikkiWindowHours(unit)} ${t('hour short')}`}
          to={`${tikkiWindowHours(next)} ${t('hour short')}`}
        />
        <TikkiChangeRow
          label={t('holds')}
          from={formatNumber(tikkiCapacity(unit))}
          to={formatNumber(tikkiCapacity(next))}
        />
        <TikkiChangeRow label={t('window ceiling')} from={`${tikkiMaxHours} ${t('hour short')}`} />
      </>
    ),
    tap: (
      <>
        <TikkiChangeRow
          label={t('per tap')}
          from={formatNumber(tikkiTapValue(unit))}
          to={formatNumber(tikkiTapValue(next))}
        />
        <TikkiChangeRow
          label={t('taps to empty')}
          from={formatNumber(tikkiTapPresses(unit))}
          to={formatNumber(tikkiTapPresses(next))}
        />
      </>
    ),
  };

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={titles[kind]}
      hideConfirm={!affordable}
      confirmText={maxed ? undefined : `${t('buy')} · ${formatNumber(price)}`}
      cancelText={affordable ? t('cancel') : t('close')}
      content={
        <div className="flex flex-col gap-3 text-left">
          <div className="flex flex-col">{rows[kind]}</div>

          {maxed ? (
            <p className="text-muted text-center text-xs font-semibold">{t('max level')}</p>
          ) : affordable ? (
            <p className="text-muted flex items-center justify-center gap-1 text-xs">
              {t('price')}
              <CoinIcon size={14} />
              <span className="font-bold tabular-nums text-white">{formatNumber(price)}</span>
            </p>
          ) : (
            <p className="text-error-text flex items-center justify-center gap-1 text-xs font-semibold">
              {t('not enough by {amount}', { amount: formatNumber(short) })}
            </p>
          )}
        </div>
      }
    />
  );
}
