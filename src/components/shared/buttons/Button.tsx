import type { ButtonHTMLAttributes, Ref } from 'react';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export type ButtonVariants =
  | 'primary'
  | 'secondary'
  | 'transparent'
  | 'purpleGradient'
  | 'outlined';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariants;
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
  loadingIconSize?: number;
}

export function Button({
  className,
  children,
  variant = 'primary',
  loading = false,
  loadingIconSize = 20,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const variantClasses: Record<ButtonVariants, string> = {
    primary: 'bg-pink-gradient',
    secondary: 'bg-gradient-purple',
    transparent: 'bg-transparent',
    purpleGradient: 'bg-purple-gradient',
    outlined: 'border border-white bg-transparent',
  };

  return (
    <button
      disabled={disabled || loading}
      className={twMerge(
        variantClasses[variant],
        ` text-white font-semibold py-3.5 px-6 rounded-lg
          transition-all duration-100 transform
          
          active:scale-99
          
          focus-outline
          
          disabled:opacity-50
          disabled:cursor-not-allowed
          disabled:active:scale-100
          disabled:hover:none
          hover:cursor-pointer`,
        loading ? 'disabled:opacity-80 relative flex items-center justify-center gap-2' : '',
        !loading && disabled ? 'disabled:bg-disabled' : '',
        className
      )}
      type={type}
      onClick={!loading ? rest.onClick : undefined}
      {...rest}
    >
      {children}
      {loading && <Loader2 size={loadingIconSize} className="animate-spin" />}
    </button>
  );
}
