'use client';

import type { ChangeEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { Input } from '@/components/shared/form-elements/inputs/Input';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';

const CODE_PATTERN = /^[A-Z0-9]{6}$/;

export interface EmailCodeStepProps {
  email: string;
  code: string;
  /** Already-translated inline error, or null. */
  errorMessage: string | null;
  confirming: boolean;
  resending: boolean;
  /** Seconds until resend unlocks; 0 = available now. */
  resendInSec: number;
  onCodeChange: (value: string) => void;
  onConfirm: () => void;
  onResend: () => void;
  onChangeEmail: () => void;
}

/** Step 2 of the change-email flow: the 6-character code sent to the inbox. */
export function EmailCodeStep({
  email,
  code,
  errorMessage,
  confirming,
  resending,
  resendInSec,
  onCodeChange,
  onConfirm,
  onResend,
  onChangeEmail,
}: EmailCodeStepProps) {
  const t = useAppTranslations();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    onCodeChange(e.target.value.toUpperCase());

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-gray-secondary text-sm font-semibold px-1">{t('enter code')}</label>
        <Input
          value={code}
          onChange={handleChange}
          maxLength={6}
          autoComplete="one-time-code"
          autoFocus
          placeholder="••••••"
          prefix={<KeyRound size={18} className="text-gray-secondary" />}
          disabled={confirming}
          className="tracking-[0.4em] font-extrabold uppercase"
        />
        <p className="text-xs text-gray-secondary px-1">{t('code sent to {email}', { email })}</p>
        {errorMessage && (
          <p className="text-error-text animate-fade-in px-1 text-xs font-semibold">
            {errorMessage}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <Button
          onClick={onConfirm}
          className="w-full"
          loading={confirming}
          disabled={confirming || !CODE_PATTERN.test(code)}
        >
          {t('confirm')}
        </Button>
        <div className="flex items-center justify-between px-1 text-xs">
          <button
            type="button"
            onClick={onChangeEmail}
            className="text-gray-secondary font-semibold underline-offset-2 hover:underline"
          >
            {t('change email')}
          </button>
          <button
            type="button"
            onClick={onResend}
            disabled={resendInSec > 0 || resending}
            className="text-teal font-semibold underline-offset-2 hover:underline disabled:text-white/30 disabled:no-underline"
          >
            {resendInSec > 0 ? t('resend in {n}s', { n: resendInSec }) : t('resend')}
          </button>
        </div>
      </div>
    </div>
  );
}
