import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import { getAppTranslations } from '@/i18n/getAppTranslations';
import { Info } from '@/components/shared/Info';
import { Handshake } from 'lucide-react';

export async function PartnersComingSoon({ className }: ClassNameProps) {
  const t = await getAppTranslations();
  return (
    <Info
      variant="purple-gradient"
      icon={<Handshake />}
      title={t('coming soon')}
      description={t('partners coming soon description')}
      className={className}
    />
  );
}
