'use client';

import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Input, type InputProps } from './Input';

export interface DebouncedInputProps extends Omit<InputProps, 'onChange'> {
  onChange: (value: string) => void;
  debounce?: number;
}

export function DebouncedInput({
  onChange,
  debounce = 500,
  value: initialValue,
  defaultValue,
  ...rest
}: DebouncedInputProps) {
  const [value, setValue] = useState<string>(String(initialValue ?? defaultValue ?? ''));
  const debouncedValue = useDebounce(value, debounce);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!debounce) {
      onChange(value);
    } else {
      setValue(value);
    }
  };

  return <Input {...rest} value={value} onChange={handleChange} />;
}
