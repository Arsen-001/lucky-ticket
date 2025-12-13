import { cloneElement, type ReactElement, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface InfoProps {
  icon?: ReactElement<SVGAElement>;
  title?: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  className?: string;
  classNames?: {
    iconContainer?: string;
    icon?: string;
    title?: string;
    description?: string;
  };
}

export function Info({ icon, title, description, extra, className, classNames }: InfoProps) {
  return (
    <div
      className={twMerge(
        'flex-1 flex-center flex-col w-full h-full max-h-full p-5 rounded-lg overflow-x-hidden overflow-y-auto',
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
        <p className={twMerge('text-white-secondary mt-1 text-center', classNames?.description)}>
          {description}
        </p>
      )}
      {extra}
    </div>
  );
}
