'use client';

import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { usePromoRedeem } from '@/hooks/usePromoRedeem';
import { PromoScreenShell } from './PromoScreenShell';
import { PromoRedeemCard } from './PromoRedeemCard';
import { PromoRewardReveal } from './PromoRewardReveal';

/**
 * The promo screen as one card over a field of the prizes themselves.
 *
 * What it replaced ended 543px down an 844px screen and left the bottom 302px
 * flat and empty, while the only pictures of the prizes on it were a 13px coin
 * and a 12px star inside text chips. The card now speaks the same language as
 * `/lc` and `/jackpot` — dark surface, coloured hairline, art as a watermark,
 * a band and an action footer — and the art it names is scattered behind it at
 * full size.
 */
export function PromoContainer() {
  const t = useAppTranslations();
  const promo = usePromoRedeem();

  return (
    <PromoScreenShell>
      <PromoRedeemCard
        code={promo.code}
        errorMessage={promo.errorMessage}
        loading={promo.loading}
        onCodeChange={promo.onCodeChange}
        onSubmit={promo.onSubmit}
        className="animate-slide-in-bottom"
      />

      <Modal open={promo.resultOpen} onClose={promo.closeResult} label={t('promo code')}>
        {promo.result && <PromoRewardReveal key={promo.result.code} response={promo.result} />}
      </Modal>
    </PromoScreenShell>
  );
}
