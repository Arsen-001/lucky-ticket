'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Check, Copy, ShieldAlert } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useGetDepositAddressQuery } from '@/api/wallet.api';

interface DepositTonModalProps {
  open: boolean;
  onClose: () => void;
}

export function DepositTonModal({ open, onClose }: DepositTonModalProps) {
  const t = useAppTranslations();
  const { data, isLoading } = useGetDepositAddressQuery(undefined, { skip: !open });
  const [copied, setCopied] = useState(false);

  const address = data?.address ?? '';
  const qrSrc = address
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&bgcolor=1d1d34&color=ffffff&margin=8&data=${encodeURIComponent(`ton://transfer/${address}`)}`
    : '';

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient flex flex-col gap-4 rounded-2xl p-6">
        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-white text-xl font-extrabold">{t('deposit ton')}</h2>
          <p className="text-pink-secondary text-[11px] font-bold uppercase tracking-wider">
            {t('ton mainnet')}
          </p>
        </div>

        <div className="flex-center bg-background-overlay rounded-2xl p-3">
          {isLoading || !qrSrc ? (
            <div className="bg-background-overlay/60 h-[240px] w-[240px] animate-pulse rounded-xl" />
          ) : (
            <Image
              src={qrSrc}
              alt={t('deposit ton')}
              width={240}
              height={240}
              unoptimized
              className="rounded-xl"
            />
          )}
        </div>

        <div className="bg-background-overlay flex items-center gap-2 rounded-xl p-3">
          <span className="text-pink-secondary flex-1 break-all font-mono text-[11px]">
            {address || '—'}
          </span>
          <button
            type="button"
            onClick={handleCopy}
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

        <div className="bg-warning/10 text-warning flex items-start gap-2 rounded-xl border border-warning/30 p-3">
          <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" strokeWidth={2.4} />
          <p className="text-[11px] font-semibold leading-snug">{t('deposit warning ton only')}</p>
        </div>

        <div className="flex-center text-pink-secondary gap-2 text-[11px]">
          <span className="bg-warning h-1.5 w-1.5 animate-pulse rounded-full" />
          {t('waiting for deposit')}
        </div>

        <Button variant="secondary" onClick={onClose} className="rounded-full px-4 py-2">
          {t('close')}
        </Button>
      </div>
    </Modal>
  );
}
