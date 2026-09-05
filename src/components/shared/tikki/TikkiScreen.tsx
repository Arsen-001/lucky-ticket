'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { formatCompact } from '@/utils/global/number.utils';
import type { TicketType } from '@/types/types/ticket.types';
import type { TikkiUpgradeKind } from '@/types/interfaces/tikki.interfaces';
import type { TikkiTier } from './tikki.constants';
import { useTikkiProgress } from './useTikkiProgress';
import { TikkiBalanceRow } from './TikkiBalanceRow';
import { TikkiBoostChip } from './TikkiBoostChip';
import { TikkiBuyModal } from './TikkiBuyModal';
import { TikkiCollection } from './TikkiCollection';
import { TikkiHero } from './TikkiHero';
import { TikkiMergeScreen } from './TikkiMergeScreen';
import { TikkiMeterRow } from './TikkiMeterRow';
import { TikkiUpgradeModal } from './TikkiUpgradeModal';

export interface TikkiScreenProps {
  /** Что дорисовать под лентой коллекции — на главной это пилюли перехода. */
  footer?: ReactNode;
  /**
   * Какой Тикки сейчас на сцене. Нужен главной: её пилюля «Движки» рисует
   * двигатель того же тира. Отдаём колбэком, а не вторым `useTikkiProgress` у
   * родителя — две копии хука опрашивали бы сервер врозь.
   */
  onTierChange?: (tier: TikkiTier) => void;
  className?: string;
}

/**
 * Сцена Тикки: выбранный персонаж, четыре точки прокачки вокруг него и лента
 * коллекции под ними. Один и тот же экран стоит на главной и по адресу
 * `/tikki` — разное у них только то, что дорисовано снизу.
 *
 * Прокачка живёт НА СЦЕНЕ, а не отдельным списком: каждая покупка меняет то,
 * что игрок в этот момент видит — доход в час, вместимость, силу нажатия, — и
 * цифра обязана стоять рядом с тем, что она описывает.
 *
 * 🔴 Все числа считает СЕРВЕР. Экран рисует отдачу тапа сразу, чтобы она не
 * шла через сеть, но цены, доход и вместимость приезжают готовыми, и деньги
 * двигает только он.
 */
export function TikkiScreen({ footer, onTierChange, className }: TikkiScreenProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const { state, isLoading, isError, refetch, tap, select, upgrade, buy, merge } =
    useTikkiProgress();

  // Что покупаем и открыто ли окно — двумя состояниями нарочно: закрываясь,
  // модалка живёт ещё 200 мс анимации, и обнули мы `kind` вместе с ней —
  // заголовок на прощание менялся бы на «уровень кликера».
  const [upgrading, setUpgrading] = useState<TikkiUpgradeKind | null>(null);
  const [upgradeKind, setUpgradeKind] = useState<TikkiUpgradeKind>('clicker');
  const [buying, setBuying] = useState(false);
  const [merging, setMerging] = useState(false);

  const selected = state?.units.find(unit => unit.selected) ?? state?.units[0];

  const selectedTier = selected?.tier;
  useEffect(() => {
    if (selectedTier) onTierChange?.(selectedTier as TikkiTier);
    // `onTierChange` каждый раз новая стрелка у вызывающего — в зависимостях ей
    // не место, иначе эффект бегал бы на каждый тик секундного таймера.
  }, [selectedTier]);

  // Отказ сервера показывает экран, который запросом владеет: пустая сцена без
  // объяснения читается как «игра сломалась», а не «данные не приехали».
  if (isError) return <QueryErrorState onRetry={() => refetch()} />;
  if (isLoading || !state || !selected) return null;

  const passivePerHour = state.units.reduce((sum, unit) => sum + unit.passivePerHour, 0);
  const mergeReady = state.merge.ready.length > 0;
  const poor = (kind: TikkiUpgradeKind) => {
    const price = selected.cost[kind];
    return price !== null && state.balance < price;
  };

  const openUpgrade = (kind: TikkiUpgradeKind) => {
    setUpgradeKind(kind);
    setUpgrading(kind);
  };

  /** Отказ сервера — всегда словами: молчаливый no-op читается как поломка. */
  const guard = async (action: () => Promise<unknown>) => {
    try {
      await action();
    } catch {
      toast.error(t('action failed'));
    }
  };

  if (merging) {
    return (
      <TikkiMergeScreen
        units={state.units}
        balance={state.balance}
        config={state.config}
        costByTier={state.merge.costByTier}
        onBack={() => setMerging(false)}
        onMerge={ids => {
          setMerging(false);
          void guard(() => merge(ids));
        }}
        className={className}
      />
    );
  }

  return (
    <div className={twMerge('flex flex-available flex-col px-[14px] pt-2.5', className)}>
      <TikkiBalanceRow balance={state.balance} perHour={passivePerHour} />

      {/* Персонаж занимает всё, что осталось между счётом и нижним рядом. Чипы
          лежат ПОВЕРХ него по нижним углам — так в макете: он крупный ровно
          потому, что уходит за них, а не жмётся между ними. Уводим их на 6 px
          за колонку (в макете left/right 8 px при поле 14), и стрелка каждого
          садится во внешний угол, к краю экрана. */}
      <div className="relative flex flex-available items-end justify-center">
        <TikkiHero
          tier={selected.tier as TikkiTier}
          tapValue={selected.tapValue}
          empty={selected.fill < 1}
          full={selected.fill >= selected.capacity}
          onTap={() => tap(selected.id, selected.tapValue)}
          // Ногами персонаж заходит на 28 px ниже чипов — ровно как в макете.
          // Оттуда и его размер: он крупный потому, что уходит ЗА них.
          className="translate-y-7"
        />

        <TikkiBoostChip
          className="absolute bottom-0 -start-1.5"
          label={t('passive')}
          side="left"
          maxed={selected.cost.passive === null}
          poor={poor('passive')}
          value={
            <>
              <CoinIcon size={13} className="me-1" />
              {formatCompact(selected.passivePerHour)}
            </>
          }
          onClick={() => openUpgrade('passive')}
        />
        <TikkiBoostChip
          className="absolute bottom-0 -end-1.5"
          label={t('per tap')}
          side="right"
          poor={poor('tap')}
          maxed={selected.cost.tap === null}
          value={formatCompact(selected.tapValue)}
          onClick={() => openUpgrade('tap')}
        />
      </div>

      <TikkiMeterRow
        unit={selected}
        onUpgradeClicker={() => openUpgrade('clicker')}
        onUpgradeWindow={() => openUpgrade('window')}
        className="mb-2 mt-0.5"
      />

      <TikkiCollection
        units={state.units}
        selectedId={selected.id}
        mergeReady={mergeReady}
        onSelect={select}
        onBuy={() => setBuying(true)}
        onMerge={() => setMerging(true)}
      />

      <div className="mt-1.5">{footer}</div>

      <TikkiUpgradeModal
        open={upgrading !== null}
        unit={selected}
        kind={upgradeKind}
        balance={state.balance}
        maxHours={state.config.maxHours}
        onClose={() => setUpgrading(null)}
        onConfirm={() => {
          const kind = upgrading;
          setUpgrading(null);
          if (kind) void guard(() => upgrade(selected.id, kind));
        }}
      />

      <TikkiBuyModal
        open={buying}
        balance={state.balance}
        buyCost={state.buyCost}
        tierBase={state.config.tierBase}
        buyPaybackDays={state.config.buyPaybackDays}
        onClose={() => setBuying(false)}
        onBuy={(tier: TicketType) => {
          setBuying(false);
          void guard(() => buy(tier));
        }}
      />
    </div>
  );
}
