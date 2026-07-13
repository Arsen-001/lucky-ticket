import ProjectNameLoader from '@/components/shared/loaders/ProjectNameLoader';

// Suspense boundary for tab navigation. Prefetch + the optimistic chip in
// TabBar make transitions commit from cache, so this rarely shows — it's the
// safety net for a cold tap: the header/tab-bar stay put (shared layout) while
// the page area shows this loader until the route commits, then the page's own
// skeletons take over.
export default function Loading() {
  return (
    <div className="h-full flex-center">
      <ProjectNameLoader />
    </div>
  );
}
