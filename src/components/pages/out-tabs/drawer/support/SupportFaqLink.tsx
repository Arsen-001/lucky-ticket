'use client';

import type { CSSProperties } from 'react';
import { BookOpen } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import { SupportActionRow } from './SupportActionRow';

export interface SupportFaqLinkProps {
  className?: string;
  style?: CSSProperties;
}

export function SupportFaqLink({ className, style }: SupportFaqLinkProps) {
  const t = useAppTranslations();

  return (
    <SupportActionRow
      icon={BookOpen}
      accent="pink"
      route={routes.faq.index}
      title={t('browse faq')}
      description={t('browse faq description')}
      className={className}
      style={style}
    />
  );
}
