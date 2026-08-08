'use client';

import { RotateCcwSquare } from 'lucide-react';
import { usePortraitOnly } from '@/hooks/usePortraitOnly';
import { FullScreenStatus } from '@/components/shared/status/FullScreenStatus';

export interface PortraitOnlyGateProps {
  /**
   * Already translated, by the server layout. The wall is mounted OUTSIDE
   * `NextIntlClientProvider` on purpose — it has to outlive and outrank every
   * screen the app can show — so it cannot read the client dictionary, and
   * mounting a second provider around it would ship the whole message catalogue
   * twice. Two strings passed down cost nothing.
   */
  title: string;
  description: string;
}

/**
 * What a sideways phone sees: "turn it upright", and nothing else.
 *
 * The app is a 430px column built for a thumb — a phone in landscape leaves it
 * under 400px of height for a header, a scrolling screen and a tab bar, so the
 * modals, the engine cube and the tab bar all end up cropped. Rather than a
 * second layout nobody asked for, landscape is simply not a way to play.
 *
 * Mounted in the root layout **outside** `PreLaunchGate`, so it covers the boot
 * splash, the countdown, the maintenance wall and the app alike — every one of
 * those is equally unusable sideways.
 *
 * Always rendered, never conditionally: whether it is on screen is decided by a
 * media query (@see portrait-gate.css), which costs nothing while upright and
 * cannot be beaten to the first paint by a rotation. The hook it calls is the
 * other half — it asks Telegram not to rotate in the first place.
 */
export function PortraitOnlyGate({ title, description }: PortraitOnlyGateProps) {
  usePortraitOnly();

  return (
    <div className="portrait-gate" role="alertdialog" aria-label={title}>
      <FullScreenStatus
        icon={<RotateCcwSquare size={34} strokeWidth={2.2} />}
        title={title}
        description={description}
        accentClassName="bg-electric-purple/15 text-electric-purple"
      />
    </div>
  );
}
