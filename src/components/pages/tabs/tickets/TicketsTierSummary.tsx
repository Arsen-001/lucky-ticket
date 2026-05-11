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
} from '@/components/pages/tabs/tickets/TicketsTierTabs';
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
                  isActive ? 'text-white' : 'bg-white/3 text-white-secondary hover:bg-white/6'
                )}
                style={
                  isActive
                    ? {
                        background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 30%, transparent) 0%, color-mix(in srgb, ${accent} 8%, transparent) 100%)`,
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
                <div className="flex-center relative h-[30px]">
                  {isPartners ? (
                    <Handshake
                      className={twMerge(
                        'h-5 w-5 shrink-0 transition-opacity duration-300',
                        isActive ? 'text-white' : 'text-electric-pink/80'
                      )}
                      strokeWidth={2.4}
                    />
                  ) : (
                    <TicketOverlap
                      type={tab.key as TicketType}
                      width={38}
                      height={30}
                      className={tab.locked ? 'opacity-55' : undefined}
                    />
                  )}
                </div>
                {tab.locked && (
                  <span
                    className="flex-center absolute bottom-0.5 right-0.5 h-[12px] w-[12px] rounded-full bg-black/80"
                    style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.18)' }}
                  >
                    <Lock size={7} strokeWidth={2.6} className="text-white" />
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
