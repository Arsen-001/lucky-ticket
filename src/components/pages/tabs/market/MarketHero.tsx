'use client';

import { Sparkles, Timer } from 'lucide-react';
import { useGetMarketDataQuery } from '@/api/market.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';

export function MarketHero() {
  const t = useAppTranslations();
  const { data } = useGetMarketDataQuery();

  const featured =
    data?.bundles.find(item => item.featured) ??
    data?.passes.find(item => item.featured) ??
    data?.chips.find(item => item.featured);
  const { leftTime } = useCountDown(featured?.expiresAt);

  return (
    <div className="bg-background-overlay relative overflow-hidden rounded-2xl p-3.5">
      <span
        aria-hidden
        className="bg-gold/12 pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl"
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
        <div className="bg-gold/15 ring-gold/30 flex-center h-10 w-10 flex-shrink-0 rounded-xl ring-1">
          <Sparkles size={20} className="text-gold" strokeWidth={2.2} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-sm font-extrabold leading-tight text-white">{t('mega market')}</h2>
          <p className="text-white/55 truncate text-[11px]">{t('mega market subtitle')}</p>
        </div>
      </div>

      {featured && (
        <div className="relative mt-2.5 flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2">
          <span className="bg-gold/20 flex-center h-7 w-7 rounded-lg">
            <span className="bg-gold h-2 w-2 rounded-full" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-gold text-[11px] font-bold uppercase tracking-wider">
              {t('hot deal')}
            </span>
            <span className="truncate text-[13px] font-extrabold leading-tight text-white">
              {featured.name}
            </span>
          </div>
          {leftTime && (
            <span className="text-gold inline-flex items-center gap-1 text-[11px] font-bold tabular-nums">
              <Timer size={11} strokeWidth={2.4} />
              {leftTime}
            </span>
          )}
          {!leftTime && featured.discountPct && (
            <span className="bg-gold rounded-md px-2 py-0.5 text-[11px] font-extrabold tabular-nums text-background">
              −{featured.discountPct}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
