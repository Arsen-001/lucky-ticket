import type { ReactNode } from 'react';
import { Button } from '@/components/shared/buttons/Button';
import { twMerge } from 'tailwind-merge';
import '@/styles/components/tab-bar-item.css';

export interface TabBarItemProps {
  active: boolean;
  onClick?: () => void;
  icon: ReactNode;
  name: string;
}
export function TabBarItem({ active, onClick, name, icon }: TabBarItemProps) {
  return (
    <Button
      variant={active ? 'primary' : 'transparent'}
      onClick={onClick}
      className={twMerge('p-3 flex-center rounded-full')}
    >
      {icon}
      <span
        className={twMerge(
          'max-w-0 overflow-hidden',
          active && 'ml-2 max-w-[25vw] tab-bar-transition font-semibold truncate',
          active && 'truncate',
          active && 'overflow-hidden',
          active && 'whitespace-nowrap',
          active && 'text-ellipsis'
        )}
      >
        {name}
      </span>
    </Button>
  );
}
