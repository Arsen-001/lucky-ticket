'use client';

import { TikkiScreen } from '@/components/shared/tikki/TikkiScreen';
import { useFeature } from '@/hooks/useFeature';

/**
 * Тикки по своему адресу `/tikki` — тот же экран, что стоит на главной, плюс
 * пометка стенда и кнопка сброса: с главной их убрали, там место сцене.
 *
 * Адрес оставлен нарочно: на него ведут ссылки, и он открывается, когда главная
 * занята вторым экраном.
 */
export function TikkiContainer() {
  // Гейт тот же, что у главной: стадию решает сервер, экран не спорит.
  const enabled = useFeature('tikkiClicker');
  if (!enabled) return null;

  // Дровер-раскладка даёт свои 20 px по бокам, а у экрана Тикки поле 14 —
  // гасим чужое, чтобы колонка была той же, что и на главной.
  return <TikkiScreen stand className="-mx-5" />;
}
