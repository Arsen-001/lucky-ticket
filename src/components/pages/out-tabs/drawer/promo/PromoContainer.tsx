'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useRedeemPromoCodeMutation } from '@/api/promo.api';
import { Modal } from '@/components/shared/modals/Modal';
import { PromoCouponCard } from './PromoCouponCard';
import { PromoRewardHintChips } from './PromoRewardHintChips';
import { PromoChannelCard } from './PromoChannelCard';
import { PromoRewardReveal } from './PromoRewardReveal';
import type { PromoErrorReason, PromoRedeemResponse } from '@/types/interfaces/promo.interfaces';

type PromoErrorMessageKey = 'promo invalid' | 'promo expired' | 'promo used' | 'promo need channel';

const ERROR_KEY: Record<PromoErrorReason, PromoErrorMessageKey> = {
  invalid: 'promo invalid',
  expired: 'promo expired',
  used: 'promo used',
  channel: 'promo need channel',
};

export function PromoContainer() {
  const t = useAppTranslations();
  const [code, setCode] = useState('');
  // `result` holds the reward data; `resultOpen` drives the modal separately so
  // the reveal stays mounted through the modal's close animation.
  const [result, setResult] = useState<PromoRedeemResponse | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [errorKey, setErrorKey] = useState<PromoErrorMessageKey | null>(null);
  const [redeem, { isLoading }] = useRedeemPromoCodeMutation();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorKey(null);
    setCode(e.target.value.toUpperCase());
  };

  const handleRedeem = async () => {
    const trimmed = code.trim();
    if (!trimmed || isLoading) return;
    setErrorKey(null);
    try {
      const res = await redeem({ code: trimmed }).unwrap();
      setResult(res);
      setResultOpen(true);
      setCode('');
    } catch (err) {
      // The live backend returns the reason in `data.message` ({message,error,
      // statusCode}); the mock returns the bare string in `data`. Support both so
      // "expired"/"used" aren't all mislabeled "invalid".
      const data = (err as { data?: PromoErrorReason | { message?: PromoErrorReason } }).data;
      const reason = typeof data === 'string' ? data : data?.message;
      setResultOpen(false);
      setResult(null);
      setErrorKey(ERROR_KEY[reason as PromoErrorReason] ?? ERROR_KEY.invalid);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-2">
      <div className="animate-slide-in-bottom">
        <PromoCouponCard
          code={code}
          errorMessage={errorKey ? t(errorKey) : null}
          loading={isLoading}
          onCodeChange={handleChange}
          onSubmit={handleRedeem}
        />
      </div>
      <div className="animate-slide-in-bottom" style={{ animationDelay: '100ms' }}>
        <PromoRewardHintChips />
      </div>
      <div className="animate-slide-in-bottom" style={{ animationDelay: '200ms' }}>
        <PromoChannelCard />
      </div>

      <Modal open={resultOpen} onClose={() => setResultOpen(false)} label={t('promo code')}>
        {result && <PromoRewardReveal key={result.code} response={result} />}
      </Modal>
    </div>
  );
}
