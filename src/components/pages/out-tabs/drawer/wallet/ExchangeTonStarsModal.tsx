'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, CheckCircle2, Diamond } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useConverterAmount } from '@/hooks/useConverterAmount';
import { useToast } from '@/hooks/useToast';
import { useTonUsdRate } from '@/hooks/useTonUsdRate';
import { useBuyStarsMutation } from '@/api/wallet.api';
import { formatNumber } from '@/utils/global/number.utils';
import {
  formatTon,
  sanitizeDecimalInput,
  starsToTon,
  tonToStars,
} from '@/utils/pages/wallet.utils';

export interface ExchangeTonStarsModalProps {
  open: boolean;
  onClose: () => void;
  /** Wallet TON balance (what can be exchanged). */
  tonBalance: number;
  isConnected: boolean;
}

type Step = 'select' | 'success';

/** Plain digits for an input: `formatTon` groups thousands, which types badly. */
const tonField = (value: number) => String(Number(value.toFixed(4)));

export function ExchangeTonStarsModal({
  open,
  onClose,
  tonBalance,
  isConnected,
}: ExchangeTonStarsModalProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const tonUsdRate = useTonUsdRate();
  const [exchange, { isLoading }] = useBuyStarsMutation();
  const [step, setStep] = useState<Step>('select');
  const [result, setResult] = useState({ ton: 0, stars: 0 });
  // Both boxes take input: "I want 500 LS" is the question a player actually
  // has, and answering it by guessing TON amounts against an unseen rate was
  // the only way this screen offered.
  const amount = useConverterAmount({
    toRight: ton => tonToStars(ton, tonUsdRate),
    toLeft: stars => starsToTon(stars, tonUsdRate),
    formatLeft: tonField,
    // Grouped, so a five-digit star count stays readable; the field strips the
    // separators back out the moment it is typed into.
    formatRight: formatNumber,
  });

  useEffect(() => {
    if (!open) {
      setStep('select');
      amount.reset();
      setResult({ ton: 0, stars: 0 });
    }
  }, [open]);

  const stars = amount.to;
  const cost = starsToTon(stars, tonUsdRate); // exact TON that will be charged
  const insufficient = stars >= 1 && cost > tonBalance;
  const canSubmit = isConnected && stars >= 1 && !insufficient && !isLoading;

  const handleMax = () => amount.setFrom(String(tonBalance));

  const handleExchange = async () => {
    try {
      const res = await exchange({ customStars: stars }).unwrap();
      setResult({ ton: cost, stars: res.starsCredited ?? stars });
      setStep('success');
    } catch {
      toast.error(t('action failed'));
    }
  };

  return (
    <Modal open={open} onClose={onClose} label={t('exchange ton to stars')}>
      <div className="card-outlined bg-purple-gradient relative flex flex-col gap-5 overflow-hidden rounded-2xl p-6">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(23,141,136,0.28) 0%, rgba(23,141,136,0.08) 40%, transparent 70%)',
          }}
        />

        {step === 'select' && (
          <>
            <div className="relative flex flex-col items-center gap-1 text-center">
              <h2 className="text-xl font-extrabold text-white">{t('exchange')}</h2>
              <p className="text-pink-secondary text-[11px]">{t('exchange ton to stars')}</p>
            </div>

            <div className="relative flex flex-col gap-2">
              {/* From — TON */}
              <div
                className="border-teal/30 bg-teal/10 relative flex flex-col gap-1 overflow-hidden rounded-2xl border p-3"
                style={{
                  boxShadow: '0 0 20px rgba(23,141,136,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-teal/90 text-[10px] font-extrabold uppercase tracking-wider">
                    {t('from')}
                  </span>
                  <span className="text-pink-secondary text-[10px] font-semibold tabular-nums">
                    {t('available')} · {formatTon(tonBalance, 4)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-teal/20 text-teal flex-center h-10 w-10 flex-shrink-0 rounded-xl border border-teal/30">
                    <Diamond size={18} strokeWidth={2.2} />
                  </div>
                  <input
                    inputMode="decimal"
                    placeholder="0.0"
                    aria-label={t('from')}
                    value={amount.fromValue}
                    onChange={e => amount.setFrom(sanitizeDecimalInput(e.target.value))}
                    className="w-full bg-transparent text-2xl font-extrabold tabular-nums text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleMax}
                    className="text-teal border-teal/40 bg-teal/15 hover:bg-teal/25 cursor-pointer rounded-md border px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider transition-colors"
                  >
                    {t('max')}
                  </button>
                  <span className="text-teal text-[11px] font-extrabold uppercase tracking-wider">
                    TON
                  </span>
                </div>
              </div>

              <div className="flex-center bg-background pointer-events-none absolute left-1/2 top-1/2 z-10 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/15">
                <div
                  className="flex-center h-full w-full rounded-full"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(23,141,136,0.45) 0%, rgba(248,189,62,0.45) 100%)',
                    boxShadow:
                      '0 0 14px rgba(248,189,62,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
                  }}
                >
                  <ArrowDown size={15} className="text-white" strokeWidth={2.8} />
                </div>
              </div>

              {/* To — Stars */}
              <div
                className="border-gold/30 bg-gold/8 relative flex flex-col gap-1 overflow-hidden rounded-2xl border p-3"
                style={{
                  boxShadow: '0 0 20px rgba(248,189,62,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                <span className="text-gold/90 text-[10px] font-extrabold uppercase tracking-wider">
                  {t('to')}
                </span>
                <div className="flex items-center gap-2">
                  <div className="bg-gold/15 border-gold/35 flex-center h-10 w-10 flex-shrink-0 rounded-xl border">
                    <TelegramStarIcon size={20} />
                  </div>
                  <input
                    inputMode="numeric"
                    placeholder="0"
                    aria-label={t('to')}
                    value={amount.toValue}
                    onChange={e => amount.setTo(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-transparent text-2xl font-extrabold tabular-nums text-white outline-none"
                  />
                  <span className="text-gold text-[11px] font-extrabold uppercase tracking-wider">
                    LS
                  </span>
                </div>
              </div>
            </div>

            {!isConnected && (
              <p className="text-pink-secondary text-center text-[11px] font-semibold">
                {t('connect wallet to start')}
              </p>
            )}
            {insufficient && (
              <p className="text-error-text text-[11px] font-semibold">
                {t('insufficient balance')}
              </p>
            )}

            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleExchange}
              className={twMerge(
                'relative flex items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3.5 text-sm font-extrabold uppercase tracking-wider transition-transform active:scale-99',
                canSubmit
                  ? 'bg-pink-gradient cursor-pointer text-white'
                  : 'cursor-not-allowed bg-white/8 text-white/40'
              )}
            >
              {isLoading ? t('loading') : t('exchange')}
            </button>
          </>
        )}

        {step === 'success' && (
          <div className="relative flex flex-col items-center gap-3.5 text-center">
            <div className="relative">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(248,189,62,0.6) 0%, transparent 65%)',
                  filter: 'blur(8px)',
                }}
              />
              <div
                className="border-gold/55 bg-gold/15 flex-center relative h-20 w-20 rounded-full border-2"
                style={{
                  boxShadow: '0 0 40px rgba(248,189,62,0.55), inset 0 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                <TelegramStarIcon size={46} />
                <CheckCircle2
                  size={24}
                  strokeWidth={2.4}
                  className="text-success bg-background absolute -bottom-1 -right-1 rounded-full"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.6))' }}
                />
              </div>
            </div>
            <h2 className="text-xl font-extrabold text-white">{t('exchange complete')}</h2>
            <p className="text-pink-secondary text-[12px]">
              {t('exchanged to stars', {
                ton: formatTon(result.ton, 4),
                stars: formatNumber(result.stars),
              })}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="bg-pink-gradient w-full cursor-pointer rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-white transition-transform active:scale-99"
            >
              {t('done')}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
