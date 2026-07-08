'use client';

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TicketType } from '@/types/types/ticket.types';
import type { MessageIds } from '@/types/types/i18n.types';

const TIER_LABEL_KEY: Record<TicketType, MessageIds> = {
  bronze: 'bronze',
  silver: 'silver',
  gold: 'golden',
  platinum: 'platinum',
  diamond: 'diamond',
};

const TIER_GLOW: Record<TicketType, string> = {
  bronze: '#E08A3A',
  silver: '#D8D8D8',
  gold: '#FFD56A',
  platinum: '#E2E0D0',
  diamond: '#3FD9CF',
};

export interface TicketClaimedModalProps {
  open: boolean;
  tier: TicketType;
  count: number;
  onClose: () => void;
}

const useCounter = (target: number, durationMs = 700) => {
  const [value, setValue] = useState(0);
  const startedAt = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }
    setValue(0);
    startedAt.current = null;
    const tick = (ts: number) => {
      if (startedAt.current === null) startedAt.current = ts;
      const elapsed = ts - startedAt.current;
      const ratio = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - ratio, 3);
      setValue(Math.round(target * eased));
      if (ratio < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, durationMs]);

  return value;
};

export function TicketClaimedModal({ open, tier, count, onClose }: TicketClaimedModalProps) {
  const t = useAppTranslations();
  const counter = useCounter(open ? count : 0);
  const glow = TIER_GLOW[tier];
  const tierColor = `var(--color-${tier})`;

  return (
    <Modal open={open} onClose={onClose} hideCloseButton>
      <div
        className={twMerge(
          'relative rounded-2xl overflow-hidden w-full max-w-[340px] mx-auto px-6 pt-8 pb-6 flex flex-col items-center gap-4'
        )}
        style={{
          background: `radial-gradient(circle at 50% 0%, color-mix(in srgb, ${tierColor} 35%, transparent) 0%, transparent 60%), var(--gradient-purple-reverse)`,
        }}
      >
        <div
          aria-hidden
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full blur-3xl opacity-50 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${glow}, transparent 70%)` }}
        />

        <div className="relative flex-center">
          <TicketOverlap type={tier} width={120} height={88} />
        </div>

        <div className="relative flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-pink-secondary">
            {t('claimed')}
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className="text-[44px] font-extrabold text-white tabular-nums leading-none"
              style={{ textShadow: `0 0 20px color-mix(in srgb, ${glow} 50%, transparent)` }}
            >
              +{counter}
            </span>
            <span className="text-base font-bold text-white">{t(TIER_LABEL_KEY[tier])}</span>
          </div>
          <span className="text-[12px] text-white-secondary">
            {count === 1 ? t('ticket added to inventory') : t('tickets added to inventory')}
          </span>
        </div>

        <Button onClick={onClose} className="relative w-full mt-2">
          {t('continue')}
        </Button>
      </div>
    </Modal>
  );
}
