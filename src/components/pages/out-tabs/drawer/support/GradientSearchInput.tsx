'use client';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Search } from 'lucide-react';
import {
  DebouncedInput,
  type DebouncedInputProps,
} from '@/components/shared/form-elements/inputs/DebouncedInput';

export function GradientSearchInput({ className, ...props }: DebouncedInputProps) {
  const t = useAppTranslations();
  return (
    <DebouncedInput
      name="search"
      className={twMerge(
        'bg-purple-gradient px-4 py-3 border-none text-white placeholder:text-white/60',
        className
      )}
      classNames={{
        input: 'placeholder:text-white/60 font-medium',
      }}
      placeholder={t('search')}
      {...props}
      suffix={<Search size={18} className="text-white-secondary stroke-2" />}
    />
  );
}
