'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, CheckCircle2, Coins } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useConvertStarsToLcMutation } from '@/api/lc.api';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { formatNumber } from '@/utils/global/number.utils';

type Step = 'select' | 'success';

export interface LcConvertStarsModalProps {
  open: boolean;
  onClose: () => void;
  starsBalance: number;
  rate: number;
}

export function LcConvertStarsModal({
  open,
  onClose,
  starsBalance,
  rate,
}: LcConvertStarsModalProps) {
  const t = useAppTranslations();
  const [convert, { isLoading }] = useConvertStarsToLcMutation();
  const [step, setStep] = useState<Step>('select');
  const [starsInput, setStarsInput] = useState('');
  const [submitted, setSubmitted] = useState({ stars: 0, lc: 0 });

  useEffect(() => {
    if (!open) {
      setStep('select');
      setStarsInput('');
      setSubmitted({ stars: 0, lc: 0 });
    }
  }, [open]);

  const stars = Number(starsInput) || 0;
  const lcOut = stars * rate;
  const insufficient = stars > starsBalance;
  const canSubmit = stars > 0 && !insufficient;

  const handleMax = () => setStarsInput(String(starsBalance));

  const handleConvert = async () => {
    try {
      const res = await convert({ stars }).unwrap();
      setSubmitted({ stars: res.starsSpent, lc: res.lcCredited });
      setStep('success');
    } catch {
      /* surface via toast in future */
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
              'radial-gradient(circle, rgba(248,189,62,0.28) 0%, rgba(248,189,62,0.08) 40%, transparent 70%)',
          }}
        />

        {step === 'select' && (
          <>
            <div className="relative flex flex-col items-center gap-2 text-center">
              <h2 className="text-xl font-extrabold text-white">{t('convert stars to lc')}</h2>
              <div className="border-gold/25 bg-gold/10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                <TelegramStarIcon size={12} />
                <span className="text-white/85 text-[11px] font-extrabold tabular-nums">1</span>
                <span className="text-pink-secondary text-[11px] font-bold">=</span>
                <LcLabel size={12} />
                <span className="text-gold text-[11px] font-extrabold tabular-nums">{rate}</span>
              </div>
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
                    {t('available')} · {formatNumber(starsBalance)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-gold/15 border-gold/35 flex-center h-10 w-10 flex-shrink-0 rounded-xl border">
                    <TelegramStarIcon size={20} />
                  </div>
                  <input
                    inputMode="numeric"
                    placeholder="0"
                    value={starsInput}
                    onChange={e => setStarsInput(e.target.value.replace(/[^0-9]/g, ''))}
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
                    STARS
                  </span>
                </div>
              </div>

              <div className="flex-center bg-background pointer-events-none absolute left-1/2 top-1/2 z-10 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/15">
                <div
                  className="flex-center h-full w-full rounded-full"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(248,189,62,0.45) 0%, rgba(222,0,155,0.4) 100%)',
                    boxShadow:
                      '0 0 14px rgba(248,189,62,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
                  }}
                >
                  <ArrowDown size={15} className="text-white" strokeWidth={2.8} />
                </div>
              </div>

              <div
                className="border-electric-pink/30 bg-electric-pink/10 relative flex flex-col gap-1 overflow-hidden rounded-2xl border p-3"
                style={{
                  boxShadow: '0 0 20px rgba(222,0,155,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <span className="text-electric-pink/90 text-[10px] font-extrabold uppercase tracking-wider">
                  {t('to')}
                </span>
                <div className="flex items-center gap-2">
                  <div className="bg-electric-pink/20 flex-center h-10 w-10 flex-shrink-0 rounded-xl">
                    <Coins
                      size={20}
                      className="text-gold"
                      strokeWidth={2.4}
                      fill="rgba(248,189,62,0.4)"
                    />
                  </div>
                  <span className="flex-1 truncate text-2xl font-extrabold tabular-nums text-white">
                    {formatNumber(lcOut)}
                  </span>
                  <LcLabel size={16} />
                </div>
              </div>
            </div>

            {insufficient && (
              <p className="text-error text-[11px] font-semibold">
                {t('insufficient stars balance')}
              </p>
            )}

            <button
              type="button"
              disabled={!canSubmit || isLoading}
              onClick={handleConvert}
              className={twMerge(
                'relative flex items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3.5 text-sm font-extrabold uppercase tracking-wider transition-transform active:scale-99',
                canSubmit && !isLoading
                  ? 'text-background cursor-pointer'
                  : 'cursor-not-allowed bg-white/8 text-white/40'
              )}
              style={
                canSubmit && !isLoading
                  ? {
                      background: 'linear-gradient(135deg, #FFE08A 0%, #F8BD3E 55%, #B47B0A 100%)',
                      boxShadow:
                        '0 8px 24px rgba(248,189,62,0.45), inset 0 1px 0 rgba(255,255,255,0.5)',
                    }
                  : undefined
              }
            >
              {canSubmit && !isLoading && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
                >
                  <span className="animate-task-shine absolute -left-1/2 -top-1/2 h-[200%] w-[55%] bg-gradient-to-r from-transparent via-white/55 to-transparent" />
                </span>
              )}
              <Coins
                size={16}
                className="relative"
                strokeWidth={2.4}
                fill="rgba(255,255,255,0.5)"
              />
              <span className="relative">{isLoading ? t('loading') : t('convert')}</span>
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
                <Coins
                  size={46}
                  className="text-gold"
                  strokeWidth={2.2}
                  fill="rgba(248,189,62,0.4)"
                />
                <CheckCircle2
                  size={24}
                  strokeWidth={2.4}
                  className="text-success bg-background absolute -bottom-1 -right-1 rounded-full"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.6))' }}
                />
              </div>
            </div>
            <h2 className="text-xl font-extrabold text-white">{t('convert complete')}</h2>
            <p className="text-pink-secondary text-[12px]">
              {t('converted stars to lc', {
                stars: formatNumber(submitted.stars),
                lc: formatNumber(submitted.lc),
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
