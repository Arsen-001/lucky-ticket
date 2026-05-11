import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { ReactNode } from 'react';
import '@/styles/components/settings-card.css';

export type SettingsMenuAccent = 'pink' | 'gold' | 'purple' | 'teal' | 'error';

interface SettingsMenuItemProps {
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  title: string;
  description?: string;
  className?: string;
  rightElement?: ReactNode;
  accent?: SettingsMenuAccent;
}

const ACCENT_CLASS: Record<SettingsMenuAccent, string> = {
  pink: 'settings-card--pink',
  gold: 'settings-card--gold',
  purple: 'settings-card--purple',
  teal: 'settings-card--teal',
  error: 'settings-card--error',
};

export function SettingsMenuItem({
  href,
  onClick,
  icon,
  title,
  description,
  className,
  rightElement,
  accent = 'pink',
}: SettingsMenuItemProps) {
  const content = (
    <div
      className={twMerge(
        'settings-card flex items-center justify-between gap-4 rounded-xl px-4 py-3 transition-all active:scale-99 active:opacity-90 cursor-pointer',
        ACCENT_CLASS[accent],
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3.5 overflow-hidden flex-1">
        {icon && (
          <div className="flex-center h-10 w-10 shrink-0 rounded-xl bg-white/[0.04] text-pink">
            {icon}
          </div>
        )}
        <div className="flex flex-col overflow-hidden">
          <span className="text-white-secondary font-bold text-[15px] leading-tight truncate">
            {title}
          </span>
          {description && (
            <span className="text-[12px] text-gray-secondary font-semibold truncate mt-0.5">
              {description}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {rightElement}
        {!rightElement && <ChevronRight size={18} className="text-white/35" />}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
