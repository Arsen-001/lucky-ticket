'use client';

import { useEffect, useRef } from 'react';
import { Handshake, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import type { TicketType } from '@/types/types/ticket.types';
import type { MessageIds } from '@/types/types/i18n.types';

export const PARTNERS_TAB_KEY = 'partners' as const;

export type TicketsTabKey = TicketType | typeof PARTNERS_TAB_KEY;

const TIER_ORDER: TicketType[] = [
  TicketsEnum.BRONZE,
  TicketsEnum.SILVER,
  TicketsEnum.GOLD,
  TicketsEnum.PLATINUM,
  TicketsEnum.DIAMOND,
];

const TIER_LABEL_KEY: Record<TicketType, MessageIds> = {
  bronze: 'bronze',
  silver: 'silver',
  gold: 'golden',
  platinum: 'platinum',
  diamond: 'diamond',
};

export interface TicketsTierTab {
  key: TicketsTabKey;
  count: number;
  locked?: boolean;
}

export interface TicketsTierTabsProps {
  active: TicketsTabKey;
  onChange: (key: TicketsTabKey) => void;
  tabs: TicketsTierTab[];
  className?: string;
}

const PARTNERS_COLOR = 'var(--color-electric-pink)';

const tierAccent = (key: TicketsTabKey): string =>
  key === PARTNERS_TAB_KEY ? PARTNERS_COLOR : `var(--color-${key as TicketType})`;

export function TicketsTierTabs({ active, onChange, tabs, className }: TicketsTierTabsProps) {
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
        <div className="relative inline-flex items-center gap-2">
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
                  'relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap shrink-0 active:scale-95 transition-colors duration-300 overflow-hidden',
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
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
                    style={{
                      background:
                        'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%)',
                    }}
                  />
                )}
                {isPartners ? (
                  <Handshake
                    className={twMerge(
                      'w-4 h-4 transition-opacity duration-300 shrink-0 relative',
                      isActive ? 'text-white' : 'text-electric-pink/80'
                    )}
                    strokeWidth={2.4}
                  />
                ) : tab.locked ? (
                  <Lock
                    className={twMerge(
                      'w-3.5 h-3.5 transition-opacity duration-300 shrink-0 relative',
                      isActive ? 'text-white/85' : 'text-white/50'
                    )}
                    strokeWidth={2.4}
                  />
                ) : (
                  <span className="relative">
                    <TicketOverlap type={tab.key as TicketType} width={20} height={15} />
                  </span>
                )}
                <span className="relative capitalize leading-none mt-[1px]">
                  {isPartners ? t('partners') : t(TIER_LABEL_KEY[tab.key as TicketType])}
                </span>
                {tab.count > 0 && (
                  <span className="relative text-[12px] font-bold tabular-nums leading-none text-white">
                    ×{tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const TICKETS_TIER_ORDER = TIER_ORDER;
