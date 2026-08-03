import {
  PhoneNumberInput,
  type PhoneNumberInputProps,
} from '@/components/shared/form-elements/inputs/PhoneNumberInput';
import type { FormItemProps } from '@/components/shared/form-elements/FormItem';
import { useFormContext, useFormState } from 'react-hook-form';
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
  // No `register` here: the value reaches the form through `setValue`, and the
  // ref this component used to pass was discarded anyway (see numberInputProps).
  const { setValue, getValues } = useFormContext();
  // A local `useFormState` subscription, exactly as FormItem does. Reading
  // `formState.errors` off the context is invisible to the React Compiler's
  // memoization, so this item never re-rendered when its error appeared: the
  // phone is required, and submitting the register form without one showed no
  // message, no toast and no submit — the button simply did nothing, forever.
  const { errors } = useFormState({ name });

  const error = errors[name]?.message as string | undefined;
  const errorId = `${name}-error`;

  const isHorizontal = layout === 'horizontal';

  if (noStyle) {
    return (
      <PhoneNumberInput
        {...rest}
        name={name}
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
          // Was dropped on the floor, so the input had neither a name nor an
          // id — which also left the label's `htmlFor` pointing at nothing.
          name={name}
          value={getValues(name)}
          onChange={value => {
            setValue(name, value);
            rest.onChange?.(value);
          }}
          numberInputProps={{
            // The caller's own props (autoComplete, aria-label) used to be
            // overwritten here by `{...register(name).ref, ref: null}` —
            // spreading a function, which yields nothing but the `ref: null`
            // that then discarded RHF's ref as well. The value reaches the form
            // through `setValue`, so the ref was never what made this work.
            ...rest.numberInputProps,
            ...(error ? { 'aria-invalid': true, 'aria-describedby': errorId } : {}),
          }}
        />

        <p
          id={errorId}
          role={error ? 'alert' : undefined}
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
