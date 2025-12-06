import {
  PhoneNumberInput,
  type PhoneNumberInputProps,
} from '@/components/shared/form-elements/inputs/PhoneNumberInout';
import type { FormItemProps } from '@/components/shared/form-elements/FormItem';
import { useFormContext } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';

export function PhoneNumberFormItem({
  name,
  label,
  infoMessage,
  layout = 'vertical',
  noStyle,
  className,
  classNames,
  ...rest
}: Partial<PhoneNumberInputProps> & Omit<FormItemProps, 'children' | 'rules'>) {
  const {
    register,
    formState: { errors },
    setValue,
    getValues,
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  const isHorizontal = layout === 'horizontal';

  if (noStyle) {
    return (
      <PhoneNumberInput
        {...rest}
        value={getValues(name)}
        onChange={value => setValue(name, value)}
      />
    );
  }

  return (
    <div
      className={twMerge(
        'mb-1',
        isHorizontal ? 'flex items-center gap-4' : 'flex flex-col gap-1',
        className
      )}
    >
      {label && (
        <label
          htmlFor={name}
          className={twMerge(
            ' text-sm font-medium text-white-secondary',
            isHorizontal ? `transform -translate-y-3` : '',
            classNames?.label
          )}
        >
          {label}
        </label>
      )}

      <div className="flex flex-col w-full">
        <PhoneNumberInput
          {...rest}
          value={getValues(name)}
          onChange={value => {
            setValue(name, value);
            rest.onChange?.(value);
          }}
          numberInputProps={{
            ...register(name).ref,
            ref: null,
          }}
        />

        <p
          className={twMerge(
            'h-5 mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold',
            error ? 'text-error' : 'text-white-secondary/50',
            classNames?.info
          )}
        >
          {error || infoMessage || ''}
        </p>
      </div>
    </div>
  );
}
