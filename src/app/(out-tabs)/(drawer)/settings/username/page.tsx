'use client';

import { useEffect, useState } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { Input } from '@/components/shared/form-elements/inputs/Input';
import { Button } from '@/components/shared/buttons/Button';
import { UserPen } from 'lucide-react';
import { useGetMeQuery, useUpdateMeMutation } from '@/api/me.api';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { GlobalConstants } from '@/constants/global.constants';

export default function UsernamePage() {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: me, isLoading: isMeLoading, isError, refetch } = useGetMeQuery();
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (me?.username) {
      setUsername(me.username);
    }
  }, [me]);

  const handleSave = async () => {
    const next = username.trim();
    if (!next || next === me?.username) return;
    if (!GlobalConstants.usernamePattern.test(next)) {
      toast.error(t('invalid username characters'));
      return;
    }
    try {
      await updateMe({ username: next }).unwrap();
      toast.success(t('username updated'));
    } catch (error) {
      const status = (error as { status?: number })?.status;
      toast.error(status === 409 ? t('username already taken') : t('action failed'));
    }
  };

  const isLoading = isMeLoading || isUpdating;

  if (isError && !me) {
    return <QueryErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-gray-secondary text-sm font-semibold px-1">{t('username')}</label>
        <Input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder={t('enter your username')}
          prefix={<UserPen size={18} className="text-gray-secondary" />}
          disabled={isLoading}
          loading={isLoading}
          maxLength={GlobalConstants.usernameMaxLength}
        />
      </div>
      <Button
        onClick={handleSave}
        className="w-full"
        loading={isUpdating}
        disabled={isLoading || !username || username === me?.username}
      >
        {t('save')}
      </Button>
    </div>
  );
}
