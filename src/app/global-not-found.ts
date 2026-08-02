import { redirect } from 'next/navigation';
import { routes } from '@/constants/routes';

/**
 * Every unmatched URL lands on Home. Inside a Mini App there is no address bar
 * to correct a bad link with, so a 404 screen is a dead end — the only way out
 * would be to close the app.
 *
 * `force-dynamic` is what makes that true in production. Without it Next
 * prerenders `/_not-found` at build time, and a build-time render cannot
 * perform a per-request redirect: production served Next's bare
 * `__next_error__` shell — a blank page — while `next dev`, which renders on
 * demand, redirected correctly. So the dead end existed only in the build
 * nobody runs locally.
 */
export const dynamic = 'force-dynamic';

export default function GlobalNotFound() {
  redirect(routes.home);
}
