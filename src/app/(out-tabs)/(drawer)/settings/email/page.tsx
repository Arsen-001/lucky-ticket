'use client';

import { useEffect, useState } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { Input } from '@/components/shared/form-elements/inputs/Input';
import { Button } from '@/components/shared/buttons/Button';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { ArrivalShine } from '@/components/shared/ArrivalShine';
import { Mail } from 'lucide-react';
import { useGetMeQuery, useUpdateMeMutation } from '@/api/me.api';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { GlobalConstants } from '@/constants/global.constants';

export default function EmailPage() {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: me, isLoading: isMeLoading, isError, refetch } = useGetMeQuery();
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    if (me?.email) {
      setEmail(me.email);
    }
  }, [me]);

  const handleSave = async () => {
    if (!email || email === me?.email) return;
    try {
      await updateMe({ email }).unwrap();
    } catch (error) {
      console.error('Failed to update email:', error);
      toast.error(t('action failed'));
    }
  };

  const isLoading = isMeLoading || isUpdating;

  if (isError && !me) {
    return <QueryErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <ArrivalShine id="verifyEmail" className="flex flex-col gap-2">
        <label className="text-gray-secondary text-sm font-semibold px-1">{t('email')}</label>
        <Input
          loading={isMeLoading}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('enter your email')}
          prefix={<Mail size={18} className="text-gray-secondary" />}
          disabled={isLoading}
        />
        <p className="text-xs text-gray-secondary px-1">
          {t('confirm or change your email address')}
        </p>
        {me && !me.isVerified && (
          <div className="border-teal/30 bg-teal/12 mx-1 inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1">
            <BoltIcon size={13} />
            <span className="text-teal text-[11px] font-extrabold">
              {t('plus {n} ap', { n: GlobalConstants.apRewards.verifyEmail })}
            </span>
            <span className="text-[11px] text-white/50">{t('for verifying email')}</span>
          </div>
        )}
      </ArrivalShine>
      <Button
        onClick={handleSave}
        className="w-full"
        loading={isUpdating}
        disabled={isLoading || !email || email === me?.email}
      >
        {t('save')}
      </Button>
    </div>
  );
}
