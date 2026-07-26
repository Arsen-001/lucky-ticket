'use client';

import { useMemo, useState } from 'react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { Input } from '@/components/shared/form-elements/inputs/Input';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { useWithdrawTonMutation } from '@/api/wallet.api';
import { isValidTonAddress, formatTon, tonScanUrl } from '@/utils/pages/wallet.utils';
import { useWalletLimits } from '@/hooks/useWalletLimits';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { WithdrawSummaryRow } from './WithdrawSummaryRow';
import type { TonNetwork } from '@/types/interfaces/wallet.interfaces';

interface WithdrawTonModalProps {
  open: boolean;
  onClose: () => void;
  tonBalance: number;
  /** Chain the backend broadcasts on — decides which tonscan the receipt links to. */
  network?: TonNetwork;
}

type Step = 'form' | 'confirm' | 'success';

export function WithdrawTonModal({ open, onClose, tonBalance, network }: WithdrawTonModalProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const [withdraw, { isLoading, data: result }] = useWithdrawTonMutation();
  const [step, setStep] = useState<Step>('form');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');

  const numericAmount = Number(amount) || 0;
  // The backend sends `amount` to the recipient and debits `amount + fee`, so
  // the entered number is what ARRIVES. This used to render "you will receive"
  // as amount − fee, quoting the fee twice and understating the payout.
  // Fee and minimum come from the server, which enforces exactly these.
  const { withdrawFeeTon: fee, minWithdrawTon, maxWithdrawTon } = useWalletLimits();
  const totalDebited = numericAmount > 0 ? numericAmount + fee : 0;

  const error = useMemo<string | null>(() => {
    if (!toAddress) return null;
    if (!isValidTonAddress(toAddress)) return t('invalid ton address');
    if (numericAmount <= 0) return null;
    if (numericAmount < minWithdrawTon)
      return t('minimum withdrawal {n} ton', { n: minWithdrawTon });
    // The server refuses anything above the ceiling, so say so here instead of
    // letting the form submit into a rejection.
    if (numericAmount > maxWithdrawTon)
      return t('maximum withdrawal {n} ton', { n: maxWithdrawTon });
    if (numericAmount + fee > tonBalance) return t('insufficient balance');
    return null;
  }, [toAddress, numericAmount, fee, minWithdrawTon, maxWithdrawTon, tonBalance, t]);

  const canSubmit =
    !error &&
    isValidTonAddress(toAddress) &&
    numericAmount >= minWithdrawTon &&
    numericAmount <= maxWithdrawTon;

  const handleClose = () => {
    setStep('form');
    setToAddress('');
    setAmount('');
    onClose();
  };

  const handleMax = () => setAmount(String(Math.max(0, tonBalance - fee)));

  const handleConfirm = async () => {
    try {
      await withdraw({ toAddress, amount: numericAmount }).unwrap();
      setStep('success');
    } catch (error) {
      // 503 = the backend has no treasury configured, so nothing can be sent
      // on-chain. Say that plainly instead of a generic failure.
      const status = (error as { status?: number })?.status;
      toast.error(status === 503 ? t('withdrawals unavailable') : t('action failed'));
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="bg-purple-gradient flex flex-col gap-4 rounded-2xl p-6">
        {step === 'form' && (
          <>
            <div className="flex flex-col gap-1 text-center">
              <h2 className="text-white text-xl font-extrabold">{t('withdraw ton')}</h2>
              <p className="text-pink-secondary text-[11px] font-bold uppercase tracking-wider">
                {t('available')} · {formatTon(tonBalance, 4)} TON
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-pink-secondary px-1 text-[11px] font-bold uppercase tracking-wider">
                {t('recipient address')}
              </label>
              <Input
                value={toAddress}
                onChange={e => setToAddress(e.target.value)}
                placeholder="EQ..."
                classNames={{ input: 'font-mono text-[12px]' }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-pink-secondary px-1 text-[11px] font-bold uppercase tracking-wider">
                {t('amount')}
              </label>
              <Input
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.0"
                inputMode="decimal"
                suffix={
                  <button
                    type="button"
                    onClick={handleMax}
                    className="text-electric-purple text-[10px] font-extrabold uppercase tracking-wider"
                  >
                    {t('max')}
                  </button>
                }
              />
            </div>

            <div className="bg-background-overlay/60 flex flex-col gap-1.5 rounded-xl p-3 text-[12px]">
              <WithdrawSummaryRow
                label={t('you will receive')}
                value={`${formatTon(numericAmount, 4)} TON`}
                emphasis
              />
              <WithdrawSummaryRow label={t('network fee')} value={`${formatTon(fee, 4)} TON`} />
              <WithdrawSummaryRow
                label={t('total debited')}
                value={`${formatTon(totalDebited, 4)} TON`}
              />
              <WithdrawSummaryRow
                label={t('minimum withdrawal')}
                value={`${formatTon(minWithdrawTon, 4)} TON`}
              />
            </div>

            {error && <p className="text-error text-[11px] font-semibold">{error}</p>}

            <Button
              variant="primary"
              disabled={!canSubmit}
              onClick={() => setStep('confirm')}
              className="rounded-xl"
            >
              {t('continue')}
            </Button>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div className="flex flex-col gap-1 text-center">
              <h2 className="text-white text-xl font-extrabold">{t('confirm withdraw')}</h2>
              <p className="text-pink-secondary text-[12px]">
                {t('send {amount} ton to {address}', {
                  amount: formatTon(numericAmount, 4),
                  address: `${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`,
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setStep('form')}
                className="flex-1 rounded-xl"
              >
                {t('back')}
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                loading={isLoading}
                className="flex-1 rounded-xl"
              >
                {t('confirm')}
              </Button>
            </div>
          </>
        )}

        {step === 'success' && result && (
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 size={42} className="text-success" strokeWidth={2.2} />
            <h2 className="text-white text-xl font-extrabold">{t('withdrawal submitted')}</h2>
            <p className="text-pink-secondary text-[12px]">
              {t('arrives in approximately {n} sec', { n: result.estimatedArrivalSec })}
            </p>
            <a
              href={tonScanUrl(result.txHash, network)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric-purple inline-flex items-center gap-1 text-[12px] font-bold"
            >
              {t('view on tonscan')}
              <ExternalLink size={12} strokeWidth={2.4} />
            </a>
            <Button variant="primary" onClick={handleClose} className="w-full rounded-xl">
              {t('done')}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
