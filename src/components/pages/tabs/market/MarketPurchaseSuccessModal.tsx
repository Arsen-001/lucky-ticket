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
  /** Draws the bought item at the size this receipt row has room for. */
  renderItemIcon?: (size: number) => ReactNode;
}

export function MarketPurchaseSuccessModal({
  open,
  onClose,
  itemName,
  itemDescription,
  renderItemIcon,
}: MarketPurchaseSuccessModalProps) {
  const t = useAppTranslations();

  return (
    <Modal open={open} onClose={onClose} hideCloseButton label={t('purchase complete')}>
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
          {/* Receipt line, not a stage — the picture is asked for at 44px
              instead of being boxed down from 165. Boxing only resized the
              element, never what it drew: a gift emoji kept its 99px glyph and
              lost its ears to the box edge. `object-contain` still guards an
              admin photo of any aspect ratio. */}
          {renderItemIcon && (
            <div className="flex-center size-14 shrink-0 rounded-xl [&_img]:object-contain">
              {renderItemIcon(44)}
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
