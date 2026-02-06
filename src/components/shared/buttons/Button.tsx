import type { ButtonHTMLAttributes, ReactElement, ReactNode, Ref } from 'react';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Loader2, type LucideProps } from 'lucide-react';

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
  iconSize?: number;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Button({
  className,
  children,
  variant = 'primary',
  loading = false,
  iconSize = 20,
  icon,
  iconPosition = 'left',
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

  const renderIcon = () => {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as ReactElement<LucideProps>, {
        size: iconSize,
        width: iconSize,
        height: iconSize,
        style: {
          minWidth: iconSize,
          minHeight: iconSize,
        },
      });
    }

    if (typeof icon === 'function') {
      const Icon = icon as React.ComponentType<LucideProps>;
      return <Icon size={iconSize} width={iconSize} height={iconSize} />;
    }

    return icon;
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
        loading || icon ? 'disabled:opacity-80 relative flex-center gap-2' : '',
        !loading && disabled ? 'disabled:bg-disabled' : '',
        className
      )}
      type={type}
      onClick={!loading ? rest.onClick : undefined}
      {...rest}
    >
      {!loading && icon && iconPosition === 'left' && renderIcon()}
      {children}
      {loading ? (
        <Loader2
          style={{ minWidth: iconSize, minHeight: iconSize }}
          size={iconSize}
          width={iconSize}
          height={iconSize}
          className="animate-spin"
        />
      ) : (
        icon && iconPosition === 'right' && renderIcon()
      )}
    </button>
  );
}
