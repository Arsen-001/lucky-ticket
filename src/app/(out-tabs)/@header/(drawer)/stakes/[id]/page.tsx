'use client';

import { PageHeader } from '@/components/layout-elements/PageHeader';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';

export default function ProgressStakeHeader() {
  const t = useAppTranslations();
  return <PageHeader title={t('stake in progress')} backRoute={routes.stakes.index} />;
}
