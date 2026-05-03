'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, CheckCircle2, Diamond, Star } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
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
      /* surface via toast */
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="bg-purple-gradient flex flex-col gap-4 rounded-2xl p-6">
        {step === 'select' && (
          <>
            <div className="flex flex-col gap-1 text-center">
              <h2 className="text-white text-xl font-extrabold">{t('exchange')}</h2>
              <p className="text-pink-secondary text-[11px] font-bold uppercase tracking-wider">
                1 TON = {formatNumber(Math.round(rate))} ⭐
              </p>
            </div>

            <div className="relative flex flex-col gap-2">
              <ExchangeCard
                label={t('from')}
                helper={`${t('available')} · ${formatTon(tonBalance, 4)} TON`}
                icon={<Diamond size={16} className="text-electric-purple" />}
                currency="TON"
                input={
                  <input
                    inputMode="decimal"
                    placeholder="0.0"
                    value={tonDisplay}
                    onChange={e => handleTonChange(e.target.value)}
                    className="bg-transparent text-2xl font-extrabold text-white outline-none w-full tabular-nums"
                  />
                }
                action={
                  <button
                    type="button"
                    onClick={handleMax}
                    className="text-electric-purple text-[10px] font-extrabold uppercase tracking-wider"
                  >
                    {t('max')}
                  </button>
                }
              />

              <div className="flex-center pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background-overlay ring-2 ring-background">
                <ArrowDown size={14} className="text-pink-secondary" strokeWidth={2.6} />
              </div>

              <ExchangeCard
                label={t('to')}
                helper={
                  matchedPkg?.bonusPercent ? `+${matchedPkg.bonusPercent}% ${t('bonus')}` : ''
                }
                helperClass={matchedPkg?.bonusPercent ? 'text-success' : ''}
                icon={<Star size={16} className="text-gold fill-gold" />}
                currency="STARS"
                input={
                  <input
                    inputMode="numeric"
                    placeholder="0"
                    value={starsDisplay}
                    onChange={e => handleStarsChange(e.target.value)}
                    className="bg-transparent text-2xl font-extrabold text-white outline-none w-full tabular-nums"
                  />
                }
              />
            </div>

            {insufficient && (
              <p className="text-error text-[11px] font-semibold">{t('insufficient balance')}</p>
            )}

            <Button
              variant="primary"
              disabled={!canSubmit}
              loading={isBuying}
              onClick={handleExchange}
              className="rounded-xl"
            >
              {t('exchange')}
            </Button>
          </>
        )}

        {step === 'success' && result && (
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 size={42} className="text-success" strokeWidth={2.2} />
            <h2 className="text-white text-xl font-extrabold">{t('exchange complete')}</h2>
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
  label: string;
  helper?: string;
  helperClass?: string;
  icon: React.ReactNode;
  currency: string;
  input: React.ReactNode;
  action?: React.ReactNode;
}

function ExchangeCard({
  label,
  helper,
  helperClass,
  icon,
  currency,
  input,
  action,
}: ExchangeCardProps) {
  return (
    <div className="bg-background-overlay/60 flex flex-col gap-1 rounded-2xl border border-white/5 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-pink-secondary text-[10px] font-bold uppercase tracking-wider">
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
        <div className="bg-electric-purple/15 flex-center h-9 w-9 flex-shrink-0 rounded-xl">
          {icon}
        </div>
        <div className="flex flex-1 items-center gap-2">{input}</div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {action}
          <span className="text-pink-secondary text-[11px] font-bold uppercase tracking-wider">
            {currency}
          </span>
        </div>
      </div>
    </div>
  );
}
