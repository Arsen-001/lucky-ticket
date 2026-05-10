'use client';

import { Handshake } from 'lucide-react';
import { Info } from '@/components/shared/Info';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';

export function PartnersComingSoon({ className }: ClassNameProps) {
  const t = useAppTranslations();
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
