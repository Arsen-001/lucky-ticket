'use client';

import { useEffect, useRef } from 'react';
import { useGetMeQuery } from '@/api/me.api';
import { appConfig } from '@/config/app.config';
import { useBotWriteAccess } from '@/hooks/useBotWriteAccess';
import { selectTourRunning } from '@/lib/rtk/features/onboarding-tour.slice';
import { useAppSelector } from '@/lib/rtk/hooks';
import {
  readWriteAccessPrompt,
  shouldAutoAskWriteAccess,
} from '@/utils/global/write-access-prompt.utils';

/**
 * Пауза перед тем, как начать ловить тап.
 *
 * Первые доли секунды после запуска игрок закрывает всплывшее с прошлого раза,
 * промахивается по ещё едущему макету и жмёт «назад» — попап, пойманный на
 * таком тапе, читается как случайность, а не как вопрос.
 */
const ARM_DELAY_MS = 1200;

/**
 * Просит у игрока разрешение писать ему в Telegram — на первом же тапе, на
 * любом экране, кем бы он в игру ни зашёл.
 *
 * Бот не может начать разговор первым: пока разрешения нет, каждое сообщение
 * возвращается `chat not found`, и 19.08.2026 прод доставил РОВНО НОЛЬ из
 * ~1000 напоминаний «двигатель готов». Спросить можно только нативным попапом
 * и только из настоящего тапа — из эффекта на монтировании клиент запрос молча
 * игнорирует. Поэтому здесь не таймер, а слушатель первого касания.
 *
 * Три места с кнопкой (онбординг, настройки, экран дуэли) закрывают только тех,
 * кто до них дошёл. Человек, открывший игру по ссылке и сразу ушедший играть,
 * не видит ни одного из них — и остаётся недостижимым навсегда. Этот сторож
 * существует ровно ради него.
 *
 * Ничего не рисует. Молчит, когда просить нечего или незачем: разрешение уже
 * есть, клиент старше 6.9 не умеет, это браузер, идёт онбординг (там свой
 * вопрос — над только что выданным двигателем) или частота исчерпана.
 */
export function BotWriteAccessWatcher() {
  const { canAsk, ask } = useBotWriteAccess();
  const { data: me } = useGetMeQuery();
  const tourRunning = useAppSelector(selectTourRunning);
  const askedRef = useRef(false);

  useEffect(() => {
    if (askedRef.current || !canAsk) return;
    // Новичка спрашивает сам онбординг, на тапе «Забрать подарки»: там вопрос
    // стоит сразу за подарком и звучит как обещание, а не как условие входа.
    // Сверяемся с рубильником тура, а не с одним `hasSeenTour`: при выключенном
    // автостарте флаг не поднимается никогда, и сторож замолчал бы для всех.
    const onboardingWillAsk = appConfig.onboardingTour.autoStart && !me?.hasSeenTour;
    if (!me || onboardingWillAsk || tourRunning) return;
    if (!shouldAutoAskWriteAccess(readWriteAccessPrompt(), Date.now())) return;

    const handleTap = () => {
      if (askedRef.current) return;
      askedRef.current = true;
      // Синхронно, внутри обработчика: попап живёт на жесте игрока, и
      // отложенный на тик вызов клиент уже не покажет.
      void ask();
    };

    const armTimer = window.setTimeout(() => {
      // `capture` — чтобы тап посчитался, даже если обработчик цели остановит
      // всплытие; `passive` — чтобы не задержать прокрутку.
      window.addEventListener('pointerdown', handleTap, {
        capture: true,
        once: true,
        passive: true,
      });
    }, ARM_DELAY_MS);

    return () => {
      window.clearTimeout(armTimer);
      window.removeEventListener('pointerdown', handleTap, { capture: true });
    };
  }, [canAsk, me, tourRunning, ask]);

  return null;
}
