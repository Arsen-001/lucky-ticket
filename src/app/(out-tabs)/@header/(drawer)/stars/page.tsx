'use client';

import { PageHeader } from '@/components/layout-elements/PageHeader';
import { StarsExchangeSavingBadge } from '@/components/shared/stars/StarsExchangeSavingBadge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export default function StarsHeader() {
  const t = useAppTranslations();

  // Top-right corner of the screen: how much cheaper Lucky Stars are here than
  // in Telegram, one tap from the sheet that sells them at that price.
  return <PageHeader title={t('stars wallet')} extra={<StarsExchangeSavingBadge />} />;
}
