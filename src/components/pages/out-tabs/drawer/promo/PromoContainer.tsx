'use client';

import { useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { Gift, Send } from 'lucide-react';
import { Input } from '@/components/shared/form-elements/inputs/Input';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { useRedeemPromoCodeMutation } from '@/api/promo.api';
import { Modal } from '@/components/shared/modals/Modal';
import { PromoRewardReveal } from './PromoRewardReveal';
import type { PromoErrorReason, PromoRedeemResponse } from '@/types/interfaces/promo.interfaces';

type PromoErrorMessageKey = 'promo invalid' | 'promo expired' | 'promo used';

const ERROR_KEY: Record<PromoErrorReason, PromoErrorMessageKey> = {
  invalid: 'promo invalid',
  expired: 'promo expired',
  used: 'promo used',
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

  const trimmed = code.trim();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorKey(null);
    setCode(e.target.value.toUpperCase());
  };

  const handleRedeem = async () => {
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleRedeem();
  };

  return (
    <div className="flex flex-col gap-5 px-4 pb-8 pt-4">
      <div className="card-outlined relative flex flex-col items-center gap-2 overflow-hidden rounded-3xl px-5 py-6 text-center">
        <span
          aria-hidden
          className="bg-electric-pink/20 pointer-events-none absolute -top-14 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full blur-3xl"
        />
        <span className="bg-electric-pink/20 text-electric-pink flex-center relative h-14 w-14 rounded-2xl">
          <Gift size={26} />
        </span>
        <h2 className="relative text-lg font-extrabold text-white">{t('enter promo code')}</h2>
        <p className="text-white-secondary relative max-w-[18rem] text-[13px] font-medium leading-snug">
          {t('promo intro')}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          value={code}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={t('promo placeholder')}
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          classNames={{
            input:
              'uppercase tracking-[0.15em] placeholder:normal-case placeholder:tracking-normal',
          }}
        />
        {errorKey && (
          <span className="text-error px-1 text-[12px] font-semibold">{t(errorKey)}</span>
        )}
        <Button onClick={handleRedeem} loading={isLoading} disabled={!trimmed} className="w-full">
          {t('redeem')}
        </Button>
      </div>

      <Modal open={resultOpen} onClose={() => setResultOpen(false)}>
        {result && <PromoRewardReveal key={result.code} response={result} />}
      </Modal>

      <a
        href={GlobalConstants.telegramChannelUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-pink-secondary inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold transition-opacity active:opacity-70"
      >
        <Send size={13} />
        {t('find codes on channel')}
      </a>
    </div>
  );
}
