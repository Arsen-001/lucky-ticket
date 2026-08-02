'use client';

import { usePreLaunchGate } from '@/hooks/usePreLaunchGate';
import { TelegramSplash } from '@/components/telegram/TelegramSplash';
import { ComingSoonScreen } from './ComingSoonScreen';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';

/**
 * Decides, on every open, whether this person gets the app or the countdown.
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
 */
export function PreLaunchGate({ children }: ChildrenProps) {
  const { status, launchAt, session } = usePreLaunchGate();

  if (status === 'checking') return <TelegramSplash />;
  if (status === 'gated') return <ComingSoonScreen launchAt={launchAt} session={session} />;
  return <>{children}</>;
}
