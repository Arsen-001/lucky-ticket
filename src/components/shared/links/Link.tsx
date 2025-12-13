import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import type { Route } from '@/constants/routes';

export interface LinkProps extends Omit<NextLinkProps, 'href'> {
  children: ReactNode;
  className?: string;
  href: Route;
  tabIndex?: number;
}

export function Link({ children, className, ...rest }: LinkProps) {
  return (
    <NextLink
      className={twMerge(
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-md',
        className
      )}
      {...rest}
    >
      {children}
    </NextLink>
  );
}
