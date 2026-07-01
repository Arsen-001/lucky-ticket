'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { useBuyTelegramStars } from '@/hooks/useBuyTelegramStars';
import { formatNumber } from '@/utils/global/number.utils';

interface BuyStarsModalProps {
  open: boolean;
  onClose: () => void;
  initialStars?: number;
}

type Step = 'select' | 'success';

// `1` is a minimal-cost option for testing real payments; the rest are top-ups.
const PRESETS = [1, 100, 500, 1000, 5000];

export function BuyStarsModal({ open, onClose, initialStars }: BuyStarsModalProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const { buy, pending } = useBuyTelegramStars();
  const [step, setStep] = useState<Step>('select');
  const [input, setInput] = useState('');
  const [purchased, setPurchased] = useState(0);

  useEffect(() => {
    if (!open) {
      setStep('select');
      setInput('');
      setPurchased(0);
      return;
    }
    if (initialStars && initialStars > 0) setInput(String(initialStars));
  }, [open, initialStars]);

  const amount = Number(input) || 0;
  const canBuy = amount >= 1 && !pending;

  const handleBuy = async () => {
    const status = await buy(amount);
    if (status === 'paid') {
      setPurchased(amount);
      setStep('success');
    } else if (status === 'unavailable') {
      toast.info(t('open in telegram to buy stars'));
    } else if (status === 'failed') {
      toast.error(t('purchase failed'));
    }
    // 'cancelled' / 'pending' → no toast; the user closed or is mid-flow.
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="card-outlined bg-purple-gradient relative flex flex-col gap-5 overflow-hidden rounded-2xl p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(248,189,62,0.28) 0%, rgba(248,189,62,0.08) 40%, transparent 70%)',
          }}
        />

        {step === 'select' && (
          <>
            <div className="relative flex flex-col items-center gap-2.5 text-center">
              <div className="relative">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(248,189,62,0.55) 0%, transparent 65%)',
                    filter: 'blur(6px)',
                  }}
                />
                <div
                  className="border-gold/45 bg-gold/10 flex-center relative h-16 w-16 rounded-full border-2"
                  style={{
                    boxShadow:
                      '0 0 32px rgba(248,189,62,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
                  }}
                >
                  <TelegramStarIcon size={36} />
                  <Sparkles
                    aria-hidden
                    size={12}
                    className="text-gold absolute -right-1 -top-1 drop-shadow-[0_0_6px_rgba(248,189,62,0.9)]"
                    style={{ fill: 'rgba(248,189,62,0.65)' }}
                  />
                </div>
              </div>
              <h2 className="text-xl font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                {t('buy stars')}
              </h2>
              <p className="text-pink-secondary text-[11px]">{t('buy stars subtitle')}</p>
            </div>

            <div className="relative flex flex-col gap-3">
              {/* preset amounts */}
              <div className="grid grid-cols-5 gap-1.5">
                {PRESETS.map(preset => {
                  const active = amount === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setInput(String(preset))}
                      className={twMerge(
                        'flex-center gap-0.5 rounded-xl border px-0.5 py-1.5 text-[11px] font-extrabold tabular-nums transition-colors',
                        active
                          ? 'border-gold/60 bg-gold/20 text-gold'
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      )}
                    >
                      <TelegramStarIcon size={10} />
                      {formatNumber(preset)}
                    </button>
                  );
                })}
              </div>

              {/* custom amount */}
              <div
                className="border-gold/30 bg-gold/8 relative flex flex-col gap-1 overflow-hidden rounded-2xl border p-3"
                style={{
                  boxShadow: '0 0 20px rgba(248,189,62,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                <span className="text-gold/90 text-[10px] font-extrabold uppercase tracking-wider">
                  {t('custom amount')}
                </span>
                <div className="flex items-center gap-2">
                  <div className="bg-gold/15 border-gold/35 flex-center h-10 w-10 flex-shrink-0 rounded-xl border">
                    <TelegramStarIcon size={20} />
                  </div>
                  <input
                    inputMode="numeric"
                    placeholder="0"
                    value={input}
                    onChange={e => setInput(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-transparent text-2xl font-extrabold tabular-nums text-white outline-none"
                  />
                  <span className="text-gold text-[11px] font-extrabold uppercase tracking-wider">
                    LS
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={!canBuy}
              onClick={handleBuy}
              className={twMerge(
                'relative flex items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3.5 text-sm font-extrabold uppercase tracking-wider transition-transform active:scale-99',
                canBuy
                  ? 'text-background cursor-pointer'
                  : 'cursor-not-allowed bg-white/8 text-white/40'
              )}
              style={
                canBuy
                  ? {
                      background: 'linear-gradient(135deg, #FFE08A 0%, #F8BD3E 55%, #B47B0A 100%)',
                      boxShadow:
                        '0 8px 24px rgba(248,189,62,0.45), inset 0 1px 0 rgba(255,255,255,0.5)',
                    }
                  : undefined
              }
            >
              <TelegramStarIcon size={16} className="relative" />
              <span className="relative">
                {pending
                  ? t('loading')
                  : amount >= 1
                    ? t('buy stars amount', { stars: formatNumber(amount) })
                    : t('buy stars')}
              </span>
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
            <h2 className="text-xl font-extrabold text-white">{t('purchase complete')}</h2>
            <p className="text-pink-secondary text-[12px]">
              {t('stars added', { stars: formatNumber(purchased) })}
            </p>
            <Button variant="primary" onClick={onClose} className="w-full rounded-xl">
              {t('done')}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
