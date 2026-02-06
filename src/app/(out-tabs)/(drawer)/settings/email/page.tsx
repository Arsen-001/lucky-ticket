'use client';

import { useEffect, useState } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Input } from '@/components/shared/form-elements/inputs/Input';
import { Button } from '@/components/shared/buttons/Button';
import { Mail } from 'lucide-react';
import { useGetMeQuery, useUpdateMeMutation } from '@/api/me.api';

export default function EmailPage() {
  const t = useAppTranslations();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
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
    }
  };

  const isLoading = isMeLoading || isUpdating;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
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
      </div>
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
