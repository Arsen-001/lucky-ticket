import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

export interface FaqArticleBodyProps {
  /** Localized article body. May contain blank-line-separated paragraphs. */
  content?: string;
  /** Localized one-line summary shown as a lead above the body. */
  lead?: string;
  loading?: boolean;
}

export function FaqArticleBody({ content, lead, loading }: FaqArticleBodyProps) {
  const paragraphs = (content ?? '')
    .split(/\n\s*\n|\n/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="pb-4">
      <SkeletonSuspense
        loading={loading}
        skeleton={
          <div className="bg-background-overlay/40 flex flex-col gap-2.5 rounded-2xl border border-white/5 p-4">
            <Skeleton variant="line" textSize="xs" className="h-3 w-1/3" />
            <Skeleton variant="text" lines={7} textSize="sm" className="w-full" />
          </div>
        }
      >
        <article className="bg-background-overlay/40 animate-slide-in-bottom flex flex-col gap-3 rounded-2xl border border-white/5 p-4">
          {lead && (
            <p className="text-pink-secondary text-[13px] font-medium leading-snug">{lead}</p>
          )}
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-white-secondary text-sm leading-relaxed">
              {paragraph}
            </p>
          ))}
        </article>
      </SkeletonSuspense>
    </div>
  );
}
