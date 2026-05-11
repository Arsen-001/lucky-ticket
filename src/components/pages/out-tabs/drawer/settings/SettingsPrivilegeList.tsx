'use client';

import { Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';

export interface SettingsPrivilegeListProps {
  title?: string;
  privileges: string[];
  percentage?: number;
  className?: string;
}

export function SettingsPrivilegeList({
  title,
  privileges,
  percentage,
  className,
}: SettingsPrivilegeListProps) {
  const t = useAppTranslations();

  if (!privileges.length) return null;

  return (
    <div className={twMerge('flex flex-col gap-2', className)}>
      {title && <h3 className="text-gray-secondary text-sm font-bold uppercase">{title}</h3>}
      <ul className="bg-purple-gradient rounded-2xl divide-y divide-white/5 overflow-hidden">
        {privileges.map((privilege, index) => (
          <li
            key={index}
            className="flex items-start gap-3 px-4 py-3 animate-slide-in-bottom"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <span className="flex-center mt-0.5 h-6 w-6 shrink-0 rounded-full bg-emerald-500/15 text-emerald-400">
              <Check size={14} strokeWidth={3} />
            </span>
            <span className="text-sm text-white/85 leading-relaxed">
              {t(privilege as MessageIds, percentage !== undefined ? { percentage } : undefined)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
