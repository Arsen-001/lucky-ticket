'use client';

import { useEffect, useState } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import {
  useConfirmEmailMutation,
  useGetEmailRewardQuery,
  useGetMeQuery,
  useRequestEmailCodeMutation,
} from '@/api/me.api';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { Modal } from '@/components/shared/modals/Modal';
import { EmailAddressStep } from './EmailAddressStep';
import { EmailCodeStep } from './EmailCodeStep';
import { EmailVerifiedModal } from './EmailVerifiedModal';
import { emailVerificationErrorKey } from '@/utils/pages/email-verification.utils';
import type { ConfirmEmailResponse } from '@/types/interfaces/user.interfaces';

type Step = 'address' | 'code';

/**
 * Change-email flow: address → 6-character code sent to the inbox → confirm.
 * A confirmation that grants the one-off gift (admin-composed) opens the
 * reward reveal; the gift never repeats for later address changes.
 */
export function EmailVerificationContainer() {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: me, isLoading: isMeLoading, isError, refetch } = useGetMeQuery();
  const { data: rewardInfo } = useGetEmailRewardQuery();
  const [requestCode, { isLoading: isSending }] = useRequestEmailCodeMutation();
  const [confirmEmail, { isLoading: isConfirming }] = useConfirmEmailMutation();

  const [step, setStep] = useState<Step>('address');
  const [email, setEmail] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resendInSec, setResendInSec] = useState(0);
  // `result` stays mounted through the modal's close animation; `resultOpen`
  // drives the modal separately (promo-reveal convention).
  const [result, setResult] = useState<ConfirmEmailResponse | null>(null);
  const [resultOpen, setResultOpen] = useState(false);

  useEffect(() => {
    if (me?.email) setEmail(me.email);
  }, [me?.email]);

  useEffect(() => {
    if (resendInSec <= 0) return;
    const timer = setInterval(() => setResendInSec(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendInSec > 0]);

  const handleSendCode = async (address: string) => {
    try {
      const res = await requestCode({ email: address }).unwrap();
      setPendingEmail(res.email);
      setResendInSec(res.cooldownSec);
      setCode('');
      setCodeError(null);
      setStep('code');
    } catch (err) {
      toast.error(t(emailVerificationErrorKey(err)));
    }
  };

  const handleConfirm = async () => {
    try {
      const res = await confirmEmail({ code }).unwrap();
      setStep('address');
      setEmail(res.email);
      if (res.reward) {
        setResult(res);
        setResultOpen(true);
      } else {
        toast.success(t('email confirmed'));
      }
    } catch (err) {
      setCodeError(t(emailVerificationErrorKey(err)));
    }
  };

  if (isError && !me) {
    return <QueryErrorState onRetry={() => refetch()} />;
  }

  return (
    <>
      {step === 'address' ? (
        <EmailAddressStep
          email={email}
          currentEmail={me?.email}
          isVerified={!!me?.isVerified}
          rewardInfo={rewardInfo}
          loading={isMeLoading}
          sending={isSending}
          onEmailChange={setEmail}
          onSubmit={() => handleSendCode(email)}
        />
      ) : (
        <EmailCodeStep
          email={pendingEmail}
          code={code}
          errorMessage={codeError}
          confirming={isConfirming}
          resending={isSending}
          resendInSec={resendInSec}
          onCodeChange={value => {
            setCode(value);
            setCodeError(null);
          }}
          onConfirm={handleConfirm}
          onResend={() => handleSendCode(pendingEmail)}
          onChangeEmail={() => {
            setStep('address');
            setCodeError(null);
          }}
        />
      )}

      <Modal open={resultOpen} onClose={() => setResultOpen(false)}>
        {result?.reward && <EmailVerifiedModal email={result.email} reward={result.reward} />}
      </Modal>
    </>
  );
}
