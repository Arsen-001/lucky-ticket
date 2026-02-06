'use client';

import { useEffect, useState } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { PhoneNumberInput } from '@/components/shared/form-elements/inputs/PhoneNumberInput';
import { Button } from '@/components/shared/buttons/Button';
import { Phone } from 'lucide-react';
import { useGetMeQuery, useUpdateMeMutation } from '@/api/me.api';

export default function PhonePage() {
  const t = useAppTranslations();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
  const [phone, setPhone] = useState<string>();

  useEffect(() => {
    if (me?.phoneNumber) {
      setPhone(me.phoneNumber);
    }
  }, [me]);

  const handleSave = async () => {
    if (!phone || phone === me?.phoneNumber) return;
    try {
      await updateMe({ phoneNumber: phone }).unwrap();
    } catch (error) {
      console.error('Failed to update phone:', error);
    }
  };

  const isLoading = isMeLoading || isUpdating;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-gray-secondary text-sm font-semibold px-1">{t('phone')}</label>
        <PhoneNumberInput
          value={phone}
          onChange={setPhone}
          placeholder={t('enter your phone number')}
          prefix={<Phone size={18} className="text-gray-secondary" />}
          disabled={isLoading}
          loading={isLoading}
        />
        <p className="text-xs text-gray-secondary px-1">
          {t('confirm or change your phone number')}
        </p>
      </div>
      <Button
        onClick={handleSave}
        className="w-full"
        loading={isUpdating}
        disabled={isLoading || !phone || phone === me?.phoneNumber}
      >
        {t('save')}
      </Button>
    </div>
  );
}
