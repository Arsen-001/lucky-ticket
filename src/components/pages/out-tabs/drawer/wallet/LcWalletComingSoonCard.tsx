'use client';

import { Bell, Lock } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface LcWalletComingSoonCardProps {
  onNotifyMe: () => void;
}

export function LcWalletComingSoonCard({ onNotifyMe }: LcWalletComingSoonCardProps) {
  const t = useAppTranslations();

  return (
    <div className="card-outlined bg-background-overlay/70 relative overflow-hidden rounded-2xl p-4">
      <span
        aria-hidden
        className="bg-gold/40 absolute right-[-46px] top-3 z-10 rotate-45 px-12 py-1 text-[10px] font-extrabold uppercase tracking-widest text-background shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
      >
        {t('coming soon')}
      </span>

      <div className="relative flex items-start gap-3 opacity-90">
        <div className="bg-gold/15 flex-center h-10 w-10 flex-shrink-0 rounded-xl ring-1 ring-gold/25 grayscale-[30%]">
          <span className="text-gold text-base font-extrabold">LC</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="text-white text-sm font-extrabold">{t('lc wallet')}</h3>
          <p className="text-pink-secondary text-[11px] leading-snug">{t('lc wallet subtitle')}</p>
        </div>
      </div>

      <div className="relative mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled
          aria-disabled
          className="bg-disabled/20 text-disabled inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/5 px-3 py-2 text-[11px] font-bold uppercase tracking-wider"
        >
          <Lock size={12} strokeWidth={2.6} />
          {t('connect')}
        </button>
        <button
          type="button"
          onClick={onNotifyMe}
          className="bg-electric-purple/20 hover:bg-electric-purple/30 text-electric-purple inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors"
        >
          <Bell size={12} strokeWidth={2.6} />
          {t('notify me')}
        </button>
      </div>
    </div>
  );
}
