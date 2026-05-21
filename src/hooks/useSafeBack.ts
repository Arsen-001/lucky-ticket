import { useRouter } from 'next/navigation';
import { type Route, routes } from '@/constants/routes';
import { useNavigationHistory } from '@/providers/NavigationHistoryProvider';

/**
 * Returns a handler that goes back to the previous in-app page when possible.
 * Falls back to `backRoute` (or home) when the page was opened directly — e.g. a deep link —
 * so `router.back()` never escapes the app.
 */
export function useSafeBack(backRoute?: Route) {
  const router = useRouter();
  const { canGoBack } = useNavigationHistory();

  return () => {
    if (canGoBack()) {
      router.back();
      return;
    }

    router.push(backRoute ?? routes.home);
  };
}
