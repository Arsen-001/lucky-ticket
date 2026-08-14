'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Hash } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetMeQuery } from '@/api/me.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

export interface SupportIdCardProps {
  className?: string;
  style?: CSSProperties;
}

export function SupportIdCard({ className, style }: SupportIdCardProps) {
  const t = useAppTranslations();
  const { data, isLoading } = useGetMeQuery();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Supplementary helper, not the screen's main query — if the id can't be
  // loaded, degrade silently instead of surfacing a QueryErrorState.
  if (!isLoading && !data?.id) return null;

  const handleCopy = async () => {
    if (!data?.id) return;
    try {
      await navigator.clipboard?.writeText(data.id);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={isLoading}
      aria-label={t('copy {label}', { label: t('user id') })}
      style={style}
      className={twMerge(
        'bg-background-overlay/50 flex items-center gap-3 rounded-2xl border border-white/5 p-3 text-start transition-colors active:scale-99',
        className
      )}
    >
      <div className="bg-electric-purple/15 border-electric-purple/30 flex-center h-9 w-9 flex-shrink-0 rounded-lg border">
        <Hash size={16} className="text-electric-purple" strokeWidth={2.2} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-pink-secondary text-[10px] font-bold uppercase tracking-widest">
          {t('for support')}
        </span>
        <SkeletonSuspense
          loading={isLoading}
          skeleton={<Skeleton variant="line" textSize="sm" className="h-4 w-40" />}
        >
          <span className="truncate font-mono text-sm font-semibold text-white">{data?.id}</span>
        </SkeletonSuspense>
      </div>
      {copied ? (
        <Check size={16} className="text-success flex-shrink-0" strokeWidth={2.4} />
      ) : (
        <Copy size={16} className="text-pink-secondary flex-shrink-0" strokeWidth={2.2} />
      )}
    </button>
  );
}
