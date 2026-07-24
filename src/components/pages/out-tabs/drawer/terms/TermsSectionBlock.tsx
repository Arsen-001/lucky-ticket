import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { getLocalizedText } from '@/utils/pages/faq.utils';
import type { TermsSection } from '@/types/interfaces/terms.interfaces';

interface TermsSectionBlockProps {
  section?: TermsSection;
  loading?: boolean;
  index: number;
  locale: string;
}

export function TermsSectionBlock({ section, loading, index, locale }: TermsSectionBlockProps) {
  return (
    <section
      className="bg-background-overlay/40 animate-slide-in-bottom flex flex-col gap-2 rounded-2xl border border-white/5 p-4"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-2.5">
        <span className="bg-electric-pink/15 text-electric-pink flex-center h-6 w-6 flex-shrink-0 rounded-md text-[11px] font-extrabold tabular-nums">
          {index + 1}
        </span>
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" textSize="sm" className="h-4 w-40" />}
        >
          <h2 className="text-[15px] font-extrabold leading-tight text-white">
            {getLocalizedText(section?.title, locale)}
          </h2>
        </SkeletonSuspense>
      </div>
      <SkeletonSuspense
        loading={loading}
        skeleton={
          <div className="flex flex-col gap-1.5 pl-8.5">
            <Skeleton variant="line" textSize="xs" className="h-3 w-full" />
            <Skeleton variant="line" textSize="xs" className="h-3 w-full" />
            <Skeleton variant="line" textSize="xs" className="h-3 w-3/4" />
          </div>
        }
      >
        <p className="text-white-secondary pl-8.5 text-[13px] leading-relaxed">
          {getLocalizedText(section?.body, locale)}
        </p>
      </SkeletonSuspense>
    </section>
  );
}
