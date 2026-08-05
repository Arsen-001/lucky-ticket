'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';

interface NotificationsLoadMoreProps {
  onLoadMore: () => void;
  loading?: boolean;
}

/**
 * End-of-list sentinel for the paginated feed.
 *
 * Loads the next page by itself once it scrolls into view, and stays a real
 * button so the list is still walkable by keyboard and still finishes on a
 * device where the observer never fires.
 */
export function NotificationsLoadMore({ onLoadMore, loading }: NotificationsLoadMoreProps) {
  const t = useAppTranslations();
  const sentinel = useRef<HTMLDivElement>(null);
  // `onLoadMore` is a fresh closure every render; keeping it in a ref stops the
  // observer from being torn down and rebuilt on each one.
  const loadMore = useRef(onLoadMore);
  useEffect(() => {
    loadMore.current = onLoadMore;
  });

  useEffect(() => {
    const node = sentinel.current;
    // Not observed at all while a page is in flight, so one intersection can
    // never queue a second request for the same cursor. When the page lands the
    // observer is rebuilt, and if the sentinel is still on screen it simply
    // pulls the next one — which is what "keep scrolling" should do.
    if (!node || loading || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore.current();
      },
      // Start fetching a screenful early so the list rarely shows the seam.
      { rootMargin: '400px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loading]);

  return (
    <div ref={sentinel} className="flex-center pt-1">
      <Button
        variant="transparent"
        loading={loading}
        onClick={onLoadMore}
        className="text-pink-secondary h-9 rounded-xl border border-white/10 px-4 py-0 text-xs font-bold"
      >
        {t('load more')}
      </Button>
    </div>
  );
}
