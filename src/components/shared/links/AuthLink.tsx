import { Link, type LinkProps } from '@/components/shared/links/Link';
import { twMerge } from 'tailwind-merge';

export function AuthLink({ children, ...rest }: LinkProps) {
  return (
    <Link
      {...rest}
      className={twMerge(
        'text-pink underline text-sm tap-target relative inline-block',
        rest.className
      )}
    >
      {children}
    </Link>
  );
}
