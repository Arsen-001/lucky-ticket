import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { type Route, routes } from '@/constants/routes';

export const handleSafeBack = (router: AppRouterInstance, backRoute?: Route) => {
  if (backRoute) {
    router.push(backRoute);
    return;
  }

  const hasInternalReferrer =
    typeof document !== 'undefined' &&
    document.referrer &&
    document.referrer.includes(window.location.origin);

  if (typeof window !== 'undefined' && window.history.length > 1 && hasInternalReferrer) {
    router.back();
  } else {
    router.push(routes.home);
  }
};
