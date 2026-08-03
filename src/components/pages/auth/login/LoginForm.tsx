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
import { useLoginMutation } from '@/api/auth.api';
import { useToast } from '@/hooks/useToast';

export function LoginForm() {
  const t = useAppTranslations();
  const router = useRouter();
  const toast = useToast();
  const [login, { isLoading }] = useLoginMutation();

  const loginSchema = getLoginSchema(t);

  const form = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
  });

  const { clearErrors } = form;

  async function onSubmit(values: LoginFormValues) {
    clearErrors();
    try {
      await login({ email: values.email, password: values.password }).unwrap();
      router.push(routes.home);
    } catch (error) {
      // The backend now has three distinct refusals here, and collapsing them
      // into "wrong password" makes a locked-out user keep guessing:
      //  • 429 — per-IP throttle (10/min)
      //  • 401 with a message — per-email lockout (10 fails / 15 min); the
      //    server's text is the only place the wait is stated
      //  • 401 without one — genuinely wrong credentials
      const status = (error as { status?: number })?.status;
      const serverMessage = (error as { data?: { message?: string } } | undefined)?.data?.message;
      if (status === 429) {
        toast.error(t('too many attempts try later'));
      } else if (status === 401 && serverMessage) {
        toast.error(serverMessage);
      } else {
        toast.error(t('invalid credentials'));
      }
    }
  }

  return (
    <Form form={form} onSubmit={onSubmit}>
      <div className="flex flex-col w-full">
        <FormItem name="email">
          <Input prefix={<Mail />} placeholder={t('email')} autoComplete="email" />
        </FormItem>

        <FormItem name="password">
          <PasswordInput
            prefix={<Lock />}
            placeholder={t('password')}
            autoComplete="current-password"
          />
        </FormItem>

        <Button type="submit" loading={isLoading} aria-busy={isLoading}>
          {t('sign in')}
        </Button>
      </div>
    </Form>
  );
}
