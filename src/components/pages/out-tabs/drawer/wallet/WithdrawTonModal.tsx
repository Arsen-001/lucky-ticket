'use client';

import { useMemo, useState } from 'react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { Input } from '@/components/shared/form-elements/inputs/Input';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { useWithdrawTonMutation } from '@/api/wallet.api';
import {
  isValidTonAddress,
  formatTon,
  readReferralGateError,
  tonScanUrl,
} from '@/utils/pages/wallet.utils';
import { useWalletLimits } from '@/hooks/useWalletLimits';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { WithdrawSummaryRow } from './WithdrawSummaryRow';
import { WalletReferralGate } from './WalletReferralGate';
import type { TonNetwork } from '@/types/interfaces/wallet.interfaces';

interface WithdrawTonModalProps {
  open: boolean;
  onClose: () => void;
  tonBalance: number;
  /** Chain the backend broadcasts on — decides which tonscan the receipt links to. */
  network?: TonNetwork;
  /** Server's verdict on the cash-out invite gate — true = `POST /wallet/withdraw` 403s. */
  gated?: boolean;
  /** Friends the cash-out gate asks for (`walletConfig.withdrawMinReferrals`). */
  requiredReferrals?: number;
  /** Friends already invited — the gate's progress. */
  currentReferrals?: number;
}

type Step = 'form' | 'confirm' | 'success';

export function WithdrawTonModal({
  open,
  onClose,
  tonBalance,
  network,
  gated = false,
  requiredReferrals = 0,
  currentReferrals = 0,
}: WithdrawTonModalProps) {
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
  // Fee and limits come from the server, which enforces exactly these.
  const {
    withdrawFeeTon: fee,
    minWithdrawTon,
    maxWithdrawTon,
    withdrawDailyCapTon,
  } = useWalletLimits();
  const totalDebited = numericAmount > 0 ? numericAmount + fee : 0;

  const error = useMemo<string | null>(() => {
    // The address and the amount are validated independently: keyed on the
    // address alone, an out-of-range amount stayed silent until something was
    // typed into the other field, and the disabled button explained nothing.
    if (toAddress && !isValidTonAddress(toAddress)) return t('invalid ton address');
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
    numericAmount <= maxWithdrawTon &&
    numericAmount + fee <= tonBalance;

  const handleClose = () => {
    setStep('form');
    setToAddress('');
    setAmount('');
    onClose();
  };

  // "Max" has to respect the per-transaction ceiling too — on a balance above
  // it this filled in an amount the server was always going to reject.
  const handleMax = () => {
    const spendable = Math.min(maxWithdrawTon, Math.max(0, tonBalance - fee));
    setAmount(spendable > 0 ? String(Number(spendable.toFixed(4))) : '');
  };

  const handleConfirm = async () => {
    try {
      await withdraw({ toAddress, amount: numericAmount }).unwrap();
      setStep('success');
    } catch (error) {
      // 503 = the backend has no treasury configured, so nothing can be sent
      // on-chain. Say that plainly instead of a generic failure.
      const status = (error as { status?: number })?.status;
      // The cash-out gate answers 403 with the requirement — the state this
      // modal renders as a lock, but the count can move between load and submit.
      const referralGate = readReferralGateError(error);
      if (referralGate) {
        toast.error(t('invite {num} friends to withdraw', { num: referralGate.required }));
        setStep('form');
        return;
      }
      // Anything else stays on the confirm step so the same amount can be
      // retried without retyping it.
      toast.error(status === 503 ? t('withdrawals unavailable') : t('action failed'));
    }
  };

  // The cash-out gate is a state of the screen, not an error: rendering the
  // form behind a lock would invite an address and an amount into a request
  // the API answers 403 to.
  if (gated) {
    return (
      <Modal open={open} onClose={handleClose}>
        <div className="bg-purple-gradient flex flex-col gap-4 rounded-2xl p-6">
          <WalletReferralGate
            title={t('withdrawals unlock with friends')}
            description={t('invite {num} friends to withdraw', { num: requiredReferrals })}
            required={requiredReferrals}
            current={currentReferrals}
          />
          <Button variant="secondary" onClick={handleClose} className="rounded-full px-4 py-2">
            {t('close')}
          </Button>
        </div>
      </Modal>
    );
  }

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
              <span aria-hidden className="my-0.5 h-px bg-white/10" />
              {/* Every ceiling the server enforces, stated up front: the
                  per-transaction range and the daily cap that spans several
                  withdrawals — hitting the latter otherwise reads as a bug. */}
              <WithdrawSummaryRow
                label={t('minimum withdrawal')}
                value={`${formatTon(minWithdrawTon, 4)} TON`}
              />
              <WithdrawSummaryRow
                label={t('maximum withdrawal')}
                value={`${formatTon(maxWithdrawTon, 4)} TON`}
              />
              <WithdrawSummaryRow
                label={t('daily withdrawal limit')}
                value={`${formatTon(withdrawDailyCapTon, 4)} TON`}
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
