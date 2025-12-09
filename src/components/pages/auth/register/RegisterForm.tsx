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

export function RegisterForm() {
  const t = useAppTranslations();

  const registerSchema = getRegisterSchema(t);

  const form = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    mode: 'onSubmit',
  });

  const {
    formState: { isSubmitting },
    clearErrors,
  } = form;

  async function onSubmit(values: RegisterFormValues) {
    clearErrors();
    console.log('Submitting register form...', values);
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Register form submitted successfully:', values);
  }

  return (
    <Form form={form} onSubmit={onSubmit}>
      <div className="flex flex-col w-full ">
        <FormItem name="email">
          <Input
            prefix={<Mail />}
            placeholder={t('email')}
            autoComplete="email"
          />
        </FormItem>

        <FormItem name="username">
          <Input
            prefix={<User />}
            placeholder={t('username')}
            autoComplete="username"
          />
        </FormItem>

        <PhoneNumberFormItem
          name="phone"
          prefix={<Phone />}
          numberInputProps={{ autoComplete: 'tel' }}
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

        <Button type="submit" loading={isSubmitting} aria-busy={isSubmitting}>
          {t('sign up')}
        </Button>
      </div>
    </Form>
  );
}
