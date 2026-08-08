'use client';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import { Input } from './Input';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface PasswordInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'prefix'
> {
  prefix?: ReactNode;
}

export function PasswordInput({ prefix, ...rest }: PasswordInputProps) {
  const t = useAppTranslations();
  const [show, setShow] = useState(false);

  return (
    <Input
      prefix={prefix}
      type={show ? 'text' : 'password'}
      suffix={
        <Button
          variant="transparent"
          type="button"
          // Icon-only, and the icon is the whole state: unnamed it announced as
          // "button" on every auth screen.
          aria-label={show ? t('hide password') : t('show password')}
          onClick={() => setShow(!show)}
          className="outline-none p-1"
        >
          {show ? (
            <EyeOff className="size-5 text-white/60" />
          ) : (
            <Eye className="size-5 text-white/60" />
          )}
        </Button>
      }
      {...rest}
    />
  );
}
