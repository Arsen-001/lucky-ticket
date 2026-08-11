'use client';

import '@/styles/components/stakes.css';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';

/**
 * The "new stake" button — pinned to the app column, not to the window.
 *
 * It used to be a bare `fixed right-5 bottom-14`, which anchors to the
 * VIEWPORT. The app renders as a centred `--app-max-w` (430px) column, so the
 * moment the window is wider than that the button tears away from the content
 * and rides the window's right edge: measured at 1728px wide it sat 629px to
 * the right of the column it belongs to, and it moved with every resize. On a
 * 430px phone the two edges coincide, which is why it looked fine.
 *
 * The fix is the same one the new-stake CTA uses: a full-width fixed rail that
 * is itself capped at `--app-max-w` and centred, with the button positioned
 * inside it. The rail is `pointer-events-none` so it never eats taps outside
 * the button. Vertically it now rides `--tg-inset-bottom` (Telegram's reported
 * inset, falling back to `env(safe-area-inset-bottom)`) instead of a literal
 * 3.5rem, so the gap under it is the same everywhere and only a device with a
 * home indicator lifts it.
 */
export function StakesNewStakeFab() {
  const t = useAppTranslations();

  return (
    <ClientPortal>
      <div
        className="pointer-events-none fixed inset-x-0 z-9 mx-auto flex max-w-[var(--app-max-w)] justify-end px-5"
        style={{ bottom: 'calc(1.25rem + var(--tg-inset-bottom))' }}
      >
        <Link
          href={routes.stakes.new}
          aria-label={t('new stake')}
          title={t('new stake')}
          className="stakes-btn-glow pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_12px_28px_rgba(222,0,155,0.5),inset_0_1px_0_rgba(255,255,255,0.25)]"
          style={{ background: 'linear-gradient(135deg, #DE009B 0%, #743DF5 100%)' }}
        >
          <Plus size={24} strokeWidth={2.6} />
        </Link>
      </div>
    </ClientPortal>
  );
}
