'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Flag, History, LifeBuoy, LogOut, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { twMerge } from 'tailwind-merge';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes, type Route } from '@/constants/routes';
import '@/styles/components/profile.css';

export interface ProfileFooterProps {
  isOwn: boolean;
  memberSince: string;
  onSignOut?: () => void;
  onReport?: () => void;
}

interface FooterAction {
  key: string;
  icon: LucideIcon;
  label: string;
  iconBg: string;
  iconColor: string;
  href?: Route;
  onClick?: () => void;
}

export function ProfileFooter({ isOwn, memberSince, onSignOut, onReport }: ProfileFooterProps) {
  const t = useAppTranslations();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const formattedDate = dayjs(memberSince).format('MMM D, YYYY');

  const handleSignOutConfirm = () => {
    setSignOutOpen(false);
    onSignOut?.();
  };

  const ownActions: FooterAction[] = [
    {
      key: 'settings',
      icon: Settings,
      label: t('settings'),
      iconBg: 'bg-electric-purple/15',
      iconColor: 'text-electric-purple',
      href: routes.settings.index,
    },
    {
      key: 'history',
      icon: History,
      label: t('transaction history'),
      iconBg: 'bg-gold/15',
      iconColor: 'text-gold',
      href: routes.wallet,
    },
    {
      key: 'support',
      icon: LifeBuoy,
      label: t('support'),
      iconBg: 'bg-teal/20',
      iconColor: 'text-teal',
      href: routes.support.index,
    },
    {
      key: 'signout',
      icon: LogOut,
      label: t('sign out'),
      iconBg: 'bg-error/20',
      iconColor: 'text-error',
      onClick: () => setSignOutOpen(true),
    },
  ];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <span className="text-[11px] uppercase tracking-wider text-white/40">
          {t('member since', { date: formattedDate })}
        </span>
      </div>

      {isOwn ? (
        <div className="glass-card flex flex-col divide-y divide-white/5">
          {ownActions.map(action => (
            <FooterRow key={action.key} action={action} />
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={onReport}
          className="text-error/65 hover:text-error inline-flex items-center justify-center gap-1.5 self-center rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors"
        >
          <Flag size={11} strokeWidth={2.6} />
          {t('report user')}
        </button>
      )}

      <ConfirmModal
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        onConfirm={handleSignOutConfirm}
        title={t('sign out confirm title')}
        content={<p className="text-sm text-white/80">{t('sign out confirm description')}</p>}
        confirmText={t('sign out')}
      />
    </section>
  );
}

interface FooterRowProps {
  action: FooterAction;
}

function FooterRow({ action }: FooterRowProps) {
  const { icon: Icon, label, iconBg, iconColor, href, onClick } = action;

  const content = (
    <>
      <div className="flex items-center gap-3">
        <div
          className={twMerge(
            'flex h-9 w-9 items-center justify-center rounded-xl',
            iconBg,
            iconColor
          )}
        >
          <Icon size={16} strokeWidth={2.4} />
        </div>
        <span className="text-sm font-bold text-white">{label}</span>
      </div>
      <ChevronRight size={16} className="text-white/40" />
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center justify-between gap-3 p-3.5 transition-all active:scale-99 hover:bg-white/[0.03]"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 p-3.5 text-left transition-all active:scale-99 hover:bg-white/[0.03]"
    >
      {content}
    </button>
  );
}
