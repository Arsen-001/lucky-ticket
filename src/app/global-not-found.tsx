import { routes } from '@/constants/routes';

/**
 * Every unmatched URL lands on Home. Inside a Mini App there is no address bar
 * to correct a bad link with, so a 404 screen is a dead end — the only way out
 * would be to close the app.
 *
 * It gets there by META REFRESH, not by `redirect()`. A not-found render keeps
 * the 404 status, and a browser does not follow `Location:` on a 404 — so the
 * old server redirect shipped a 404 carrying a header nobody acted on, and the
 * player sat on Next's blank `__next_error__` shell until the client router
 * eventually caught up (verified in production 2026-08-05: `/zzz-nope-404`
 * answered `404` + `location: /` and the page stayed empty for seconds). A
 * refresh meta works ON a 404, needs no JavaScript, and fires before hydration.
 *
 * The status stays a truthful 404. `force-dynamic` keeps this rendering per
 * request: prerendered at build time, Next serves the bare error shell instead.
 *
 * This page replaces the root layout, so it renders outside every provider —
 * no i18n, no global stylesheet. Hence the inline background (the theme's
 * `--color-background`), which only has to prevent a white flash before the
 * refresh takes effect.
 */
export const dynamic = 'force-dynamic';

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="refresh" content={`0; url=${routes.home}`} />
      </head>
      <body style={{ margin: 0, minHeight: '100vh', backgroundColor: '#1b1930' }} />
    </html>
  );
}
