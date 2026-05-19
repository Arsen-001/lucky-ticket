'use client';

import { ArrowRight, Coins } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetLcStateQuery } from '@/api/lc.api';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import { formatNumber } from '@/utils/global/number.utils';

export function LcWalletComingSoonCard() {
  const t = useAppTranslations();
  const router = useRouter();
  const { data: state, isLoading } = useGetLcStateQuery();
  const balance = state?.balance ?? 0;

  return (
    <button
      type="button"
      onClick={() => router.push(routes.lc)}
      className="bg-background-overlay/70 hover:bg-background-overlay relative w-full overflow-hidden rounded-2xl p-4 text-left transition-colors active:scale-99 cursor-pointer"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-10 h-32 w-32 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(248,189,62,0.22) 0%, transparent 65%)',
          filter: 'blur(2px)',
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[18%] right-[18%] z-2 h-[3px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-gold) 90%, transparent) 50%, transparent 100%)',
          filter: 'blur(0.8px)',
        }}
      />

      <div className="relative flex items-center gap-3">
        <div className="bg-gold/15 ring-gold/35 flex-center h-11 w-11 flex-shrink-0 rounded-xl ring-1">
          <Coins size={22} className="text-gold" strokeWidth={2.4} fill="rgba(248,189,62,0.35)" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="text-sm font-extrabold text-white">{t('lc wallet')}</h3>
          <p className="text-pink-secondary text-[11px] leading-snug">{t('lc wallet subtitle')}</p>
        </div>
        <ArrowRight size={16} className="text-pink-secondary shrink-0" strokeWidth={2.4} />
      </div>

      <div className="relative mt-3 flex items-center justify-between rounded-xl border border-white/5 bg-black/25 px-3 py-2">
        <span className="text-pink-secondary text-[10px] font-extrabold uppercase tracking-wider">
          {t('lc balance')}
        </span>
        {isLoading ? (
          <span className="text-pink-secondary text-[12px]">…</span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="text-base font-extrabold tabular-nums"
              style={{
                backgroundImage: 'linear-gradient(180deg, #FFE08A 0%, #F8BD3E 60%, #B47B0A 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {formatNumber(balance)}
            </span>
            <LcLabel size={14} />
          </span>
        )}
      </div>
    </button>
  );
}
