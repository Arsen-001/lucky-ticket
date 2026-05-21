'use client';

import { PageHeader } from '@/components/layout-elements/PageHeader';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';

export default function NewStakeHeader() {
  const t = useAppTranslations();
  return <PageHeader title={t('new stake')} backRoute={routes.stakes.index} />;
}
