import { twMerge } from 'tailwind-merge';
import { type FC, type ReactNode, type SVGProps } from 'react';

export interface BadgeProps {
  hideText?: boolean;
  className?: string;
  icon?: FC<SVGProps<SVGSVGElement>>;
  text?: ReactNode;
  classNames?: {
    icon?: string;
    text?: string;
  };
}

export function Badge({
  className,
  text,
  classNames,
  hideText,
  icon: Icon,
}: BadgeProps) {
  return (
    <div
      className={twMerge(
        'flex gap-1 justify-center items-center py-1 px-2.5 text-white-secondary bg-[currentColor]/10 w-fit rounded-full',
        className
      )}
    >
      {Icon && (
        <Icon className={twMerge('text-inherit w-4 h-4', classNames?.icon)} />
      )}
      {text && !hideText && (
        <span className={twMerge('text-inherit text-xs', classNames?.text)}>
          {text}
        </span>
      )}
    </div>
  );
}
