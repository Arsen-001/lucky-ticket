'use client';

import { useGetSupportSectionsQuery } from '@/api/support.api';
import { GradientSearchInput } from '@/components/pages/out-tabs/drawer/support/GradientSearchInput';
import { SupportArticleItem } from '@/components/pages/out-tabs/drawer/support/SupportArticleItem';
import { useState } from 'react';
import { HighlightedText } from '@/components/shared/typography/HighlightedText';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { filterSections, getSectionsSkeletonData } from '@/utils/pages/support.utils';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { videos } from '@/constants/videos';
import { twMerge } from 'tailwind-merge';

export default function SupportPage() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const { data: sections = [], isLoading } = useGetSupportSectionsQuery();

  const filteredContent = filterSections(sections, searchValue);
  const content = isLoading ? getSectionsSkeletonData() : filteredContent;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div className="flex flex-col">
      <div
        className={twMerge(
          'flex justify-center transition-all duration-500 ease-in-out overflow-hidden',
          isFocused ? 'opacity-0 h-0 pointer-events-none' : 'opacity-100 h-34'
        )}
      >
        <div
          className={twMerge(
            'relative h-25 aspect-square overflow-hidden rounded-full transition-transform duration-500',
            isFocused && 'scale-90'
          )}
        >
          <video className="h-full scale-240" autoPlay loop muted playsInline>
            <source {...videos.support.mp4} />
            <source {...videos.support.webm} />
          </video>
        </div>
      </div>
      <div className="flex-col-stretch gap-6">
        <GradientSearchInput onChange={setSearchValue} onFocus={handleFocus} onBlur={handleBlur} />
        <div className="flex flex-col">
          {!isLoading && !filteredContent.length && (
            <EmptyDataInfo animateOnMount className="mt-10" />
          )}
          {content.map(
            (section, index) =>
              !!section?.articles?.length && (
                <div key={index} className="flex-col-stretch gap-1 mt-5">
                  <SkeletonSuspense
                    loading={isLoading}
                    skeleton={<Skeleton variant="line" textSize="base" className="w-42" />}
                  >
                    <HighlightedText
                      highlight={searchValue}
                      className="font-semibold text-white/80"
                    >
                      {section?.title || ''}
                    </HighlightedText>
                  </SkeletonSuspense>
                  <div className="flex-col-stretch gap-2">
                    {section?.articles?.map((article, index) => (
                      <SupportArticleItem
                        key={index}
                        loading={isLoading}
                        article={article}
                        searchValue={searchValue}
                      />
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
}
