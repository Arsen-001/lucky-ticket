'use client';

import { type HTMLAttributes, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { BackButton } from '@/components/shared/buttons/BackButton';
import { handleSafeBack } from '@/utils/global/navigation.utils';
import { Button, type ButtonProps } from '@/components/shared/buttons/Button';

interface PageHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  hideBackButton?: boolean;
  backRoute?: string;
  extra?: ReactNode;
  extraButtonProps?: ButtonProps | false;
  className?: string;
}

export function PageHeader({
  title,
  hideBackButton,
  backRoute,
  extra,
  extraButtonProps,
  className,
  ...props
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => handleSafeBack(router, backRoute);
  return (
    <div
      className={twMerge('py-5.75 px-5 relative flex items-center justify-between', className)}
      {...props}
    >
      <div className="flex items-center z-10">
        {!hideBackButton && <BackButton onClick={handleBack} />}
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 max-w-[60%] w-full flex justify-center">
        {title && (
          <h1 className="text-white text-lg font-bold truncate text-center w-full">{title}</h1>
        )}
      </div>

      <div className="flex items-center justify-end z-10">
        {!!extra
          ? extra
          : !!extraButtonProps && (
              <Button
                iconSize={18}
                variant="secondary"
                {...extraButtonProps}
                className={twMerge('p-2 text-sm', extraButtonProps?.className)}
              />
            )}
      </div>
    </div>
  );
}
