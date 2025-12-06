'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Input } from '@/components/shared/form-elements/inputs/Input';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Form } from '@/components/shared/form-elements/Form';
import { FormItem } from '@/components/shared/form-elements/FormItem';
import { getTwoFactorSchema } from '@/lib/yup/auth.schemes';
import type { TwoFactorValues } from '@/types/interfaces/auth.interfaces';

export function TwoFactorForm() {
  const t = useAppTranslations();

  const schema = getTwoFactorSchema(t);

  const form = useForm<TwoFactorValues>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  const {
    formState: { isSubmitting },
    clearErrors,
    handleSubmit,
  } = form;

  async function onSubmit(values: TwoFactorValues) {
    clearErrors();
    console.log('Submitting 2FA code...', values);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('2FA verified successfully!', values);
  }

  return (
    <Form form={form} onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col w-full">
        <FormItem name="code">
          <Input
            placeholder={t('enter code')}
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
          />
        </FormItem>

        <Button type="submit" loading={isSubmitting} aria-busy={isSubmitting}>
          {t('verify')}
        </Button>
      </div>
    </Form>
  );
}
