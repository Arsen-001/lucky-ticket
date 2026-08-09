import type { ReactNode } from 'react';
import { PromoGiftBackdrop } from './PromoGiftBackdrop';

export interface PromoScreenShellProps {
  children: ReactNode;
}

/**
 * Full-bleed frame for the promo screen: the negative margins cancel the drawer
 * layout's own padding so the prize art runs to the edges of the phone, and the
 * flex column lets the backdrop cover the viewport even though the card is only
 * 380px of it.
 *
 * The card is centred with `my-auto` on the child, not `justify-center` here:
 * centred justification in a scroll container puts the overflow above the top
 * edge, where it cannot be scrolled to — the moment the card grows past the
 * viewport (an error line, a taller locale, the keyboard shrinking the screen)
 * its header would be unreachable. Auto margins collapse instead.
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
