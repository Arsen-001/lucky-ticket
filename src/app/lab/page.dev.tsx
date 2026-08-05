import { LabScreen } from '@/components/pages/lab/LabScreen';

/**
 * Design lab, development only.
 *
 * The `.dev.tsx` extension IS the guard: `pageExtensions` in `next.config.ts`
 * accepts it under `next dev` and not under `next build`, so this route does
 * not exist in production — `/lab` there is an unmatched URL, answered like
 * any other one (404, then `global-not-found` sends the player Home).
 *
 * That matters because the front-end is deployed from the working tree rather
 * than from a Git ref, so a scratch page left lying around WOULD ship. The
 * previous guard — `notFound()` on `NODE_ENV` — did keep the lab off the
 * screen, but the route still existed and answered **200**: the response is
 * already committed by the time the page body runs, so it could no longer
 * correct the status (verified against a production build 2026-08-05).
 *
 * @see src/components/pages/lab/LabScreen
 */
export default function LabPage() {
  return <LabScreen />;
}
