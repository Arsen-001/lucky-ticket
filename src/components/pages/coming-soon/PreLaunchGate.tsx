'use client';

import { usePreLaunchGate } from '@/hooks/usePreLaunchGate';
import { TelegramSplash } from '@/components/telegram/TelegramSplash';
import { MaintenanceScreen } from '@/components/shared/status/MaintenanceScreen';
import { appConfig } from '@/config/app.config';
import { getDeviceKind } from '@/lib/telegram/platform';
import { ComingSoonScreen } from './ComingSoonScreen';
import { OpenInTelegramScreen } from './OpenInTelegramScreen';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';

/**
 * Decides, on every open, whether this person gets the app, the countdown or
 * the maintenance wall.
 *
 * It wraps the provider tree rather than living inside it, and it renders
 * `{children}` only on an explicit "open". An unrendered element never
 * executes, so while the gate holds, no page, provider, store or query is
 * mounted — the app genuinely does not boot, and every route (deep links and
 * drawer routes included) resolves to the one screen.
 *
 * The undecided moment shows the app's own boot splash, not the countdown: a
 * player who IS allowed in would otherwise see "coming soon" flash before their
 * app, and read it as the product being broken. The countdown appears only once
 * the answer is actually "no".
 *
 * **A computer never gets the app, and never gets the countdown either.** The
 * QR screen sits directly under the splash: the product is a phone product, so
 * a desktop visitor is sent to their phone before anything else is decided
 * about them — the countdown, its invite block and its gift ladder all live on
 * the other side of that. Phones are never affected, whatever the switch says.
 * @see OpenInTelegramScreen
 *
 * **Maintenance is checked first, above everything.** Turning it on in the panel
 * has to close the product for real, and before this the pre-launch countdown
 * was a hole in exactly that: the gate answered "gated" and returned the
 * countdown — a screen that invites friends and files gift claims against a
 * backend that is answering 503 to everything else. So the wrench replaces the
 * countdown too, and the same screen the running app shows.
 */
export function PreLaunchGate({ children }: ChildrenProps) {
  const { status, launchAt, session, maintenance, desktopBlocked, recheck } = usePreLaunchGate();

  // The local flag is the dev/mock override (there is no backend to ask in mock
  // mode); the second half is the admin switch, decided per person by the
  // backend — staff and the allow-list are already excused there.
  if (appConfig.maintenance.enabled || maintenance)
    return <MaintenanceScreen onRetry={recheck} loading={status === 'checking'} />;
  if (status === 'checking') return <TelegramSplash />;
  if (desktopBlocked) return <OpenInTelegramScreen deviceKind={getDeviceKind()} />;
  if (status === 'gated') return <ComingSoonScreen launchAt={launchAt} session={session} />;
  return <>{children}</>;
}
