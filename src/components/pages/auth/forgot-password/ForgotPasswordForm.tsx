'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Input } from '@/components/shared/form-elements/inputs/Input';
import { Button } from '@/components/shared/buttons/Button';

import { Mail } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Form } from '@/components/shared/form-elements/Form';
import { FormItem } from '@/components/shared/form-elements/FormItem';
import { getForgotPasswordSchema } from '@/lib/yup/auth.schemes';
import type { ForgotPasswordValues } from '@/types/interfaces/auth.interfaces';

export function ForgotPasswordForm() {
  const t = useAppTranslations();

  const schema = getForgotPasswordSchema(t);

  const form = useForm<ForgotPasswordValues>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  const {
    formState: { isSubmitting },
    clearErrors,
  } = form;

  async function onSubmit(values: ForgotPasswordValues) {
    clearErrors();
    console.log('Submitting forgot password form...', values);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Email sent!', values);
  }

  return (
    <Form form={form} onSubmit={onSubmit}>
      <div className="flex flex-col w-full">
        <FormItem name="email">
          <Input prefix={<Mail />} placeholder={t('email')} autoComplete="email" />
        </FormItem>

        <Button type="submit" loading={isSubmitting} aria-busy={isSubmitting}>
          {t('request reset email')}
        </Button>
      </div>
    </Form>
  );
}
