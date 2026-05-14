'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Flag, History, LifeBuoy, LogOut, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes, type Route } from '@/constants/routes';

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
  accent: string;
  href?: Route;
  onClick?: () => void;
  destructive?: boolean;
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
      accent: 'var(--color-electric-purple)',
      href: routes.settings.index,
    },
    {
      key: 'history',
      icon: History,
      label: t('transaction history'),
      accent: 'var(--color-gold)',
      href: routes.wallet,
    },
    {
      key: 'support',
      icon: LifeBuoy,
      label: t('support'),
      accent: 'var(--color-teal)',
      href: routes.support.index,
    },
    {
      key: 'signout',
      icon: LogOut,
      label: t('sign out'),
      accent: 'var(--color-error)',
      onClick: () => setSignOutOpen(true),
      destructive: true,
    },
  ];

  return (
    <section className="flex flex-col gap-2.5">
      {isOwn && <h3 className="px-1 text-base font-extrabold text-white">{t('account')}</h3>}

      {isOwn ? (
        <div className="bg-background-overlay flex flex-col rounded-2xl p-1.5">
          {ownActions.map((action, idx) => (
            <FooterRow key={action.key} action={action} delay={idx * 50} />
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={onReport}
          className="text-error/70 hover:text-error inline-flex items-center justify-center gap-1.5 self-center rounded-full border border-error/30 bg-error/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors"
        >
          <Flag size={11} strokeWidth={2.6} />
          {t('report user')}
        </button>
      )}

      <span className="text-center text-[10px] uppercase tracking-wider text-white/30">
        {t('member since', { date: formattedDate })}
      </span>

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
  delay: number;
}

function FooterRow({ action, delay }: FooterRowProps) {
  const { icon: Icon, label, accent, href, onClick, destructive } = action;

  const inner = (
    <>
      <span
        className="flex-center h-10 w-10 shrink-0 rounded-xl border"
        style={{
          backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`,
          borderColor: `color-mix(in srgb, ${accent} 40%, transparent)`,
          color: accent,
        }}
      >
        <Icon size={17} strokeWidth={2.4} />
      </span>
      <span
        className="flex-1 text-sm font-extrabold"
        style={{ color: destructive ? accent : 'white' }}
      >
        {label}
      </span>
      <ChevronRight size={16} className="text-white/35" />
    </>
  );

  const className =
    'animate-slide-in-bottom flex items-center gap-3 rounded-xl px-3 py-3 transition-all active:scale-99 hover:bg-white/4';

  if (href) {
    return (
      <Link href={href} className={className} style={{ animationDelay: `${delay}ms` }}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${className} text-left`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {inner}
    </button>
  );
}
