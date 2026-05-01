'use client';

import { PageHeader } from '@/components/layout-elements/PageHeader';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export default function ProgressStakeHeader() {
  const t = useAppTranslations();
  return <PageHeader title={t('stake in progress')} />;
}
