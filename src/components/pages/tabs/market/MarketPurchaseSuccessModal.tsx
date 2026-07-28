'use client';

import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface MarketPurchaseSuccessModalProps {
  open: boolean;
  onClose: () => void;
  itemName?: string;
  itemDescription?: ReactNode;
  itemIcon?: ReactNode;
}

export function MarketPurchaseSuccessModal({
  open,
  onClose,
  itemName,
  itemDescription,
  itemIcon,
}: MarketPurchaseSuccessModalProps) {
  const t = useAppTranslations();

  return (
    <Modal open={open} onClose={onClose} hideCloseButton>
      <div
        className="border-success/30 flex flex-col items-center gap-4 rounded-2xl border px-5 py-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(74,222,128,0.18) 0%, transparent 55%),' +
            'linear-gradient(180deg, #1F2A28 0%, #151F35 100%)',
        }}
      >
        <div className="flex-center border-success/35 bg-success/15 h-16 w-16 rounded-full border shadow-[0_0_24px_rgba(74,222,128,0.4)]">
          <Check size={32} className="text-success" strokeWidth={3} />
        </div>

        <div>
          <h3 className="text-[20px] font-extrabold leading-tight text-white">
            {t('purchase complete')}
          </h3>
          <p className="text-white-secondary mt-1 text-[12px]">{t('received')}</p>
        </div>

        <div className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-3.5">
          {/* Callers hand over the same icon they render in the confirm modal — a
              140–165px hero. This row is a receipt line, not a stage, so the node
              is boxed down to a thumbnail; the size is forced because those nodes
              carry inline width/height. The image is contained, not cropped: an
              admin photo comes in at whatever aspect ratio was uploaded (a 16:9
              banner in a square box shows a third of itself under `cover`), and
              the receipt has to show what was actually bought. Square variants —
              the avatar tile with its tier ring, the VIP crown — are unaffected. */}
          {itemIcon && (
            <div className="flex-center size-14 shrink-0 overflow-hidden rounded-xl [&>*]:size-full! [&_img]:size-full! [&_img]:object-contain">
              {itemIcon}
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
            {itemName && (
              <span className="text-[14px] font-extrabold leading-tight text-white">
                {itemName}
              </span>
            )}
            {itemDescription && (
              <span className="text-white-secondary text-[11px] leading-snug">
                {itemDescription}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="border-success/30 mt-1 w-full rounded-2xl border px-5 py-3.5 text-[14px] font-extrabold uppercase tracking-wider text-white shadow-[0_3px_9px_rgba(74,222,128,0.15),inset_0_1px_0_rgba(255,255,255,0.08)]"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(74,222,128,0.25) 0%, transparent 55%),' +
              'linear-gradient(180deg, #1F2A28 0%, #151F35 100%)',
          }}
        >
          {t('awesome')}
        </button>
      </div>
    </Modal>
  );
}
