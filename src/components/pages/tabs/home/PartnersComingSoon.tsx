import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import { getAppTranslations } from '@/i18n/getAppTranslations';
import { Info } from '@/components/shared/Info';
import { Handshake } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export async function PartnersComingSoon({ className }: ClassNameProps) {
  const t = await getAppTranslations();
  return (
    <Info
      icon={<Handshake />}
      title={t('coming soon')}
      description={t('partners coming soon description')}
      className={twMerge('bg-purple-gradient', className)}
    />
  );
}
