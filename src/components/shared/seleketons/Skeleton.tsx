import React, { type HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import '@/styles/components/skeleton.css';

type Variant = 'text' | 'line' | 'title' | 'round' | 'card' | 'rounded-rectangle';
type TextSize =
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | '8xl'
  | '9xl';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  textSize?: TextSize;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  textSize = 'base',
  className,
  ...rest
}) => {
  const variantClass = {
    text: 'skeleton-text',
    line: 'skeleton-line',
    title: 'skeleton-title',
    round: 'skeleton-round',
    card: 'skeleton-card',
    'rounded-rectangle': 'skeleton-rounded-rectangle',
  }[variant];

  const heightBasedOnTextSize = {
    xs: 'h-4',
    sm: 'h-5',
    base: 'h-6',
    lg: 'h-7',
    xl: 'h-7',
    '2xl': 'h-8',
    '3xl': 'h-9',
    '4xl': 'h-10',
    '5xl': 'h-12',
    '6xl': 'h-15',
    '7xl': 'h-18',
    '8xl': 'h-24',
    '9xl': 'h-32',
  }[textSize];

  return (
    <div
      {...rest}
      aria-hidden
      className={twMerge(
        'h-2.25',
        'skeleton w-full',
        variantClass,
        heightBasedOnTextSize,
        className
      )}
    />
  );
};
