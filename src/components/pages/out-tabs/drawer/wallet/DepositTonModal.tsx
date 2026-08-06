'use client';

import { useState } from 'react';
import { Check, Copy, ShieldAlert } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Modal } from '@/components/shared/modals/Modal';
import { QrCode } from '@/components/shared/QrCode';
import { Button } from '@/components/shared/buttons/Button';
import { Input } from '@/components/shared/form-elements/inputs/Input';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { useGetDepositAddressQuery } from '@/api/wallet.api';
import { useWalletLimits } from '@/hooks/useWalletLimits';
import { DepositUnavailableNotice } from '@/components/pages/out-tabs/drawer/wallet/DepositUnavailableNotice';
import { TonAmountChips } from '@/components/pages/out-tabs/drawer/wallet/TonAmountChips';
import {
  formatTon,
  sanitizeDecimalInput,
  tonConnectValidUntil,
  tonToNanoString,
  walletConstants,
} from '@/utils/pages/wallet.utils';

interface DepositTonModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after a deposit is broadcast, so the wallet can refresh once it credits. */
  onDeposited?: () => void;
}

export function DepositTonModal({ open, onClose, onDeposited }: DepositTonModalProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const [tonConnectUI] = useTonConnectUI();
  const { data, isLoading } = useGetDepositAddressQuery(undefined, { skip: !open });
  const { minDepositTon } = useWalletLimits();
  const [copied, setCopied] = useState(false);
  const [copiedComment, setCopiedComment] = useState(false);
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  const address = data?.address ?? '';
  const comment = data?.comment;
  const viaWallet = !!data?.viaWalletEnabled && !!address && !!data?.payloadBase64;
  // No treasury on the backend → no address to send to. Never render a QR in
  // this state: the old fallback handed out the player's own (or a synthetic)
  // address, so a real transfer went nowhere and was never credited.
  const depositsUnavailable = !isLoading && (data?.depositsEnabled === false || !address);
  const numericAmount = Number(amount) || 0;
  // Below the minimum the sender's own network fee is most of the transfer, so
  // the form doesn't offer it. Deliberately advisory: whatever actually arrives
  // on-chain is credited regardless — refusing real TON would be the worse bug.
  const belowMinimum = numericAmount > 0 && numericAmount < minDepositTon;
  const canSend = viaWallet && numericAmount >= minDepositTon && !sending;
  const quickAmounts = walletConstants.TON_QUICK_AMOUNTS.filter(v => v >= minDepositTon);

  // Manual senders must carry the comment too, else the watcher can't attribute it.
  const transferUri = address
    ? `ton://transfer/${address}${comment ? `?text=${encodeURIComponent(comment)}` : ''}`
    : '';
  const copy = async (value: string, mark: (v: boolean) => void) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      mark(true);
      setTimeout(() => mark(false), 1600);
    } catch {
      /* noop */
    }
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  const handleSend = async () => {
    if (!canSend || !data?.payloadBase64) return;
    setSending(true);
    try {
      await tonConnectUI.sendTransaction({
        validUntil: tonConnectValidUntil(),
        messages: [
          { address, amount: tonToNanoString(numericAmount), payload: data.payloadBase64 },
        ],
      });
      toast.success(t('deposit sent'));
      onDeposited?.();
      handleClose();
    } catch {
      // User rejected in the wallet, or the send failed — the wallet surfaces
      // its own feedback, so keep the modal open without a redundant error.
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="bg-purple-gradient flex flex-col gap-4 rounded-2xl p-6">
        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-white text-xl font-extrabold">{t('deposit ton')}</h2>
          <p className="text-pink-secondary text-[11px] font-bold uppercase tracking-wider">
            {data?.network === 'testnet' ? t('ton testnet') : t('ton mainnet')}
          </p>
        </div>

        {viaWallet && (
          <div className="flex flex-col gap-2">
            <label className="text-pink-secondary px-1 text-[11px] font-bold uppercase tracking-wider">
              {t('amount')}
            </label>
            <Input
              value={amount}
              onChange={e => setAmount(sanitizeDecimalInput(e.target.value))}
              placeholder="0.0"
              inputMode="decimal"
              suffix={<span className="text-pink-secondary text-[11px] font-extrabold">TON</span>}
            />
            <TonAmountChips
              amounts={quickAmounts}
              value={numericAmount}
              onPick={v => setAmount(String(v))}
            />
            <p
              className={twMerge(
                'px-1 text-[11px]',
                belowMinimum ? 'text-error-text font-semibold' : 'text-pink-secondary'
              )}
            >
              {t('minimum deposit {n} ton', { n: formatTon(minDepositTon, 4) })}
            </p>
            <Button
              variant="primary"
              disabled={!canSend}
              loading={sending}
              onClick={handleSend}
              className="rounded-xl"
            >
              {t('send from wallet')}
            </Button>
            <p className="text-pink-secondary text-center text-[10px]">
              {t('deposit crediting note')}
            </p>
            <div className="flex items-center gap-2 py-1">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-pink-secondary text-[10px] font-bold uppercase tracking-wider">
                {t('or send manually')}
              </span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
          </div>
        )}

        {depositsUnavailable ? (
          <DepositUnavailableNotice />
        ) : (
          <>
            {/* Drawn on the device, never fetched. This code is what a player
                points a wallet at to send real TON, so the address inside it
                must not make a round trip through a third party: whoever serves
                the image chooses what it encodes, and a swapped one looks
                identical. It also used to mean no QR at all whenever that host
                was slow, blocked (it is a plain external image, and this runs
                inside Telegram) or down. */}
            <div className="flex-center bg-background-overlay rounded-2xl p-3">
              {isLoading || !transferUri ? (
                <div className="bg-background-overlay/60 h-[240px] w-[240px] animate-pulse rounded-xl" />
              ) : (
                <QrCode
                  value={transferUri}
                  label={t('deposit ton')}
                  className="h-[240px] w-[240px] rounded-xl"
                />
              )}
            </div>

            <div className="bg-background-overlay flex items-center gap-2 rounded-xl p-3">
              <span className="text-pink-secondary flex-1 break-all font-mono text-[11px]">
                {address || '—'}
              </span>
              <button
                type="button"
                onClick={() => copy(address, setCopied)}
                disabled={!address}
                className="text-pink-secondary hover:text-white disabled:opacity-50"
                aria-label={t('copy address')}
              >
                {copied ? (
                  <Check size={16} className="text-success" strokeWidth={3} />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          </>
        )}

        {comment && (
          <>
            <div className="bg-background-overlay flex items-center gap-2 rounded-xl p-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
                  {t('transfer comment')}
                </span>
                <span className="text-pink-secondary break-all font-mono text-[11px]">
                  {comment}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copy(comment, setCopiedComment)}
                className="text-pink-secondary hover:text-white"
                aria-label={t('transfer comment')}
              >
                {copiedComment ? (
                  <Check size={16} className="text-success" strokeWidth={3} />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
            <div className="bg-warning/10 text-warning flex items-start gap-2 rounded-xl border border-warning/30 p-3">
              <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" strokeWidth={2.4} />
              <p className="text-[11px] font-semibold leading-snug">
                {t('deposit comment required')}
              </p>
            </div>
          </>
        )}

        {!depositsUnavailable && (
          <div className="bg-warning/10 text-warning flex items-start gap-2 rounded-xl border border-warning/30 p-3">
            <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" strokeWidth={2.4} />
            <p className="text-[11px] font-semibold leading-snug">
              {t('deposit warning ton only')}
            </p>
          </div>
        )}

        <Button variant="secondary" onClick={handleClose} className="rounded-full px-4 py-2">
          {t('close')}
        </Button>
      </div>
    </Modal>
  );
}
