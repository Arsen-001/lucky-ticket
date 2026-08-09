'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useRedeemPromoCodeMutation } from '@/api/promo.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { PromoErrorReason, PromoRedeemResponse } from '@/types/interfaces/promo.interfaces';

type PromoErrorMessageKey = 'promo invalid' | 'promo expired' | 'promo used' | 'promo need channel';

const ERROR_KEY: Record<PromoErrorReason, PromoErrorMessageKey> = {
  invalid: 'promo invalid',
  expired: 'promo expired',
  used: 'promo used',
  channel: 'promo need channel',
};

/**
 * Redeem state for the promo screen: the typed code, the localized failure
 * message and the reward payload that drives the reveal.
 *
 * `result` and `resultOpen` are separate so the reveal stays mounted through the
 * modal's close animation.
 */
export function usePromoRedeem() {
  const t = useAppTranslations();
  const [code, setCode] = useState('');
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

  return {
    code,
    errorMessage: errorKey ? t(errorKey) : null,
    loading: isLoading,
    result,
    resultOpen,
    closeResult: () => setResultOpen(false),
    onCodeChange: handleChange,
    onSubmit: handleRedeem,
  };
}
