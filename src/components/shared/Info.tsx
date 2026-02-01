import { cloneElement, type ReactElement, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type InfoVariants = 'transparent' | 'purple-gradient' | 'pink-gradient';
export interface InfoProps {
  icon?: ReactElement<SVGAElement>;
  title?: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  className?: string;
  variant?: InfoVariants;
  animateOnMount?: boolean;
  classNames?: {
    iconContainer?: string;
    icon?: string;
    title?: string;
    description?: string;
  };
}

export function Info({
  icon,
  variant = 'transparent',
  title,
  description,
  extra,
  className,
  classNames,
  animateOnMount,
}: InfoProps) {
  const variantClasses: Record<InfoVariants, string> = {
    'pink-gradient': 'bg-pink-gradient',
    'purple-gradient': 'bg-purple-gradient',
    transparent: 'bg-transparent',
  };
  return (
    <div
      className={twMerge(
        'flex-1 flex-center flex-col w-full h-full max-h-full p-5 rounded-lg overflow-x-hidden overflow-y-auto',
        variantClasses[variant],
        animateOnMount && 'animate-fade-in',
        className
      )}
    >
      {icon && (
        <div
          className={twMerge(
            'bg-pink flex-center h-15 w-15 rounded-full ',
            classNames?.iconContainer
          )}
        >
          {cloneElement(icon, { className: twMerge('w-8 h-8', classNames?.icon) })}
        </div>
      )}
      {title && (
        <h4 className={twMerge('text-pink text-lg font-bold mt-3 text-center', classNames?.title)}>
          {title}
        </h4>
      )}
      {description && (
        <p
          className={twMerge(
            'text-white-secondary mt-1 text-center leading-1 text-sm',
            classNames?.description
          )}
        >
          {description}
        </p>
      )}
      {extra}
    </div>
  );
}
