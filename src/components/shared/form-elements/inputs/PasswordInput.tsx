'use client';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import { Input } from './Input';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';

export interface PasswordInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'prefix'
> {
  prefix?: ReactNode;
}

export function PasswordInput({ prefix, ...rest }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <Input
      prefix={prefix}
      type={show ? 'text' : 'password'}
      suffix={
        <Button
          variant="transparent"
          type="button"
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
