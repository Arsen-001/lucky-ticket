'use client';

import { useLocale } from 'next-intl';
import { PageHeader } from '@/components/layout-elements/PageHeader';
import { useGetFaqArticleByIdQuery } from '@/api/faq.api';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import type { HTMLAttributes } from 'react';
import { FaqShareButton } from './FaqShareButton';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useContentPagesEnabled } from '@/hooks/useContentPagesEnabled';
import { getLocalizedText } from '@/utils/pages/faq.utils';

interface FaqArticleTitleProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
}

export function FaqArticleTitle({ id, ...props }: FaqArticleTitleProps) {
  const t = useAppTranslations();
  const locale = useLocale();
  // This header is a parallel route with its own copy of the article query, so
  // it needs the switch too: with the FAQ off the article endpoint 404s, and
  // the header would sit on an empty title next to a share button offering a
  // link to the stub below it.
  const { faq: enabled } = useContentPagesEnabled();
  const { data, isLoading } = useGetFaqArticleByIdQuery(id, { skip: !enabled });

  if (!enabled) return <PageHeader {...props} backRoute={routes.faq.index} title={t('faq')} />;

  return (
    <PageHeader
      {...props}
      backRoute={routes.faq.index}
      extra={
        <FaqShareButton
          id={id}
          title={data ? getLocalizedText(data.title, locale) : undefined}
          loading={isLoading}
        />
      }
      title={
        <SkeletonSuspense
          loading={isLoading}
          skeleton={<Skeleton variant="line" textSize="lg" className="w-42 mx-auto" />}
        >
          {data ? getLocalizedText(data.title, locale) : undefined}
        </SkeletonSuspense>
      }
    />
  );
}
