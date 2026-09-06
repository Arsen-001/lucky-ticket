import { Suspense } from 'react';
import { HomeScreens } from '@/components/pages/tabs/home/HomeScreens';

/**
 * Главная. Что на ней стоит первым — Тикки или движки — решает стадия выката
 * фичи `tikkiClicker`: пока она закрыта, страница ровно та же, что и была.
 *
 * `Suspense` обязателен: какой из двух экранов открыт, `HomeScreens` читает из
 * адреса через `useSearchParams`, а без границы такой хук роняет сборку.
 */
export default function HomePage() {
  return (
    <Suspense>
      <HomeScreens />
    </Suspense>
  );
}
