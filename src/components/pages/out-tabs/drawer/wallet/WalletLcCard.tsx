'use client';

import { ArrowLeftRight, ArrowRight, Coins, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { useGetLcStateQuery } from '@/api/lc.api';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import { formatNumber } from '@/utils/global/number.utils';

export interface WalletLcCardProps {
  /** Open the LC → TON convert modal (rendered by the wallet container). */
  onConvert: () => void;
  /**
   * LC→TON is closed — it is the same exit as a TON withdrawal, one switch
   * server-side (`walletConfig.withdrawalsEnabled`). Marked rather than hidden
   * or disabled: this is the brightest button on the screen, so leaving it in
   * full pink makes the closed door look like a broken one.
   */
  locked?: boolean;
}

/**
 * LC summary on the wallet screen: shows the $LC balance, a direct
 * "Convert to TON" action, and a tap-through to the full LC screen (history).
 */
export function WalletLcCard({ onConvert, locked }: WalletLcCardProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const { data: state, isLoading } = useGetLcStateQuery();
  const balance = state?.balance ?? 0;

  return (
    <div
      className="shine-card relative w-full overflow-hidden rounded-2xl p-4"
      style={{ ['--shine-card-accent' as string]: 'var(--color-gold)' }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-10 h-32 w-32 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(248,189,62,0.22) 0%, transparent 65%)',
          filter: 'blur(2px)',
        }}
      />

      <button
        type="button"
        onClick={() => router.push(routes.lc)}
        className="relative flex w-full items-center gap-3 text-start transition-transform active:scale-99 cursor-pointer"
      >
        <div className="bg-gold/15 ring-gold/35 flex-center h-11 w-11 flex-shrink-0 rounded-xl ring-1">
          <Coins size={22} className="text-gold" strokeWidth={2.4} fill="rgba(248,189,62,0.35)" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="text-sm font-extrabold text-white">{t('lc wallet')}</h3>
          <p className="text-pink-secondary text-[11px] leading-snug">{t('lc wallet subtitle')}</p>
        </div>
        <ArrowRight size={16} className="text-pink-secondary shrink-0" strokeWidth={2.4} />
      </button>

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

      <button
        type="button"
        onClick={onConvert}
        disabled={isLoading}
        className={twMerge(
          // 43.5px drawn — half a pixel short of the 44 a finger is owed, and
          // there are 65px of clear space below. The zone costs nothing here.
          'tap-target relative mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-extrabold uppercase tracking-wider text-white transition-transform active:scale-99 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
          locked ? 'border border-white/10 bg-white/6 text-white/55' : 'bg-pink-gradient'
        )}
      >
        <ArrowLeftRight
          size={15}
          strokeWidth={2.6}
          className={locked ? 'text-white/45' : undefined}
        />
        {t('convert to ton')}
        {locked && (
          <Lock
            size={12}
            strokeWidth={3}
            aria-hidden
            className="absolute end-3 top-1/2 -translate-y-1/2 text-white/45"
          />
        )}
      </button>
    </div>
  );
}
