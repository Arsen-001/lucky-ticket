'use client';

import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';
import type { TikkiUnit, TikkiUpgradeKind } from '@/types/interfaces/tikki.interfaces';
import { TikkiChangeRow } from './TikkiChangeRow';

export interface TikkiUpgradeModalProps {
  open: boolean;
  unit: TikkiUnit | null;
  kind: TikkiUpgradeKind;
  balance: number;
  /** Потолок окна из конфига — его двигает админка, не код. */
  maxHours: number;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Окно покупки: что покупаешь, что от этого изменится и сколько это стоит.
 *
 * Все числа — и цена, и «станет» — приехали с сервера. Клиент их не считает: он
 * и списывать не он, и вторая копия экономики на экране однажды разошлась бы с
 * той, по которой снимают деньги.
 *
 * Денег не хватает — окно всё равно открывается и называет, сколько не хватает.
 * Молча неактивная кнопка на сцене не объясняет ничего.
 */
export function TikkiUpgradeModal({
  open,
  unit,
  kind,
  balance,
  maxHours,
  onClose,
  onConfirm,
}: TikkiUpgradeModalProps) {
  const t = useAppTranslations();

  if (!unit) return null;

  const price = unit.cost[kind];
  // Лестница кончилась: ступени больше нет, а не «нет денег».
  const maxed = price === null;
  const affordable = !maxed && balance >= price;
  const short = maxed ? 0 : Math.max(0, Math.round(price - balance));

  const titles: Record<TikkiUpgradeKind, string> = {
    clicker: t('clicker level'),
    passive: t('passive level'),
    window: t('window'),
    tap: t('per tap'),
  };

  const rows: Record<TikkiUpgradeKind, React.ReactNode> = {
    clicker: (
      <>
        <TikkiChangeRow
          label={t('clicker per hour')}
          from={formatNumber(unit.clickerPerHour)}
          to={formatNumber(unit.next.clickerPerHour)}
        />
        <TikkiChangeRow
          label={t('holds')}
          from={formatNumber(unit.capacity)}
          to={formatNumber(unit.next.clickerCapacity)}
        />
        <TikkiChangeRow label={t('level')} from={unit.level} to={unit.level + 1} />
      </>
    ),
    passive: (
      <>
        <TikkiChangeRow
          label={t('passive per hour')}
          from={formatNumber(unit.passivePerHour)}
          to={formatNumber(unit.next.passivePerHour)}
        />
        <TikkiChangeRow
          label={t('passive per day')}
          from={formatNumber(unit.passivePerHour * 24)}
          to={formatNumber(unit.next.passivePerHour * 24)}
        />
        <TikkiChangeRow label={t('level')} from={unit.passiveLevel} to={unit.passiveLevel + 1} />
      </>
    ),
    window: (
      <>
        <TikkiChangeRow
          label={t('window')}
          from={`${unit.windowHours} ${t('hour short')}`}
          to={`${unit.next.windowHours} ${t('hour short')}`}
        />
        <TikkiChangeRow
          label={t('holds')}
          from={formatNumber(unit.capacity)}
          to={formatNumber(unit.next.windowCapacity)}
        />
        <TikkiChangeRow label={t('window ceiling')} from={`${maxHours} ${t('hour short')}`} />
      </>
    ),
    tap: (
      <>
        <TikkiChangeRow
          label={t('per tap')}
          from={formatNumber(unit.tapValue)}
          to={formatNumber(unit.next.tapValue)}
        />
        <TikkiChangeRow
          label={t('taps to empty')}
          from={formatNumber(unit.tapPresses)}
          to={formatNumber(unit.next.tapPresses)}
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
