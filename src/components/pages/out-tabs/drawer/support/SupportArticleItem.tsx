import Link from 'next/link';
import { type SupportArticleMeta } from '@/types/interfaces/support.interfaces';
import { routes } from '@/constants/routes';
import { ChevronRight } from 'lucide-react';
import { HighlightedText } from '@/components/shared/typography/HighlightedText';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

export interface SupportSectionItemProps {
  article: SupportArticleMeta;
  loading?: boolean;
  searchValue?: string;
}

export function SupportArticleItem({
  article,
  loading,
  searchValue = '',
}: SupportSectionItemProps) {
  return (
    <Link
      href={routes.support.getById(article.id)}
      className="overflow-hidden flex items-center justify-between gap-2 bg-purple-gradient px-4 py-3 rounded-xl transition-opacity active:opacity-80"
    >
      <div className="overflow-hidden flex-1 flex flex-col gap-px">
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" textSize="base" className="w-2/3" />}
        >
          <HighlightedText
            highlight={searchValue}
            className="text-white-secondary font-semibold text-base truncate"
          >
            {article.title}
          </HighlightedText>
        </SkeletonSuspense>
        <SkeletonSuspense
          loading={loading}
          skeleton={
            <div className="flex flex-col gap-1 mt-1">
              <Skeleton variant="line" textSize="xs" className="w-full" />
            </div>
          }
        >
          <HighlightedText
            highlight={searchValue}
            className="text-sm text-gray-secondary font-semibold truncate"
          >
            {article.description}
          </HighlightedText>
        </SkeletonSuspense>
      </div>
      <div>
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="card" className="w-6 h-6" />}
        >
          <ChevronRight size={24} />
        </SkeletonSuspense>
      </div>
    </Link>
  );
}
