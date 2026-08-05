'use client';

import { formatLocalDate } from '@/utils/global/date.utils';
import { ScrollText } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useGetTermsOfUseQuery } from '@/api/terms.api';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TermsSectionBlock } from './TermsSectionBlock';
import type { TermsSection } from '@/types/interfaces/terms.interfaces';

const SKELETON_SECTIONS = new Array(6).fill(undefined) as (TermsSection | undefined)[];

export function TermsContent() {
  const t = useAppTranslations();
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useGetTermsOfUseQuery();

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  const sections = isLoading ? SKELETON_SECTIONS : (data?.sections ?? []);

  return (
    <div className="flex flex-col gap-5 px-4 pb-10 pt-2">
      <div className="flex items-center gap-3">
        <div className="bg-electric-purple/15 border-electric-purple/30 flex-center h-11 w-11 flex-shrink-0 rounded-xl border">
          <ScrollText size={20} className="text-electric-purple" strokeWidth={2.4} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-base font-extrabold leading-tight text-white">{t('terms of use')}</h1>
          <SkeletonSuspense
            loading={isLoading}
            skeleton={<Skeleton variant="line" textSize="xs" className="mt-1 h-3 w-32" />}
          >
            {data && (
              <p className="text-pink-secondary mt-0.5 text-[11px] font-medium">
                {t('last updated {date}', {
                  date: formatLocalDate(data.updatedAt),
                })}
              </p>
            )}
          </SkeletonSuspense>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {sections.map((section, index) => (
          <TermsSectionBlock
            key={section?.id ?? index}
            section={section}
            loading={isLoading}
            index={index}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}
