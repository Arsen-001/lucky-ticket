'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, CheckCircle2, Coins } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { useConvertLcToTonMutation } from '@/api/lc.api';
import { formatNumber } from '@/utils/global/number.utils';
import { lcToTon } from '@/utils/global/lc.utils';
import { useLcUsdRate } from '@/hooks/useLcUsdRate';
import { useTonUsdRate } from '@/hooks/useTonUsdRate';
import { useWalletLimits } from '@/hooks/useWalletLimits';

type Step = 'select' | 'success';

export interface LcConvertTonModalProps {
  open: boolean;
  onClose: () => void;
  /** Current LC balance. */
  balance: number;
}

const fmtTon = (n: number) => String(Number(n.toFixed(6)));

export function LcConvertTonModal({ open, onClose, balance }: LcConvertTonModalProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const [convert, { isLoading }] = useConvertLcToTonMutation();
  const [step, setStep] = useState<Step>('select');
  const [lcInput, setLcInput] = useState('');
  const [submitted, setSubmitted] = useState({ lc: 0, ton: 0 });

  useEffect(() => {
    if (!open) {
      setStep('select');
      setLcInput('');
      setSubmitted({ lc: 0, ton: 0 });
    }
  }, [open]);

  // Both sides of the quote come from the live config so the preview matches
  // what the backend credits — TON's price is a market feed, not a constant.
  const lcUsdRate = useLcUsdRate();
  const tonUsdRate = useTonUsdRate();
  const { minWithdrawLc } = useWalletLimits();
  const amount = Number(lcInput) || 0;
  const tonOut = lcToTon(amount, lcUsdRate, tonUsdRate);
  const insufficient = amount > balance;
  // The backend rejects anything under the minimum with a 400. Without this the
  // form happily submitted it and the player got a generic "action failed".
  const belowMinimum = amount > 0 && amount < minWithdrawLc;
  const canSubmit = amount > 0 && !insufficient && !belowMinimum;

  const handleMax = () => setLcInput(String(balance));

  const handleConvert = async () => {
    try {
      const res = await convert({ lcAmount: amount }).unwrap();
      setSubmitted({ lc: res.lcSpent, ton: res.tonCredited });
      setStep('success');
    } catch {
      toast.error(t('action failed'));
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
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
              <h2 className="text-xl font-extrabold text-white">{t('convert to ton')}</h2>
              <p className="text-pink-secondary text-[11px]">{t('convert to ton subtitle')}</p>
            </div>

            <div className="relative flex flex-col gap-2">
              <div
                className="border-gold/30 bg-gold/8 relative flex flex-col gap-1 overflow-hidden rounded-2xl border p-3"
                style={{
                  boxShadow: '0 0 20px rgba(248,189,62,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gold/90 text-[10px] font-extrabold uppercase tracking-wider">
                    {t('from')}
                  </span>
                  <span className="text-pink-secondary text-[10px] font-semibold tabular-nums">
                    {t('available')} · {formatNumber(balance)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-gold/15 border-gold/35 flex-center h-10 w-10 flex-shrink-0 rounded-xl border">
                    <Coins
                      size={20}
                      className="text-gold"
                      strokeWidth={2.4}
                      fill="rgba(248,189,62,0.4)"
                    />
                  </div>
                  <input
                    inputMode="numeric"
                    placeholder="0"
                    value={lcInput}
                    onChange={e => setLcInput(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-transparent text-2xl font-extrabold tabular-nums text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleMax}
                    className="text-gold border-gold/40 bg-gold/15 hover:bg-gold/25 cursor-pointer rounded-md border px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider transition-colors"
                  >
                    {t('max')}
                  </button>
                  <span className="text-gold text-[11px] font-extrabold uppercase tracking-wider">
                    LC
                  </span>
                </div>
              </div>

              <div className="flex-center bg-background pointer-events-none absolute left-1/2 top-1/2 z-10 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/15">
                <div
                  className="flex-center h-full w-full rounded-full"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(248,189,62,0.45) 0%, rgba(23,141,136,0.45) 100%)',
                    boxShadow:
                      '0 0 14px rgba(23,141,136,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
                  }}
                >
                  <ArrowDown size={15} className="text-white" strokeWidth={2.8} />
                </div>
              </div>

              <div
                className="border-teal/30 bg-teal/10 relative flex flex-col gap-1 overflow-hidden rounded-2xl border p-3"
                style={{
                  boxShadow: '0 0 20px rgba(23,141,136,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <span className="text-teal/90 text-[10px] font-extrabold uppercase tracking-wider">
                  {t('to')}
                </span>
                <div className="flex items-center gap-2">
                  <div className="bg-teal/20 text-teal flex-center h-10 w-10 flex-shrink-0 rounded-xl text-[11px] font-extrabold">
                    TON
                  </div>
                  <span className="flex-1 truncate text-2xl font-extrabold tabular-nums text-white">
                    {fmtTon(tonOut)}
                  </span>
                  <span className="text-teal text-[11px] font-extrabold uppercase tracking-wider">
                    TON
                  </span>
                </div>
              </div>
            </div>

            {insufficient && (
              <p className="text-error-text text-[11px] font-semibold">
                {t('insufficient lc balance')}
              </p>
            )}
            {!insufficient && belowMinimum && (
              <p className="text-error-text text-[11px] font-semibold">
                {t('minimum conversion {n} lc', { n: formatNumber(minWithdrawLc) })}
              </p>
            )}

            <button
              type="button"
              disabled={!canSubmit || isLoading}
              onClick={handleConvert}
              className={twMerge(
                'relative flex items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3.5 text-sm font-extrabold uppercase tracking-wider transition-transform active:scale-99',
                canSubmit && !isLoading
                  ? 'bg-pink-gradient cursor-pointer text-white'
                  : 'cursor-not-allowed bg-white/8 text-white/40'
              )}
            >
              {isLoading ? t('loading') : t('convert')}
            </button>

            <p className="text-pink-secondary text-center text-[10px]">
              {t('direct lc withdrawal soon')}
            </p>
          </>
        )}

        {step === 'success' && (
          <div className="relative flex flex-col items-center gap-3.5 text-center">
            <div className="relative">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(23,141,136,0.6) 0%, transparent 65%)',
                  filter: 'blur(8px)',
                }}
              />
              <div
                className="border-teal/55 bg-teal/15 flex-center relative h-20 w-20 rounded-full border-2 text-base font-extrabold text-teal"
                style={{
                  boxShadow: '0 0 40px rgba(23,141,136,0.55), inset 0 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                TON
                <CheckCircle2
                  size={24}
                  strokeWidth={2.4}
                  className="text-success bg-background absolute -bottom-1 -right-1 rounded-full"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.6))' }}
                />
              </div>
            </div>
            <h2 className="text-xl font-extrabold text-white">{t('convert complete')}</h2>
            <p className="text-pink-secondary inline-flex items-center gap-1 text-[12px]">
              {t('converted lc to ton', {
                lc: formatNumber(submitted.lc),
                ton: fmtTon(submitted.ton),
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
