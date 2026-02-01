import type { HTMLAttributes } from 'react';
import { type ButtonProps } from '@/components/shared/buttons/Button';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { twMerge } from 'tailwind-merge';
import { TermButton } from '@/components/shared/term/TermButton';
import '@/styles/components/term.css';

export interface TermProps extends HTMLAttributes<HTMLDivElement> {
  acceptButtonProps?: ButtonProps;
  denyButtonProps?: ButtonProps;
  loading?: boolean;
}

export function Term({
  acceptButtonProps,
  denyButtonProps,
  className,
  children,
  loading,
  ...props
}: TermProps) {
  return (
    <div className={twMerge('h-full flex-col-stretch gap-5', className)} {...props}>
      <div className="h-full flex-1 overflow-hidden term-inset-shadow">
        <div className="h-full px-3 py-1.5 overflow-auto main-scrollbar">
          <SkeletonSuspense
            loading={loading}
            skeleton={
              <div className="flex flex-col gap-2">
                <Skeleton variant="text" lines={10} textSize="sm" className="w-full" />
              </div>
            }
          >
            <div>{children}</div>
          </SkeletonSuspense>
        </div>
      </div>
      {(denyButtonProps || acceptButtonProps) && (
        <div className="flex-center gap-3">
          {denyButtonProps && <TermButton actionType="deny" {...denyButtonProps} />}
          {acceptButtonProps && <TermButton actionType="accept" {...acceptButtonProps} />}
        </div>
      )}
    </div>
  );
}
