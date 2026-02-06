import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { ReactNode } from 'react';

interface SettingsMenuItemProps {
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  title: string;
  description?: string;
  className?: string;
  rightElement?: ReactNode;
}

export function SettingsMenuItem({
  href,
  onClick,
  icon,
  title,
  description,
  className,
  rightElement,
}: SettingsMenuItemProps) {
  const content = (
    <div
      className={twMerge(
        'flex items-center justify-between gap-4 bg-purple-gradient px-4 py-3 rounded-xl transition-all active:opacity-80 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 overflow-hidden flex-1">
        {icon && <div className="text-pink shrink-0">{icon}</div>}
        <div className="flex flex-col overflow-hidden">
          <span className="text-white-secondary font-semibold text-base truncate">{title}</span>
          {description && (
            <span className="text-sm text-gray-secondary font-semibold truncate">
              {description}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {rightElement}
        {!rightElement && <ChevronRight size={20} className="text-gray-secondary" />}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
