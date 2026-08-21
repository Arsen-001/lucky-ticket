'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { BottomSheet } from '@/components/shared/modals/BottomSheet';
import { Button } from '@/components/shared/buttons/Button';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { ButtonSpinner } from '@/components/shared/loaders/ButtonSpinner';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { useBuyTelegramStars } from '@/hooks/useBuyTelegramStars';
import { StarPackageCard } from '@/components/pages/out-tabs/drawer/wallet/StarPackageCard';
import { useStarPackages } from '@/hooks/useStarPackages';
import { StarsPromoNote } from '@/components/shared/stars/StarsPromoNote';
import { formatNumber } from '@/utils/global/number.utils';

interface BuyStarsModalProps {
  open: boolean;
  onClose: () => void;
  initialStars?: number;
}

type Step = 'select' | 'success';

export function BuyStarsModal({ open, onClose, initialStars }: BuyStarsModalProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const { buy, pending } = useBuyTelegramStars();
  const { packages, bonusFor, promoActive } = useStarPackages();
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
  const canBuy = amount >= 1;
  // What the payment actually credits — the server adds the same bonus off the
  // amount it was paid, so the sheet can promise it before the tap.
  const bonus = bonusFor(amount);
  const total = amount + bonus;

  const handleBuy = async () => {
    const status = await buy(amount);
    if (status === 'paid') {
      setPurchased(total);
      setStep('success');
    } else if (status === 'unavailable') {
      toast.info(t('open in telegram to buy stars'));
    } else if (status === 'failed') {
      toast.error(t('purchase failed'));
    }
    // 'cancelled' / 'pending' → no toast; the user closed or is mid-flow.
  };

  return (
    <BottomSheet open={open} onClose={onClose} label={t('buy stars')}>
      <div className="card-outlined bg-purple-gradient relative flex flex-col gap-5 overflow-hidden rounded-t-2xl px-6 pb-8 pt-7">
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
              {/* The deadline belongs on the sheet too: this is the last screen
                  before Telegram's own payment window, and a bonus with an end
                  date has to be stated where the decision is made. */}
              <StarsPromoNote />
            </div>

            <div className="relative flex flex-col gap-3">
              {/* packages — pay N stars, receive N + bonus */}
              <div className="grid grid-cols-2 gap-2">
                {packages.map(pkg => (
                  <StarPackageCard
                    key={pkg.stars}
                    stars={pkg.stars}
                    bonus={promoActive ? pkg.bonus : 0}
                    popular={promoActive && pkg.popular}
                    top={pkg.top}
                    active={amount === pkg.stars}
                    onSelect={() => setInput(String(pkg.stars))}
                  />
                ))}
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
                {/* The typed amount earns the same bonus a package button does —
                    the server decides it by what was PAID, not by which button
                    was tapped, so 210⭐ is not worth less than 200⭐. */}
                {amount >= 1 && (
                  <div className="flex items-center gap-1.5 pt-0.5 text-[11px] font-bold">
                    {bonus > 0 && (
                      <span className="bg-gold/20 text-gold rounded-full px-1.5 py-0.5 tabular-nums">
                        {t('plus {n} bonus', { n: formatNumber(bonus) })}
                      </span>
                    )}
                    <span className="text-white/70 tabular-nums">
                      {t('you receive {stars}', { stars: formatNumber(total) })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={!canBuy || pending}
              aria-busy={pending || undefined}
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
              {pending ? (
                <ButtonSpinner size={16} className="relative" />
              ) : (
                <TelegramStarIcon size={16} className="relative" />
              )}
              <span className="relative">
                {amount >= 1
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
    </BottomSheet>
  );
}
