import type { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export type ButtonVariants = 'primary' | 'secondary' | 'transparent';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariants;
  loading?: boolean;
}

export function Button({
  className,
  children,
  variant = 'primary',
  loading = false,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes: Record<ButtonVariants, string> = {
    primary: 'bg-pink-gradient',
    secondary: 'bg-gradient-purple',
    transparent: 'bg-transparent',
  };

  return (
    <button
      disabled={disabled || loading}
      className={twMerge(
        classes[variant],
        ` text-white font-semibold py-3.5 px-6 rounded-lg
          transition-all duration-100 transform
          
          active:scale-99
          
          focus-visible:outline-none 
          focus-visible:ring-1 
          focus-visible:ring-white

          disabled:opacity-50
          disabled:cursor-not-allowed
          disabled:active:scale-100
          disabled:hover:none`,
        className,
        loading
          ? 'disabled:opacity-80 relative flex items-center justify-center gap-2'
          : '',
        !loading && disabled ? 'disabled:bg-disabled' : ''
      )}
      type={type}
      {...rest}
    >
      {children}
      {loading && <Loader2 className="size-5 animate-spin" />}
    </button>
  );
}
