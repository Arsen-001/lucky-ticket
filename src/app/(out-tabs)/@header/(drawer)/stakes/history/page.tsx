'use client';

import { PageHeader } from '@/components/layout-elements/PageHeader';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';

export default function StakesHistoryHeader() {
  const t = useAppTranslations();
  return <PageHeader title={t('history')} backRoute={routes.stakes.index} />;
}
