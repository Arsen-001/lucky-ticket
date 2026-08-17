'use client';

import type { CSSProperties } from 'react';
import { BookOpen } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useContentPagesEnabled } from '@/hooks/useContentPagesEnabled';
import { routes } from '@/constants/routes';
import { SupportActionRow } from './SupportActionRow';

export interface SupportFaqLinkProps {
  className?: string;
  style?: CSSProperties;
}

export function SupportFaqLink({ className, style }: SupportFaqLinkProps) {
  const t = useAppTranslations();
  // The support screen is a server component, so the row hides itself: with the
  // FAQ switched off in the panel this is the last door left open to a page
  // that only answers with a stub.
  const { faq: faqEnabled } = useContentPagesEnabled();

  if (!faqEnabled) return null;

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
