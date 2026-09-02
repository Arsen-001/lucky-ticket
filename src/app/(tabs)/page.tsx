import { HomeScreens } from '@/components/pages/tabs/home/HomeScreens';

/**
 * Главная. Что на ней стоит первым — Тикки или движки — решает стадия выката
 * фичи `tikkiClicker`: пока она закрыта, страница ровно та же, что и была.
 */
export default function HomePage() {
  return <HomeScreens />;
}
