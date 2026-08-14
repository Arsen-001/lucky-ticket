'use client';

import { useState } from 'react';
import { ChevronDown, Lock, Unlock, UserPlus } from 'lucide-react';
import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import type { ActivityTier } from '@/constants/global.constants';

export interface ActivityPerksDisclosureProps {
  tier: ActivityTier;
  nextTier: ActivityTier | null;
  /** Friends still missing for the next tier. */
  refGap: number;
}

/**
 * What the tier unlocks, folded away — the jackpot screen's treatment of its
 * mechanic. Three static sentences a player reads once, if ever, were holding a
 * whole section at the bottom of the screen.
 */
export function ActivityPerksDisclosure({ tier, nextTier, refGap }: ActivityPerksDisclosureProps) {
  const t = useAppTranslations();
  const [open, setOpen] = useState(false);
  const accent = `var(--color-${tier})`;

  return (
    <section className="border-b border-white/5">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 py-3 text-start"
      >
        <span className="text-[14px] font-bold text-white">{t('what your tier unlocks')}</span>
        <ChevronDown
          size={19}
          aria-hidden
          className={`text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="animate-fade-in flex flex-col gap-2 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="flex-center h-8 w-8 shrink-0 rounded-lg"
              style={{
                backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
                color: accent,
              }}
            >
              <Unlock size={15} strokeWidth={2.2} />
            </div>
            <span className="text-white-secondary text-[13px]">
              {t('tier unlocks engines tournaments stakes market', { tier: t(tier) })}
            </span>
          </div>

          {nextTier && (
            <div className="flex items-center gap-3">
              <div className="flex-center h-8 w-8 shrink-0 rounded-lg bg-white/5 text-white/45">
                <Lock size={14} strokeWidth={2.2} />
              </div>
              <span className="text-white-secondary text-[13px]">
                {t('reach tier to unlock more', { tier: t(nextTier) })}
              </span>
            </div>
          )}

          {nextTier && refGap > 0 && (
            <Link href={routes.inviteFriends} className="flex items-center gap-3">
              <div className="flex-center bg-pink/15 text-pink h-8 w-8 shrink-0 rounded-lg">
                <UserPlus size={14} strokeWidth={2.2} />
              </div>
              <span className="text-white-secondary text-[13px]">
                {t('and invite {n} more friends', { n: refGap })}
              </span>
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
