'use client';

import { useState } from 'react';
import { useGetSupportSectionsQuery } from '@/api/support.api';
import { GradientSearchInput } from '@/components/pages/out-tabs/drawer/support/GradientSearchInput';
import { SupportArticleItem } from '@/components/pages/out-tabs/drawer/support/SupportArticleItem';
import { SupportChannelCard } from '@/components/pages/out-tabs/drawer/support/SupportChannelCard';
import { SupportHeroCard } from '@/components/pages/out-tabs/drawer/support/SupportHeroCard';
import { SupportTelegramCard } from '@/components/pages/out-tabs/drawer/support/SupportTelegramCard';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { filterSections, getSectionsSkeletonData } from '@/utils/pages/support.utils';
import type { SupportSection } from '@/types/interfaces/support.interfaces';

export default function SupportPage() {
  const t = useAppTranslations();
  const [searchValue, setSearchValue] = useState<string>('');
  const { data: sections = [], isLoading, isError, refetch } = useGetSupportSectionsQuery();

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  const filteredContent = filterSections(sections, searchValue);
  const content = isLoading ? (getSectionsSkeletonData() as SupportSection[]) : filteredContent;
  const hasResults = content.some(section => !!section?.articles?.length);

  const sectionOffsets = content.reduce<number[]>(acc => {
    const last = acc[acc.length - 1] ?? 0;
    const lastLen = content[acc.length - 1]?.articles?.length ?? 0;
    acc.push(acc.length === 0 ? 0 : last + lastLen + 1);
    return acc;
  }, []);

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-2">
      <SupportHeroCard />
      <SupportTelegramCard />
      <SupportChannelCard />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-pink-secondary text-[11px] font-bold uppercase tracking-wider">
            {t('knowledge base')}
          </h3>
        </div>
        <GradientSearchInput onChange={setSearchValue} />

        {!isLoading && !hasResults && (
          <EmptyDataInfo animateOnMount className="mt-4" description={t('no articles found')} />
        )}

        <div className="flex flex-col gap-4">
          {content.map((section, sectionIndex) => {
            if (!section?.articles?.length) return null;
            const sectionOffset = sectionOffsets[sectionIndex] ?? 0;

            return (
              <div key={sectionIndex} className="flex flex-col gap-2">
                <SkeletonSuspense
                  loading={isLoading}
                  skeleton={<Skeleton variant="line" textSize="xs" className="h-3 w-32" />}
                >
                  <h4
                    className="text-pink-secondary ml-1 animate-slide-in-bottom text-[10px] font-bold uppercase tracking-widest"
                    style={{ animationDelay: `${sectionOffset * 60}ms` }}
                  >
                    {section?.title || ''}
                  </h4>
                </SkeletonSuspense>
                <div className="flex flex-col gap-2">
                  {section.articles.map((article, articleIndex) => (
                    <SupportArticleItem
                      key={isLoading ? articleIndex : article.id}
                      loading={isLoading}
                      article={article}
                      searchValue={searchValue}
                      className="animate-slide-in-bottom"
                      style={{
                        animationDelay: `${(sectionOffset + articleIndex + 1) * 60}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
