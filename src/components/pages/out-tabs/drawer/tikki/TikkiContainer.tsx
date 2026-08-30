'use client';

import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useFeature } from '@/hooks/useFeature';
import { staggerMs } from '@/utils/global/animation.utils';
import { formatNumber } from '@/utils/global/number.utils';
import { idleCapHours, tikkiRates, tikkiTiers } from '@/components/shared/tikki/tikki.constants';
import { TikkiCard } from '@/components/shared/tikki/TikkiCard';
import { pendingFor, useTikkiProgress } from '@/components/shared/tikki/useTikkiProgress';

/**
 * Черновая страница Тикки: пять персонажей, каждый — кликер со своим доходом в
 * час по уровню.
 *
 * 🔴 Ничего из этого не касается настоящего баланса: счёт лежит в localStorage
 * этого устройства, на бэкенд страница не ходит. Это стенд, чтобы пощупать
 * механику и числа, прежде чем сажать её в игру.
 */
export function TikkiContainer() {
  const t = useAppTranslations();
  const enabled = useFeature('tikkiClicker');
  const { progress, ready, tap, claim, upgrade, unlock, reset } = useTikkiProgress();
  const [now, setNow] = useState(() => Date.now());

  // Доход капает во времени, поэтому цифры на кнопках должны идти сами.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Адрес страницы знать мало: экран закрыт той же стадией, что и блок на
  // главной. Записи на сервер тут нет, но правило одно на всю фичу.
  if (!enabled) return null;

  return (
    <div className="flex flex-col gap-3 px-4 pb-8 pt-2">
      <header className="card-outlined animate-slide-in-bottom flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
        <div>
          <p className="text-muted text-[11px] font-bold uppercase tracking-wide">
            {t('collected here')}
          </p>
          <p className="text-2xl font-extrabold tabular-nums leading-tight">
            {formatNumber(progress.balance)}{' '}
            <span className="text-muted text-base font-bold">{GlobalConstants.coinName}</span>
          </p>
        </div>
        <Button
          variant="transparent"
          className="text-muted px-2 py-1.5 text-[11px]"
          icon={<RotateCcw size={14} />}
          onClick={reset}
        >
          {t('reset')}
        </Button>
      </header>

      <p className="text-faint px-1 text-[11px] leading-snug">
        {t('tikki draft note', { hours: idleCapHours })}
      </p>

      {ready &&
        tikkiTiers.map((tier, index) => {
          const state = progress.tikki[tier];
          return (
            <TikkiCard
              key={tier}
              tier={tier}
              level={state.level}
              pending={pendingFor(tier, state, now)}
              balance={progress.balance}
              onTap={tap}
              onClaim={() => claim(tier, pendingFor(tier, state, now))}
              onUpgrade={() => upgrade(tier)}
              onUnlock={() => unlock(tier, tikkiRates[tier].unlock)}
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${staggerMs(index, 100)}ms` }}
            />
          );
        })}
    </div>
  );
}
