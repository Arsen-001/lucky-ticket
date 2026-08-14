'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface ProfileSupportIdsProps {
  userId: string;
}

interface SupportIdRow {
  key: string;
  label: string;
  value: string;
}

export function ProfileSupportIds({ userId }: ProfileSupportIdsProps) {
  const t = useAppTranslations();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const rows: SupportIdRow[] = [{ key: 'user', label: t('user id'), value: userId }];

  const handleCopy = async (row: SupportIdRow) => {
    try {
      await navigator.clipboard?.writeText(row.value);
      setCopiedKey(row.key);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-white/8 bg-white/4 px-3 py-2">
      <span className="px-1 pb-1 pt-0.5 text-[9px] font-bold uppercase tracking-wider text-white/30">
        {t('for support')}
      </span>
      {rows.map(row => {
        const copied = copiedKey === row.key;
        return (
          <button
            key={row.key}
            type="button"
            onClick={() => handleCopy(row)}
            aria-label={t('copy {label}', { label: row.label })}
            className="tap-target relative flex items-center justify-between gap-3 rounded-lg px-1 py-1.5 text-start transition-colors active:bg-white/6"
          >
            <span className="text-[11px] font-medium text-white/45">{row.label}</span>
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate font-mono text-xs font-semibold text-white/80">
                {row.value}
              </span>
              {copied ? (
                <Check size={13} className="text-success flex-shrink-0" />
              ) : (
                <Copy size={13} className="flex-shrink-0 text-white/40" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
