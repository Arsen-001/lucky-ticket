'use client';

import { useState } from 'react';
import { EngineIcon } from '@/components/shared/icons/EngineIcon';
import { TikkiScreen } from '@/components/shared/tikki/TikkiScreen';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import type { TikkiTier } from '@/components/shared/tikki/tikki.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useBackDismiss } from '@/hooks/useBackDismiss';
import { useFeature } from '@/hooks/useFeature';
import { HomeEnginesScreen } from './HomeEnginesScreen';
import { HomeGamesPill } from './HomeGamesPill';
import { HomeScreenPill } from './HomeScreenPill';
import { HomeScreenPillRow } from './HomeScreenPillRow';

/**
 * Главная — это ДВА экрана, и первый из них Тикки.
 *
 * Движки, турниры и джекпот никуда не делись: они стали вторым экраном, и
 * попасть туда — одна пилюля справа. Слева зеркальная ведёт в «Игры», потому
 * что за играми иначе надо лезть через меню. Тот же ряд стоит и на втором
 * экране — только справа там пилюля возврата к Тикки.
 *
 * Пока `GET /me` не ответил, `useFeature` честно отвечает «нет», и главная
 * рисуется прежней. Тестировщик видит, как она один раз сменится на Тикки —
 * это лучше, чем пустой экран у всех остальных, кому фича не открыта.
 */
export function HomeScreens() {
  const t = useAppTranslations();
  const tikkiOpen = useFeature('tikkiClicker');
  const [tier, setTier] = useState<TikkiTier>(TicketsEnum.BRONZE);
  const [engines, setEngines] = useState(false);

  // Кнопка «назад» Telegram возвращает к Тикки, а не выкидывает из приложения.
  useBackDismiss(tikkiOpen && engines, () => setEngines(false));

  if (!tikkiOpen) return <HomeEnginesScreen />;

  if (engines) return <HomeEnginesScreen onBack={() => setEngines(false)} backTier={tier} />;

  return (
    <TikkiScreen
      onTierChange={setTier}
      footer={
        <HomeScreenPillRow>
          <HomeGamesPill />
          <HomeScreenPill
            label={t('engines short')}
            testId="home-pill-engines"
            onClick={() => setEngines(true)}
            icon={<EngineIcon tier={tier} size={22} />}
          />
        </HomeScreenPillRow>
      }
    />
  );
}
