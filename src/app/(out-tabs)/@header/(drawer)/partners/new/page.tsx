'use client';

import { PageHeader } from '@/components/layout-elements/PageHeader';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';

export default function NewPartnerTournamentHeader() {
  const t = useAppTranslations();
  return <PageHeader title={t('create')} backRoute={routes.partners.index} />;
}
