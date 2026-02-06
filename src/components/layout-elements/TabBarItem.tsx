import type { CSSProperties, ReactNode } from 'react';
import { Button } from '@/components/shared/buttons/Button';
import { twMerge } from 'tailwind-merge';
import '@/styles/components/tab-bar-item.css';

export interface TabBarItemProps {
  active: boolean;
  onClick?: () => void;
  icon: ReactNode;
  name: string;
  className?: string;
  style?: CSSProperties;
}
export function TabBarItem({ active, onClick, name, icon, className, style }: TabBarItemProps) {
  return (
    <Button
      variant={active ? 'primary' : 'transparent'}
      onClick={onClick}
      style={style}
      className={twMerge('p-3 flex-center rounded-full', className)}
    >
      {icon}
      <span
        className={twMerge(
          'max-w-0 whitespace-nowrap overflow-hidden ',
          active && 'ml-2 max-w-[20vw] tab-bar-transition font-semibold truncate'
        )}
      >
        {name}
      </span>
    </Button>
  );
}
