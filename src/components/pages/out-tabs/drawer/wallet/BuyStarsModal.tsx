'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, CheckCircle2, Diamond, Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { useBuyStarsMutation, useGetStarsPackagesQuery } from '@/api/wallet.api';
import { formatTon } from '@/utils/pages/wallet.utils';
import { formatNumber } from '@/utils/global/number.utils';
import type { StarsPackage } from '@/types/interfaces/wallet.interfaces';

interface BuyStarsModalProps {
  open: boolean;
  onClose: () => void;
  tonBalance: number;
  initialStars?: number;
}

type Step = 'select' | 'success';

const baseRate = (packages: StarsPackage[]): number => {
  const cheapest = packages.find(p => !p.bonusPercent);
  if (cheapest && cheapest.tonCost > 0) return cheapest.stars / cheapest.tonCost;
  if (packages[0]?.tonCost) return packages[0].stars / packages[0].tonCost;
  return 2000;
};

const matchPackageByTon = (packages: StarsPackage[], ton: number): StarsPackage | null => {
  if (!ton) return null;
  return packages.find(p => Math.abs(p.tonCost - ton) < 1e-6) ?? null;
};

const matchPackageByStars = (packages: StarsPackage[], stars: number): StarsPackage | null => {
  if (!stars) return null;
  return packages.find(p => p.stars === stars) ?? null;
};

