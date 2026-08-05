'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useGetFaqSectionsQuery } from '@/api/faq.api';
import { FaqSearchInput } from './FaqSearchInput';
import { FaqArticleItem } from './FaqArticleItem';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { filterSections, getLocalizedText, getSectionsSkeletonData } from '@/utils/pages/faq.utils';
import { staggerMs } from '@/utils/global/animation.utils';

export function FaqContent() {
  const t = useAppTranslations();
  const locale = useLocale();
  const [searchValue, setSearchValue] = useState<string>('');
  const { data: sections = [], isLoading, isError, refetch } = useGetFaqSectionsQuery();

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  const filteredContent = filterSections(sections, searchValue, locale);
  const content = isLoading ? getSectionsSkeletonData() : filteredContent;
  const hasResults = content.some(section => !!section?.articles?.length);

  const sectionOffsets = content.reduce<number[]>(acc => {
    const last = acc[acc.length - 1] ?? 0;
    const lastLen = content[acc.length - 1]?.articles?.length ?? 0;
    acc.push(acc.length === 0 ? 0 : last + lastLen + 1);
    return acc;
  }, []);

  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-2">
      <FaqSearchInput onChange={setSearchValue} />

      {!isLoading && !hasResults && (
        <EmptyDataInfo animateOnMount className="mt-4" description={t('no articles found')} />
      )}

      <div className="flex flex-col gap-4">
        {content.map((section, sectionIndex) => {
          if (!section?.articles?.length) return null;
          const sectionOffset = sectionOffsets[sectionIndex] ?? 0;

          return (
            <div key={section.id ?? sectionIndex} className="flex flex-col gap-2">
              <SkeletonSuspense
                loading={isLoading}
                skeleton={<Skeleton variant="line" textSize="xs" className="h-3 w-32" />}
              >
                <h4
                  className="text-pink-secondary ml-1 animate-slide-in-bottom text-[10px] font-bold uppercase tracking-widest"
                  style={{ animationDelay: `${staggerMs(sectionOffset, 60)}ms` }}
                >
                  {getLocalizedText(section.title, locale)}
                </h4>
              </SkeletonSuspense>
              <div className="flex flex-col gap-2">
                {section.articles.map((article, articleIndex) => (
                  <FaqArticleItem
                    key={isLoading ? articleIndex : article.id}
                    loading={isLoading}
                    article={article}
                    locale={locale}
                    searchValue={searchValue}
                    className="animate-slide-in-bottom"
                    style={{
                      animationDelay: `${staggerMs(sectionOffset + articleIndex + 1, 60)}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
