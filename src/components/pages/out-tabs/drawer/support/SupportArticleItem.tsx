import { ChevronRight, FileText } from 'lucide-react';
import NextLink from 'next/link';
import { type SupportArticleMeta } from '@/types/interfaces/support.interfaces';
import { routes } from '@/constants/routes';
import { HighlightedText } from '@/components/shared/typography/HighlightedText';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { twMerge } from 'tailwind-merge';
import type { CSSProperties } from 'react';

export interface SupportArticleItemProps {
  article: SupportArticleMeta;
  loading?: boolean;
  searchValue?: string;
  className?: string;
  style?: CSSProperties;
}

export function SupportArticleItem({
  article,
  loading,
  searchValue = '',
  className,
  style,
}: SupportArticleItemProps) {
  return (
    <NextLink
      href={loading ? routes.support.index : routes.support.getById(article.id)}
      style={style}
      className={twMerge(
        'group bg-background-overlay/50 hover:bg-white/5 flex items-center gap-3 rounded-2xl border border-white/5 p-3 transition-colors active:scale-99',
        className
      )}
    >
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
            {article.title}
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
            {article.description}
          </HighlightedText>
        </SkeletonSuspense>
      </div>
      <ChevronRight
        size={16}
        className="text-pink-secondary group-hover:text-white flex-shrink-0 transition-colors"
        strokeWidth={2.2}
      />
    </NextLink>
  );
}
