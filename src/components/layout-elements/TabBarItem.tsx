import { cloneElement, type CSSProperties, type ReactElement } from 'react';
import { Button } from '@/components/shared/buttons/Button';
import { twMerge } from 'tailwind-merge';
import '@/styles/components/tab-bar-item.css';
import type { LucideProps } from 'lucide-react';

export interface TabBarItemProps {
  active: boolean;
  onClick?: () => void;
  icon: ReactElement<LucideProps>;
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
      {cloneElement<LucideProps>(icon, { size: 22 })}
      <span
        className={twMerge(
          'max-w-0 whitespace-nowrap overflow-hidden h-5.5',
          active && 'ml-1 max-w-[24vw] tab-bar-transition font-bold truncate'
        )}
      >
        {name}
      </span>
    </Button>
  );
}
