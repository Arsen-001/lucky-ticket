import type { ReactNode } from 'react';
import { PromoGiftBackdrop } from './PromoGiftBackdrop';

export interface PromoScreenShellProps {
  children: ReactNode;
}

/**
 * Full-bleed frame for the promo screen: the negative margins cancel the drawer
 * layout's own padding so the prize art runs to the edges of the phone, and the
 * flex column lets the backdrop cover the viewport even though the card only
 * fills the top 380px of it.
 */
export function PromoScreenShell({ children }: PromoScreenShellProps) {
  return (
    <div className="relative -mx-5 -mt-3 flex min-h-full flex-col overflow-hidden">
      <PromoGiftBackdrop />
      {/* flex-1, not min-h-full: a percentage min-height against an auto-height
          parent resolves to nothing. */}
      <div className="relative flex flex-1 flex-col px-5 pb-8 pt-5">{children}</div>
    </div>
  );
}
