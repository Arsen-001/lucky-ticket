'use client';

import { BackButton } from '@/components/shared/buttons/BackButton';
import { useSafeBack } from '@/hooks/useSafeBack';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import '@/styles/components/duel.css';

/**
 * Шапка экрана дуэли — своя, а не общий `PageHeader`.
 *
 * Общая стоит на атмосферном фоне приложения: над игрой светили лучи, а под
 * ней лежал тёмный стол, и шов между ними был виден с первого захода. Здесь
 * шапка — верхняя кромка того же стола: та же земля, тот же свет лампы (она
 * висит над ней, поэтому пятно тут ярче всего), неоновая волосяная линия снизу
 * и кнопка «назад» в той же оправе, что и остальные блоки игры.
 *
 * Название набрано разрядкой в верхнем регистре — как подписи внутри игры, а
 * не как заголовок страницы приложения.
 */
export function DuelTitle() {
  const t = useAppTranslations();
  const handleBack = useSafeBack();

  return (
    <div className="duel-header relative flex items-center justify-between px-5 py-3">
      <BackButton onClick={handleBack} className="duel-rim bg-transparent" />

      <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-black tracking-[0.22em] text-white uppercase">
        {t('duel')}
      </h1>

      {/* Балансир под кнопку: заголовок стоит по центру экрана, а не по центру
          оставшегося места. */}
      <span aria-hidden className="w-9" />
    </div>
  );
}