export function BuyStarsModal({ open, onClose, tonBalance, initialStars }: BuyStarsModalProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: packages = [] } = useGetStarsPackagesQuery(undefined, { skip: !open });
  const [buyStars, { isLoading: isBuying, data: result }] = useBuyStarsMutation();
  const [step, setStep] = useState<Step>('select');
  const [tonInput, setTonInput] = useState('');
  const [starsInput, setStarsInput] = useState('');
  const [lastEdited, setLastEdited] = useState<'ton' | 'stars'>('ton');
  const [submittedTon, setSubmittedTon] = useState(0);
  const [submittedStars, setSubmittedStars] = useState(0);

  useEffect(() => {
    if (!open) {
      setStep('select');
      setTonInput('');
      setStarsInput('');
      setLastEdited('ton');
      setSubmittedTon(0);
      setSubmittedStars(0);
      return;
    }
    if (initialStars && initialStars > 0) {
      setStarsInput(String(initialStars));
      setLastEdited('stars');
    }
  }, [open, initialStars]);

  const rate = useMemo(() => baseRate(packages), [packages]);

  const tonTyped = Number(tonInput) || 0;
  const starsTyped = Number(starsInput) || 0;

  const matchedPkg = useMemo(
    () =>
      lastEdited === 'ton'
        ? matchPackageByTon(packages, tonTyped)
        : matchPackageByStars(packages, starsTyped),
    [lastEdited, packages, tonTyped, starsTyped]
  );

  const tonAmount =
    lastEdited === 'ton'
      ? tonTyped
      : matchedPkg
        ? matchedPkg.tonCost
        : starsTyped > 0
          ? starsTyped / rate
          : 0;

  const starsOut =
    lastEdited === 'stars'
      ? starsTyped
      : matchedPkg
        ? matchedPkg.stars
        : tonTyped > 0
          ? Math.floor(tonTyped * rate)
          : 0;

  const tonDisplay = lastEdited === 'ton' ? tonInput : tonAmount > 0 ? formatTon(tonAmount, 4) : '';
  const starsDisplay =
    lastEdited === 'stars' ? starsInput : starsOut > 0 ? formatNumber(starsOut) : '';

  const insufficient = tonAmount > tonBalance;
  const canSubmit = tonAmount > 0 && !insufficient && starsOut > 0;

  const handleClose = () => {
    setTonInput('');
    setStarsInput('');
    setLastEdited('ton');
    setStep('select');
    onClose();
  };

  const handleTonChange = (raw: string) => {
    setLastEdited('ton');
    setTonInput(raw.replace(/[^0-9.]/g, ''));
  };

  const handleStarsChange = (raw: string) => {
    setLastEdited('stars');
    setStarsInput(raw.replace(/[^0-9]/g, ''));
  };

  const handleMax = () => {
    setLastEdited('ton');
    setTonInput(String(tonBalance));
  };

  const handleExchange = async () => {
    try {
      const payload = matchedPkg ? { packageId: matchedPkg.id } : { customStars: starsOut };
      await buyStars(payload).unwrap();
      setSubmittedTon(tonAmount);
      setSubmittedStars(starsOut);
      setStep('success');
    } catch {
      toast.error(t('action failed'));
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
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
                {t('exchange')}
              </h2>
              <div className="border-gold/25 bg-gold/10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                <Diamond size={11} className="text-electric-purple" strokeWidth={2.6} />
                <span className="text-white/85 text-[11px] font-extrabold tabular-nums">1 TON</span>
                <span className="text-pink-secondary text-[11px] font-bold">=</span>
                <TelegramStarIcon size={12} />
                <span className="text-gold text-[11px] font-extrabold tabular-nums">
                  {formatNumber(Math.round(rate))}
                </span>
              </div>
            </div>

            <div className="relative flex flex-col gap-2">
              <ExchangeCard
                tone="ton"
                label={t('from')}
                helper={`${t('available')} · ${formatTon(tonBalance, 4)} TON`}
                icon={<Diamond size={18} className="text-electric-purple" strokeWidth={2.6} />}
                currency="TON"
                input={
                  <input
                    inputMode="decimal"
                    placeholder="0.0"
                    value={tonDisplay}
                    onChange={e => handleTonChange(e.target.value)}
                    className="w-full bg-transparent text-2xl font-extrabold tabular-nums text-white outline-none"
                  />
                }
                action={
                  <button
                    type="button"
                    onClick={handleMax}
                    className="text-electric-purple border-electric-purple/40 bg-electric-purple/15 hover:bg-electric-purple/25 rounded-md border px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider transition-colors"
                  >
                    {t('max')}
                  </button>
                }
              />

              <div className="flex-center bg-background pointer-events-none absolute left-1/2 top-1/2 z-10 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/15">
                <div
                  className="flex-center h-full w-full rounded-full"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(116,61,245,0.4) 0%, rgba(248,189,62,0.4) 100%)',
                    boxShadow:
                      '0 0 14px rgba(248,189,62,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
                  }}
                >
                  <ArrowDown size={15} className="text-white" strokeWidth={2.8} />
                </div>
              </div>

              <ExchangeCard
                tone="stars"
                label={t('to')}
                helper={
                  matchedPkg?.bonusPercent ? `+${matchedPkg.bonusPercent}% ${t('bonus')}` : ''
                }
                helperClass={matchedPkg?.bonusPercent ? 'text-success' : ''}
                icon={<TelegramStarIcon size={20} />}
                currency="STARS"
                input={
                  <input
                    inputMode="numeric"
                    placeholder="0"
                    value={starsDisplay}
                    onChange={e => handleStarsChange(e.target.value)}
                    className="w-full bg-transparent text-2xl font-extrabold tabular-nums text-white outline-none"
                  />
                }
              />
            </div>

            {insufficient && (
              <p className="text-error text-[11px] font-semibold">{t('insufficient balance')}</p>
            )}

            <button
              type="button"
              disabled={!canSubmit || isBuying}
              onClick={handleExchange}
              className={twMerge(
                'relative flex items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3.5 text-sm font-extrabold uppercase tracking-wider transition-transform active:scale-99',
                canSubmit && !isBuying
                  ? 'text-background cursor-pointer'
                  : 'cursor-not-allowed bg-white/8 text-white/40'
              )}
              style={
                canSubmit && !isBuying
                  ? {
                      background: 'linear-gradient(135deg, #FFE08A 0%, #F8BD3E 55%, #B47B0A 100%)',
                      boxShadow:
                        '0 8px 24px rgba(248,189,62,0.45), inset 0 1px 0 rgba(255,255,255,0.5)',
                    }
                  : undefined
              }
            >
              {canSubmit && !isBuying && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
                >
                  <span className="animate-task-shine absolute -left-1/2 -top-1/2 h-[200%] w-[55%] bg-gradient-to-r from-transparent via-white/55 to-transparent" />
                </span>
              )}
              <TelegramStarIcon size={16} className="relative" />
              <span className="relative">{isBuying ? t('loading') : t('exchange')}</span>
            </button>
          </>
        )}

        {step === 'success' && result && (
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
              {t('exchanged ton for stars', {
                ton: formatTon(submittedTon, 4),
                stars: formatNumber(submittedStars),
              })}
            </p>
            <Button variant="primary" onClick={handleClose} className="w-full rounded-xl">
              {t('done')}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

interface ExchangeCardProps {
  tone: 'ton' | 'stars';
  label: string;
  helper?: string;
  helperClass?: string;
  icon: React.ReactNode;
  currency: string;
  input: React.ReactNode;
  action?: React.ReactNode;
}

function ExchangeCard({
  tone,
  label,
  helper,
  helperClass,
  icon,
  currency,
  input,
  action,
}: ExchangeCardProps) {
  const isStars = tone === 'stars';
  return (
    <div
      className={twMerge(
        'relative flex flex-col gap-1 overflow-hidden rounded-2xl border p-3',
        isStars ? 'border-gold/30 bg-gold/8' : 'border-electric-purple/25 bg-electric-purple/8'
      )}
      style={
        isStars
          ? {
              boxShadow: '0 0 20px rgba(248,189,62,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
            }
          : { boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }
      }
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={twMerge(
            'text-[10px] font-extrabold uppercase tracking-wider',
            isStars ? 'text-gold/90' : 'text-electric-purple/90'
          )}
        >
          {label}
        </span>
        {helper && (
          <span
            className={twMerge(
              'text-pink-secondary text-[10px] font-semibold tabular-nums',
              helperClass
            )}
          >
            {helper}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div
          className={twMerge(
            'flex-center h-10 w-10 flex-shrink-0 rounded-xl',
            isStars ? 'bg-gold/15 border-gold/35 border' : 'bg-electric-purple/20'
          )}
        >
          {icon}
        </div>
        <div className="flex flex-1 items-center gap-2">{input}</div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {action}
          <span
            className={twMerge(
              'text-[11px] font-extrabold uppercase tracking-wider',
              isStars ? 'text-gold' : 'text-electric-purple'
            )}
          >
            {currency}
          </span>
        </div>
      </div>
    </div>
  );
}
