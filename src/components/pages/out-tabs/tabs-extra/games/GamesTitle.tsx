'use client';

import { PageHeader } from '@/components/layout-elements/PageHeader';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export function GamesTitle() {
  const t = useAppTranslations();
  return <PageHeader title={t('games')} />;
}
