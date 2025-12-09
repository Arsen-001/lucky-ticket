'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { PasswordInput } from '@/components/shared/form-elements/inputs/PasswordInput';
import { Button } from '@/components/shared/buttons/Button';
import { Lock } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Form } from '@/components/shared/form-elements/Form';
import { FormItem } from '@/components/shared/form-elements/FormItem';
import { getResetPasswordSchema } from '@/lib/yup/auth.schemes';
import type { ResetPasswordValues } from '@/types/interfaces/auth.interfaces';

export function ResetPasswordForm() {
  const t = useAppTranslations();

  const schema = getResetPasswordSchema(t);

  const form = useForm<ResetPasswordValues>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  const {
    formState: { isSubmitting },
    clearErrors,
  } = form;

  async function onSubmit(values: ResetPasswordValues) {
    clearErrors();
    console.log('Submitting reset password form...', values);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Password reset successfully!', values);
  }

  return (
    <Form form={form} onSubmit={onSubmit}>
      <div className="flex flex-col w-full">
        <FormItem name="password">
          <PasswordInput
            prefix={<Lock />}
            placeholder={t('new password')}
            autoComplete="new-password"
          />
        </FormItem>

        <FormItem name="confirmPassword">
          <PasswordInput
            prefix={<Lock />}
            placeholder={t('confirm password')}
            autoComplete="new-password"
          />
        </FormItem>

        <Button type="submit" loading={isSubmitting} aria-busy={isSubmitting}>
          {t('reset password')}
        </Button>
      </div>
    </Form>
  );
}
