'use client';

import { useCallback, useRef } from 'react';

/** Опора: 390×844 — на ней экран дуэли и нарисован. */
export const DUEL_DESIGN_WIDTH = 390;
/** Высота, которая на опоре остаётся под шапкой раздела. */
export const DUEL_DESIGN_HEIGHT = 782;

/**
 * Множитель экрана дуэли: макет рисуется РАЗ в 390×782 и целиком
 * масштабируется под телефон.
 *
 * Решение пользователя 24.08.2026: «берём всё как выглядит в 390×844, и на
 * остальных размерах должно выглядеть так же». Значит не перевёрстка под
 * ширину, а один множитель на весь экран: меньшее из «ширина/390» и
 * «высота/782». Композиция на 320-м телефоне ровно та же, что на опорном, —
 * только мельче; по бокам виден стол, а не пустые поля.
 *
 * Считается в JS, а не в CSS: CSS не умеет делить длину на длину, а лесенка
 * `@media` (как у куба на главной) знает только ширину — здесь же решает и
 * высота, потому что экран во весь рост.
 *
 * 🔴 Ref именно callback, а не `useRef` + `useEffect([])`: экран дуэли стоит за
 * гейтом выката, и первым рендером рисуется не он, а «игра недоступна» — узла
 * ещё нет. Эффект с пустыми зависимостями в этот момент отработал бы вхолостую
 * и больше не вызвался, а множитель так и остался бы пустым (проверено:
 * `--duel-fit` не выставлялся вовсе).
 */
export function useDuelFit<T extends HTMLElement>() {
  const observerRef = useRef<ResizeObserver | null>(null);

  return useCallback((area: T | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!area) return;

    const apply = () => {
      const { width, height } = area.getBoundingClientRect();
      if (!width || !height) return;
      const fit = Math.min(width / DUEL_DESIGN_WIDTH, height / DUEL_DESIGN_HEIGHT);
      // Округление до тысячных: иначе каждый кадр наблюдатель переписывает
      // переменную новым дробным значением и браузер перерисовывает весь стол.
      area.style.setProperty('--duel-fit', String(Math.round(fit * 1000) / 1000));
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(area);
    observerRef.current = observer;
  }, []);
}
