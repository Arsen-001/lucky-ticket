import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type DividerVariant = 'solid' | 'dashed' | 'dotted';
export type DividerTitlePlacement = 'start' | 'center' | 'end';

export interface DividerProps {
  children?: ReactNode;
  titlePlacement?: DividerTitlePlacement;
  vertical?: boolean;
  className?: string;
  classNames?: {
    title?: string;
  };
  variant?: DividerVariant;
}

export function Divider({
  children,
  titlePlacement = 'center',
  vertical = false,
  className,
  classNames,
  variant = 'solid',
}: DividerProps) {
  const lineStyle = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  }[variant];

  const defaultClassNames = 'border-white-secondary border-t';

  if (vertical) {
    return <div className={twMerge(defaultClassNames, 'h-full mx-2', lineStyle, className)} />;
  }
  if (!children) {
    return <div className={twMerge(defaultClassNames, 'my-2', className)} />;
  }

  return (
    <div className={twMerge('flex w-full items-center gap-2', className)}>
      <div
        className={twMerge(
          defaultClassNames,
          'flex-1',
          lineStyle,
          titlePlacement === 'start' && 'flex-none w-0'
        )}
      />

      {children && (
        <span className={twMerge('text-sm text-gray-500', classNames?.title)}>{children}</span>
      )}

      <div
        className={twMerge(
          defaultClassNames,
          'flex-1',
          lineStyle,
          titlePlacement === 'end' && 'flex-none w-0'
        )}
      />
    </div>
  );
}
