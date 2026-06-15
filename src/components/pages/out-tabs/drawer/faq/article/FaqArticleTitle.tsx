'use client';

import { useLocale } from 'next-intl';
import { PageHeader } from '@/components/layout-elements/PageHeader';
import { useGetFaqArticleByIdQuery } from '@/api/faq.api';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import type { HTMLAttributes } from 'react';
import { CopyButton } from '@/components/shared/buttons/CopyButton';
import { routes } from '@/constants/routes';
import { getLocalizedText } from '@/utils/pages/faq.utils';
import { Share } from 'lucide-react';

interface FaqArticleTitleProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
}

export function FaqArticleTitle({ id, ...props }: FaqArticleTitleProps) {
  const locale = useLocale();
  const { data, isLoading } = useGetFaqArticleByIdQuery(id);

  return (
    <PageHeader
      {...props}
      backRoute={routes.faq.index}
      extra={
        //TODO: handle copy action
        <CopyButton
          loading={isLoading}
          value={'Some Text'}
          variant="secondary"
          className="p-2 text-sm"
          iconSize={18}
        >
          <Share size={18} />
        </CopyButton>
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
