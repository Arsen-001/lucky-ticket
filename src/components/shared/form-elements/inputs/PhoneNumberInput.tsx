import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { twMerge } from 'tailwind-merge';
import { type ComponentProps } from 'react';
import type { InputProps } from '@/components/shared/form-elements/inputs/Input';
import '@/styles/components/phone-input.css';

export type PhoneNumberInputProps = ComponentProps<typeof PhoneInput> &
  Pick<InputProps, 'prefix' | 'suffix'>;

export const PhoneNumberInput = ({
  className,
  classNames,
  prefix,
  suffix,
  name,
  numberInputProps,
  ...rest
}: PhoneNumberInputProps) => {
  return (
    <div
      className={twMerge(
        'flex items-center gap-2 bg-background/40 text-sm p-4 rounded-lg w-full focus-within:ring-1 focus-within:ring-white',
        className
      )}
    >
      {prefix && <span className={twMerge('shrink-0', classNames?.prefix)}>{prefix}</span>}

      <PhoneInput
        defaultCountry="US"
        className="phone-number-input"
        international={true}
        withCountryCallingCode={true}
        countryCallingCodeEditable={false}
        displayInitialValueAsLocalNumber={false}
        {...rest}
        numberInputProps={{
          ...numberInputProps,
          name,
          id: name,
        }}
      />

      {suffix && <span className={twMerge('shrink-0', classNames?.suffix)}>{suffix}</span>}
    </div>
  );
};
