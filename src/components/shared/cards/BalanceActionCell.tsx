'use client';

import { Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface BalanceActionCellProps {
  Icon: LucideIcon;
  label: string;
  /** Marks the action closed without disabling it — the screen behind explains why. */
  locked?: boolean;
  /** Small pill after the label — a discount, a count, whatever the cell sells. */
  badge?: ReactNode;
}

/**
 * Inner contents of one cell of a balance card's action footer.
 *
 * Shared by the LC and Lucky Stars screens: both cards end in the same strip of
 * actions, and a cell that looked 1px different on one of them would read as
 * two unrelated screens rather than the same screen for two currencies.
 */
export function BalanceActionCell({ Icon, label, locked, badge }: BalanceActionCellProps) {
  return (
    <>
      <Icon
        size={15}
        strokeWidth={2.5}
        className={twMerge('flex-shrink-0', locked ? 'text-white/40' : 'text-gold')}
      />
      <span className={twMerge('truncate', locked ? 'text-white/50' : 'text-white/85')}>
        {label}
      </span>
      {badge}
      {/* Beside the label, not badged onto the glyph: at 15px the icon has no
          corner to spare and the padlock sat on top of the arrow. */}
      {locked && (
        <Lock size={10} strokeWidth={3} aria-hidden className="flex-shrink-0 text-white/45" />
      )}
    </>
  );
}
