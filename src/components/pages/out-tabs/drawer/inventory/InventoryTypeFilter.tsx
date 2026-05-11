'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Cpu, type LucideIcon, MemoryStick, Zap } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';

export type InventoryTypeFilterValue = 'all' | 'speed' | 'capacity' | 'boosters';

const TYPE_VALUES: InventoryTypeFilterValue[] = ['all', 'speed', 'capacity', 'boosters'];

interface TypeMeta {
  Icon: LucideIcon;
  iconColor: string;
  labelKey: MessageIds;
}

const TYPE_META: Record<Exclude<InventoryTypeFilterValue, 'all'>, TypeMeta> = {
  speed: {
    Icon: Cpu,
    iconColor: 'var(--color-electric-pink)',
    labelKey: 'time',
  },
  capacity: {
    Icon: MemoryStick,
    iconColor: 'var(--color-gold)',
    labelKey: 'capacity',
  },
  boosters: {
    Icon: Zap,
    iconColor: 'var(--color-electric-purple)',
    labelKey: 'boosters',
  },
};

export interface InventoryTypeFilterProps {
  value: InventoryTypeFilterValue;
  onChange: (next: InventoryTypeFilterValue) => void;
  className?: string;
}

export function InventoryTypeFilter({ value, onChange, className }: InventoryTypeFilterProps) {
  const t = useAppTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<InventoryTypeFilterValue, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const chip = chipRefs.current.get(value);
    if (!chip) return;
    setIndicator({ left: chip.offsetLeft, width: chip.offsetWidth });
  }, [value]);

  useEffect(() => {
    const handle = () => {
      const chip = chipRefs.current.get(value);
      if (!chip) return;
      setIndicator({ left: chip.offsetLeft, width: chip.offsetWidth });
    };
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, [value]);

  useEffect(() => {
    const chip = chipRefs.current.get(value);
    const wrap = scrollRef.current;
    if (!chip || !wrap) return;
    const chipCenter = chip.offsetLeft + chip.offsetWidth / 2;
    const wrapCenter = wrap.clientWidth / 2;
    wrap.scrollTo({ left: chipCenter - wrapCenter, behavior: 'smooth' });
  }, [value]);

  return (
    <div
      ref={scrollRef}
      className={twMerge('scrollbar-hidden relative overflow-x-auto scroll-smooth py-3', className)}
    >
      <div className="relative inline-flex items-center gap-2">
        {indicator && (
          <span
            aria-hidden
            className="bg-pink-gradient pointer-events-none absolute top-0 bottom-0 rounded-full transition-[transform,width] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: indicator.width,
              transform: `translateX(${indicator.left}px)`,
            }}
          />
        )}

        {TYPE_VALUES.map(type => {
          const active = type === value;
          const meta = type === 'all' ? null : TYPE_META[type];
          return (
            <button
              key={type}
              type="button"
              ref={el => {
                if (el) chipRefs.current.set(type, el);
                else chipRefs.current.delete(type);
              }}
              onClick={() => onChange(type)}
              aria-pressed={active}
              className={twMerge(
                'relative z-1 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-[12px] font-extrabold uppercase tracking-wider transition-colors duration-300 active:scale-95',
                active ? 'text-white' : 'text-white-secondary bg-white/5 hover:bg-white/10'
              )}
            >
              {meta && <meta.Icon size={13} stroke={meta.iconColor} strokeWidth={2.4} />}
              <span>{type === 'all' ? t('all') : t(TYPE_META[type].labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
