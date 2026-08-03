'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Input } from '@/components/shared/form-elements/inputs/Input';
import { PasswordInput } from '@/components/shared/form-elements/inputs/PasswordInput';
import { Button } from '@/components/shared/buttons/Button';

import { Lock, Mail, Phone, User } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Form } from '@/components/shared/form-elements/Form';
import { FormItem } from '@/components/shared/form-elements/FormItem';
import { getRegisterSchema } from '@/lib/yup/auth.schemes';
import type { RegisterFormValues } from '@/types/interfaces/auth.interfaces';
import { PhoneNumberFormItem } from '@/components/shared/form-elements/form-item-wrapped-elements/PhoneNumberFormItem';
import { useRouter } from 'next/navigation';
import { routes } from '@/constants/routes';
import { useRegisterMutation } from '@/api/auth.api';
import { useToast } from '@/hooks/useToast';

export function RegisterForm() {
  const t = useAppTranslations();
  const router = useRouter();
  const toast = useToast();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const registerSchema = getRegisterSchema(t);

  const form = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    mode: 'onSubmit',
  });

  const { clearErrors } = form;

  async function onSubmit(values: RegisterFormValues) {
    clearErrors();
    try {
      await registerUser({
        username: values.username,
        email: values.email,
        password: values.password,
      }).unwrap();
      router.push(routes.home);
    } catch {
      toast.error(t('action failed'));
    }
  }

  return (
    <Form form={form} onSubmit={onSubmit}>
      <div className="flex flex-col w-full ">
        <FormItem name="email">
          <Input prefix={<Mail />} placeholder={t('email')} autoComplete="email" />
        </FormItem>

        <FormItem name="username">
          <Input prefix={<User />} placeholder={t('username')} autoComplete="username" />
        </FormItem>

        <PhoneNumberFormItem
          name="phone"
          prefix={<Phone />}
          // The only field on this form with no placeholder to fall back on, so
          // without this it is announced as an unnamed text box.
          numberInputProps={{ autoComplete: 'tel', 'aria-label': t('phone') }}
        />

        <FormItem name="password">
          <PasswordInput
            prefix={<Lock />}
            placeholder={t('password')}
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

        <Button type="submit" loading={isLoading} aria-busy={isLoading}>
          {t('sign up')}
        </Button>
      </div>
    </Form>
  );
}
