'use client';

import { PageHeader } from '@/components/layout-elements/PageHeader';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export default function ReadyStakeHeader() {
  const t = useAppTranslations();
  return <PageHeader title={t('rewards ready')} />;
}
