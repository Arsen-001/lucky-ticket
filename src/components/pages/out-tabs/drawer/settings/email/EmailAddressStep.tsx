'use client';

import type { ChangeEvent } from 'react';
import { BadgeCheck, Mail } from 'lucide-react';
import { Input } from '@/components/shared/form-elements/inputs/Input';
import { Button } from '@/components/shared/buttons/Button';
import { ArrivalShine } from '@/components/shared/ArrivalShine';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { EmailRewardChips } from './EmailRewardChips';
import type { EmailRewardInfo } from '@/types/interfaces/user.interfaces';

export interface EmailAddressStepProps {
  email: string;
  currentEmail?: string;
  isVerified: boolean;
  rewardInfo?: EmailRewardInfo;
  loading: boolean;
  sending: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
}

/** Step 1 of the change-email flow: the address field + gift teaser. */
export function EmailAddressStep({
  email,
  currentEmail,
  isVerified,
  rewardInfo,
  loading,
  sending,
  onEmailChange,
  onSubmit,
}: EmailAddressStepProps) {
  const t = useAppTranslations();

  const unchangedVerified = isVerified && !!currentEmail && email === currentEmail;
  const showReward = !!rewardInfo && rewardInfo.enabled && !rewardInfo.claimed;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onEmailChange(e.target.value);

  return (
    <div className="flex flex-col gap-6">
      <ArrivalShine id="verifyEmail" className="flex flex-col gap-2">
        <label className="text-gray-secondary text-sm font-semibold px-1">{t('email')}</label>
        <Input
          loading={loading}
          type="email"
          value={email}
          onChange={handleChange}
          placeholder={t('enter your email')}
          prefix={<Mail size={18} className="text-gray-secondary" />}
          disabled={loading || sending}
        />
        <p className="text-xs text-gray-secondary px-1">
          {t('confirm or change your email address')}
        </p>
        {unchangedVerified ? (
          <div className="border-success/40 bg-success/15 mx-1 inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1">
            <BadgeCheck size={13} className="text-teal" />
            <span className="text-teal text-[11px] font-extrabold">{t('email verified')}</span>
          </div>
        ) : (
          showReward && <EmailRewardChips reward={rewardInfo.reward} />
        )}
      </ArrivalShine>
      <Button
        onClick={onSubmit}
        className="w-full"
        loading={sending}
        disabled={loading || sending || !email.includes('@') || unchangedVerified}
      >
        {t('send code')}
      </Button>
    </div>
  );
}
