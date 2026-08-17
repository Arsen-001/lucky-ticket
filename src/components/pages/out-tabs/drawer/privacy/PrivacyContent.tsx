'use client';

import { formatLocalDate } from '@/utils/global/date.utils';
import { ShieldCheck } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useGetPrivacyPolicyQuery } from '@/api/privacy.api';
import { PageDisabledState } from '@/components/shared/error/PageDisabledState';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useContentPagesEnabled } from '@/hooks/useContentPagesEnabled';
import { PrivacySectionBlock } from './PrivacySectionBlock';
import type { PrivacySection } from '@/types/interfaces/privacy.interfaces';

const SKELETON_SECTIONS = new Array(5).fill(undefined) as (PrivacySection | undefined)[];

export function PrivacyContent() {
  const t = useAppTranslations();
  const locale = useLocale();
  // Switched off in the panel ⇒ don't ask for the text: the endpoint answers
  // 404 while the page is off, and that would draw a retry the player can't win.
  const { privacy: enabled } = useContentPagesEnabled();
  const { data, isLoading, isError, refetch } = useGetPrivacyPolicyQuery(undefined, {
    skip: !enabled,
  });

  if (!enabled) return <PageDisabledState />;
  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  const sections = isLoading ? SKELETON_SECTIONS : (data?.sections ?? []);

  return (
    <div className="flex flex-col gap-5 px-4 pb-10 pt-2">
      <div className="flex items-center gap-3">
        <div className="bg-electric-purple/15 border-electric-purple/30 flex-center h-11 w-11 flex-shrink-0 rounded-xl border">
          <ShieldCheck size={20} className="text-electric-purple" strokeWidth={2.4} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-base font-extrabold leading-tight text-white">
            {t('privacy policy')}
          </h1>
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
          <PrivacySectionBlock
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
