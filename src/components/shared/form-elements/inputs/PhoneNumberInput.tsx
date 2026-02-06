import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { twMerge } from 'tailwind-merge';
import { type ComponentProps } from 'react';
import type { InputProps } from '@/components/shared/form-elements/inputs/Input';
import '@/styles/components/phone-input.css';
import { Loader2 } from 'lucide-react';

export type PhoneNumberInputProps = ComponentProps<typeof PhoneInput> &
  Pick<InputProps, 'prefix' | 'suffix' | 'loading' | 'classNames'>;

export const PhoneNumberInput = ({
  className,
  classNames,
  prefix,
  suffix,
  loading,
  name,
  numberInputProps,
  ...rest
}: PhoneNumberInputProps) => {
  return (
    <div
      className={twMerge(
        'flex items-center gap-2 bg-background-overlay text-sm p-4 rounded-lg w-full focus-within:ring-1 focus-within:ring-white',
        className
      )}
    >
      {prefix && <span className={twMerge('shrink-0', classNames?.prefix)}>{prefix}</span>}

      <PhoneInput
        defaultCountry="US"
        className="phone-number-input w-full"
        international={true}
        withCountryCallingCode={true}
        countryCallingCodeEditable={false}
        displayInitialValueAsLocalNumber={false}
        {...rest}
        disabled={loading || rest?.disabled}
        numberInputProps={{
          ...numberInputProps,
          name,
          id: name,
        }}
      />

      {(suffix || loading) && (
        <span className={twMerge('shrink-0', classNames?.suffix)}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : suffix}
        </span>
      )}
    </div>
  );
};
