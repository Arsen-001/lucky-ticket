'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { UserPen } from 'lucide-react';
import { useGetMeQuery, useUpdateMeMutation } from '@/api/me.api';
import { Button } from '@/components/shared/buttons/Button';
import { Form } from '@/components/shared/form-elements/Form';
import { FormItem } from '@/components/shared/form-elements/FormItem';
import { Input } from '@/components/shared/form-elements/inputs/Input';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { getUsernameSchema } from '@/lib/yup/profile.schemes';

export interface SettingsUsernameModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsUsernameModal({ open, onClose }: SettingsUsernameModalProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: me } = useGetMeQuery();
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();

  // `values` keeps the field in sync with the freshest `me` snapshot between
  // opens without remount tricks; while the user types, `me` doesn't change.
  const form = useForm({
    resolver: yupResolver(getUsernameSchema(t)),
    mode: 'onBlur',
    values: { username: me?.username ?? '' },
  });

  const handleSubmit = async ({ username }: { username: string }) => {
    if (username === me?.username) {
      onClose();
      return;
    }
    try {
      await updateMe({ username }).unwrap();
      toast.success(t('username updated'));
      onClose();
    } catch (error) {
      const status = (error as { status?: number })?.status;
      toast.error(status === 409 ? t('username already taken') : t('action failed'));
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient flex flex-col gap-5 rounded-2xl p-6">
        <div className="flex flex-col gap-1 text-center">
          <h3 className="text-xl font-bold text-white">{t('change username')}</h3>
          <p className="text-sm text-white/65 leading-relaxed">
            {t('change username description')}
          </p>
        </div>

        <Form form={form} onSubmit={handleSubmit} noStyle>
          <FormItem name="username">
            <Input
              placeholder={t('enter your username')}
              prefix={<UserPen size={18} className="text-gray-secondary" />}
              disabled={isSaving}
            />
          </FormItem>

          <div className="flex-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="rounded-full px-4 py-2"
              disabled={isSaving}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="rounded-full px-4 py-1.5"
              loading={isSaving}
            >
              {t('save')}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
