'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { tierAccentColors } from '@/constants/tier-colors';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';
import { tikkiMergeSize, type TikkiTier } from './tikki.constants';
import { nextTikkiTier, tikkiPassiveRate, tikkiTapMaxed, tikkiTapValue } from './tikki.utils';
import { upgradeCost, useTikkiProgress, type TikkiUpgrade } from './useTikkiProgress';
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
   * Показать пометку стенда и кнопку сброса. Живёт ВНУТРИ экрана, а не слотом
   * снаружи: сброс должен дёргать тот же самый `useTikkiProgress`, что и сцена,
   * иначе он обнулит чужую копию состояния, а экран останется как был.
   */
  stand?: boolean;
  /**
   * Какой Тикки сейчас на сцене. Нужен главной: её пилюля «Движки» рисует
   * двигатель того же тира. Отдаём колбэком, а не вторым `useTikkiProgress` у
   * родителя — две копии хука тикали бы врозь и писали бы в одно хранилище.
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
 * 🔴 Счёт здесь — не настоящие LC: прогресс лежит в localStorage этого
 * устройства. Механика перенесена целиком, чтобы тестировщики видели её всю;
 * когда она поедет на настоящий баланс, считать будет сервер.
 */
export function TikkiScreen({ footer, stand = false, onTierChange, className }: TikkiScreenProps) {
  const t = useAppTranslations();
  const { progress, ready, select, tap, buy, upgrade, merge, reset } = useTikkiProgress();
  // Что покупаем и открыто ли окно — двумя состояниями нарочно: закрываясь,
  // модалка живёт ещё 200 мс анимации, и обнули мы `kind` вместе с ней —
  // заголовок на прощание менялся бы на «уровень кликера».
  const [upgrading, setUpgrading] = useState<TikkiUpgrade | null>(null);
  const [upgradeKind, setUpgradeKind] = useState<TikkiUpgrade>('clicker');
  const [buying, setBuying] = useState(false);
  const [merging, setMerging] = useState(false);

  const selected =
    progress.units.find(unit => unit.id === progress.selectedId) ?? progress.units[0];

  const selectedTier = selected?.tier;
  useEffect(() => {
    if (selectedTier) onTierChange?.(selectedTier);
    // `onTierChange` каждый раз новая стрелка у вызывающего — в зависимостях ей
    // не место, иначе эффект бегал бы на каждый тик секундного таймера.
  }, [selectedTier]);

  if (!ready || !selected) return null;

  const accent = tierAccentColors[selected.tier];
  const passivePerHour = progress.units.reduce((sum, unit) => sum + tikkiPassiveRate(unit), 0);
  const mergeReady = progress.units.some(
    unit =>
      nextTikkiTier(unit.tier) &&
      progress.units.filter(item => item.tier === unit.tier).length >= tikkiMergeSize
  );

  const poor = (kind: TikkiUpgrade) => progress.balance < upgradeCost(selected, kind);

  const openUpgrade = (kind: TikkiUpgrade) => {
    setUpgradeKind(kind);
    setUpgrading(kind);
  };

  const handleBuy = (tier: TikkiTier) => {
    buy(tier);
    setBuying(false);
  };

  const handleMerge = (ids: string[]) => {
    merge(ids);
    setMerging(false);
  };

  if (merging) {
    return (
      <TikkiMergeScreen
        units={progress.units}
        balance={progress.balance}
        onBack={() => setMerging(false)}
        onMerge={handleMerge}
        className={className}
      />
    );
  }

  return (
    <div className={twMerge('flex flex-available flex-col gap-3', className)}>
      <TikkiBalanceRow balance={progress.balance} perHour={passivePerHour} />

      <div className="flex-available flex flex-col gap-3">
        <TikkiHero
          tier={selected.tier}
          tapValue={tikkiTapValue(selected)}
          empty={selected.fill < 1}
          onTap={() => tap(selected.id)}
          className="my-auto"
        />

        <div className="flex items-end justify-between gap-2">
          <TikkiBoostChip
            label={t('passive')}
            side="left"
            poor={poor('passive')}
            value={
              <>
                <CoinIcon size={15} />
                {formatNumber(tikkiPassiveRate(selected))}
              </>
            }
            onClick={() => openUpgrade('passive')}
          />
          <TikkiBoostChip
            label={t('per tap')}
            side="right"
            poor={poor('tap')}
            maxed={tikkiTapMaxed(selected)}
            value={formatNumber(tikkiTapValue(selected))}
            className="items-end text-right"
            onClick={() => openUpgrade('tap')}
          />
        </div>

        <TikkiMeterRow
          unit={selected}
          accent={accent}
          onUpgradeClicker={() => openUpgrade('clicker')}
          onUpgradeWindow={() => openUpgrade('window')}
        />
      </div>

      <TikkiCollection
        units={progress.units}
        selectedId={selected.id}
        mergeReady={mergeReady}
        onSelect={select}
        onBuy={() => setBuying(true)}
        onMerge={() => setMerging(true)}
      />

      {stand && (
        <footer className="flex items-center justify-between gap-2">
          <p className="text-faint flex-available text-[10px] leading-snug">
            {t('tikki stand note')}
          </p>
          <Button
            variant="transparent"
            className="text-muted flex-none px-2 py-1 text-[10px]"
            icon={<RotateCcw size={12} />}
            iconSize={12}
            onClick={reset}
          >
            {t('reset')}
          </Button>
        </footer>
      )}

      {footer}

      <TikkiUpgradeModal
        open={upgrading !== null}
        unit={selected}
        kind={upgradeKind}
        balance={progress.balance}
        onClose={() => setUpgrading(null)}
        onConfirm={() => {
          if (upgrading) upgrade(selected.id, upgrading);
          setUpgrading(null);
        }}
      />

      <TikkiBuyModal
        open={buying}
        balance={progress.balance}
        onClose={() => setBuying(false)}
        onBuy={handleBuy}
      />
    </div>
  );
}
