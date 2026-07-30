'use client';

import { useEffect, useRef } from 'react';
import { Handshake, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import {
  PARTNERS_TAB_KEY,
  type TicketsTabKey,
  type TicketsTierTab,
} from '@/components/pages/tabs/tickets/tickets-tabs.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import type { TicketType } from '@/types/types/ticket.types';

const PARTNERS_COLOR = 'var(--color-electric-pink)';

const tierAccent = (key: TicketsTabKey): string =>
  key === PARTNERS_TAB_KEY ? PARTNERS_COLOR : `var(--color-${key as TicketType})`;

export interface TicketsTierSummaryProps extends ClassNameProps {
  tabs: TicketsTierTab[];
  loading?: boolean;
  active: TicketsTabKey;
  onChange: (key: TicketsTabKey) => void;
}

export function TicketsTierSummary({
  tabs,
  loading,
  active,
  onChange,
  className,
}: TicketsTierSummaryProps) {
  const t = useAppTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<TicketsTabKey, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const chip = chipRefs.current.get(active);
    const wrap = scrollRef.current;
    if (!chip || !wrap) return;
    const chipCenter = chip.offsetLeft + chip.offsetWidth / 2;
    const wrapCenter = wrap.clientWidth / 2;
    wrap.scrollTo({ left: chipCenter - wrapCenter, behavior: 'smooth' });
  }, [active]);

  return (
    <div className={twMerge('relative', className)}>
      <div ref={scrollRef} className="scrollbar-hidden relative overflow-x-auto scroll-smooth">
        <div className="relative inline-flex items-stretch gap-2">
          {tabs.map(tab => {
            const isActive = tab.key === active;
            const isPartners = tab.key === PARTNERS_TAB_KEY;
            const accent = tierAccent(tab.key);
            return (
              <button
                key={tab.key}
                type="button"
                ref={el => {
                  if (el) chipRefs.current.set(tab.key, el);
                  else chipRefs.current.delete(tab.key);
                }}
                onClick={() => onChange(tab.key)}
                aria-pressed={isActive}
                className={twMerge(
                  'relative flex w-[72px] shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl px-2 py-2 transition-colors duration-300 active:scale-[0.96]',
                  isActive
                    ? 'text-white'
                    : 'bg-background-overlay text-white-secondary hover:bg-white/10'
                )}
                style={
                  isActive
                    ? {
                        // Mixed into the card tone rather than into `transparent`:
                        // a see-through chip on the atmospheric backdrop picked up
                        // the sky and stopped reading as a chip at all.
                        background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 30%, var(--color-background-overlay)) 0%, color-mix(in srgb, ${accent} 8%, var(--color-background-overlay)) 100%)`,
                      }
                    : undefined
                }
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
                    style={{
                      background:
                        'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%)',
                    }}
                  />
                )}
                <div className="flex-center relative h-[56px]">
                  {isPartners ? (
                    <Handshake
                      className={twMerge(
                        'h-8 w-8 shrink-0 transition-opacity duration-300',
                        isActive ? 'text-white' : 'text-electric-pink/80'
                      )}
                      strokeWidth={2.4}
                    />
                  ) : (
                    <TicketOverlap
                      type={tab.key as TicketType}
                      width={64}
                      height={52}
                      className={tab.locked ? 'opacity-55' : undefined}
                    />
                  )}
                </div>
                {/* Top corner, not bottom — the bottom row belongs to the label
                    and a badge there overlaps long names ("Platinum"). */}
                {tab.locked && (
                  <span
                    className="flex-center absolute top-1 right-1 h-[14px] w-[14px] rounded-full bg-black/80"
                    style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.18)' }}
                  >
                    <Lock size={8} strokeWidth={2.6} className="text-white" />
                  </span>
                )}
                {/* Claimable-engines badge — the pull signal that tells the
                    player which tier has tickets waiting without tab-hopping. */}
                {!tab.locked && tab.count > 0 && (
                  <span className="bg-success absolute top-1 right-1 flex-center h-4 min-w-4 rounded-full px-1 text-[9px] font-extrabold leading-none text-white shadow-[0_0_8px_rgba(74,222,128,0.7)]">
                    {tab.count}
                  </span>
                )}
                <SkeletonSuspense
                  loading={loading}
                  skeleton={<Skeleton className="h-3.5 w-8" variant="line" />}
                >
                  <span className="relative text-[12px] font-extrabold capitalize leading-none text-white">
                    {isPartners ? t('partners') : t(tab.key as TicketType)}
                  </span>
                </SkeletonSuspense>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
