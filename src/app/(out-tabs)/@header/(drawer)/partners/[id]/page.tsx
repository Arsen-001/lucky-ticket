'use client';

import { PageHeader } from '@/components/layout-elements/PageHeader';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';

export default function PartnerTournamentDetailHeader() {
  const t = useAppTranslations();
  return <PageHeader title={t('tournament details')} backRoute={routes.partners.index} />;
}
