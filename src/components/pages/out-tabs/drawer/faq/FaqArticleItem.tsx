import { ChevronRight, FileText } from 'lucide-react';
import NextLink from 'next/link';
import { type FaqArticleMeta } from '@/types/interfaces/faq.interfaces';
import { routes } from '@/constants/routes';
import { HighlightedText } from '@/components/shared/typography/HighlightedText';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { getLocalizedText } from '@/utils/pages/faq.utils';
import { twMerge } from 'tailwind-merge';
import type { CSSProperties } from 'react';

export interface FaqArticleItemProps {
  article: FaqArticleMeta;
  locale: string;
  loading?: boolean;
  searchValue?: string;
  className?: string;
  style?: CSSProperties;
}

export function FaqArticleItem({
  article,
  locale,
  loading,
  searchValue = '',
  className,
  style,
}: FaqArticleItemProps) {
  const rowClassName = twMerge(
    'group bg-background-overlay/50 hover:bg-white/5 flex items-center gap-3 rounded-2xl border border-white/5 p-3 transition-colors active:scale-99',
    className
  );

  const face = (
    <>
      <div className="bg-electric-pink/15 border-electric-pink/30 flex-center h-9 w-9 flex-shrink-0 rounded-lg border">
        <FileText size={16} className="text-electric-pink" strokeWidth={2.2} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" textSize="sm" className="h-4 w-2/3" />}
        >
          <HighlightedText
            highlight={searchValue}
            className="truncate text-sm font-bold text-white"
          >
            {getLocalizedText(article.title, locale)}
          </HighlightedText>
        </SkeletonSuspense>
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" textSize="xs" className="h-3 w-full" />}
        >
          <HighlightedText
            highlight={searchValue}
            className="text-pink-secondary truncate text-[11px] font-medium"
          >
            {getLocalizedText(article.description, locale)}
          </HighlightedText>
        </SkeletonSuspense>
      </div>
      <ChevronRight
        size={16}
        className="text-pink-secondary group-hover:text-white flex-shrink-0 transition-colors"
        strokeWidth={2.2}
      />
    </>
  );

  // A placeholder row is NOT a link. It used to be one pointing at /faq itself,
  // so a tap on a skeleton reloaded the screen the player was already on — and,
  // because the title is the only text a row carries, a screen reader met eight
  // links in a row with no name at all. `a11y.spec.ts` caught that on a loaded
  // CI runner, where the list is still loading 1.5s in; on a fast machine the
  // data always won the race and the defect was invisible. `aria-hidden`
  // because a skeleton has nothing to announce.
  if (loading) {
    return (
      <div style={style} className={rowClassName} aria-hidden>
        {face}
      </div>
    );
  }

  return (
    <NextLink href={routes.faq.getById(article.id)} style={style} className={rowClassName}>
      {face}
    </NextLink>
  );
}
