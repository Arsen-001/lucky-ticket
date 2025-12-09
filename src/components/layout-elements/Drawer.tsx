'use client';
import { twMerge } from 'tailwind-merge';
import { useAppDispatch, useAppSelector } from '@/lib/rtk/hooks';
import { closeDrawer, selectDrawerOpen } from '@/lib/rtk/features/layout.slice';
import { ClientPortal } from '@/components/shared/ClientPortal';

export function Drawer() {
  const open = useAppSelector(selectDrawerOpen);
  const dispatch = useAppDispatch();

  const handleDrawerClose = () => {
    dispatch(closeDrawer());
  };
  return (
    <ClientPortal>
      <div
        className={twMerge(
          'fixed inset-0 z-60',
          !open && 'pointer-events-none'
        )}
      >
        <div
          className={twMerge(
            'absolute inset-0 transition-opacity duration-300 bg-fade',
            open ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={handleDrawerClose}
        />
        <div
          className={twMerge(
            'fixed top-0 bottom-0 right-0 w-[50vw] bg-background-overlay transition-all duration-300 rounded-l-4xl z-1]',
            open ? 'right-0' : '-right-[50vw]'
          )}
        ></div>
      </div>
    </ClientPortal>
  );
}
