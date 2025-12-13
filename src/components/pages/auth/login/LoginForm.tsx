'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Input } from '@/components/shared/form-elements/inputs/Input';
import { PasswordInput } from '@/components/shared/form-elements/inputs/PasswordInput';
import { Button } from '@/components/shared/buttons/Button';

import { Lock, Mail } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Form } from '@/components/shared/form-elements/Form';
import { FormItem } from '@/components/shared/form-elements/FormItem';
import { getLoginSchema } from '@/lib/yup/auth.schemes';
import type { LoginFormValues } from '@/types/interfaces/auth.interfaces';
import { useRouter } from 'next/navigation';
import { routes } from '@/constants/routes';

export function LoginForm() {
  const t = useAppTranslations();
  const router = useRouter();

  const loginSchema = getLoginSchema(t);

  const form = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
  });

  const {
    formState: { isSubmitting },
    clearErrors,
  } = form;

  async function onSubmit(values: LoginFormValues) {
    clearErrors();
    console.log('Submitting form...', values);
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push(routes.home);
    console.log('Form submitted successfully:', values);
  }

  return (
    <Form form={form} onSubmit={onSubmit}>
      <div className="flex flex-col w-full">
        <FormItem name="email">
          <Input prefix={<Mail />} placeholder={t('email or username')} autoComplete="username" />
        </FormItem>

        <FormItem name="password">
          <PasswordInput
            prefix={<Lock />}
            placeholder={t('password')}
            autoComplete="current-password"
          />
        </FormItem>

        <Button type="submit" loading={isSubmitting} aria-busy={isSubmitting}>
          {t('sign in')}
        </Button>
      </div>
    </Form>
  );
}
