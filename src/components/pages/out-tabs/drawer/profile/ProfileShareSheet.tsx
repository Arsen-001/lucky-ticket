'use client';
import { useEffect, useState } from 'react';
import { Check, Copy, Send, Share2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { staggerMs } from '@/utils/global/animation.utils';

interface ShareOption {
  key: string;
  label: string;
  icon: LucideIcon;
  iconClass: string;
  onClick: () => void;
}

export interface ProfileShareSheetProps {
  open: boolean;
  onClose: () => void;
  /** Path or absolute URL to share. Without it the current location is shared —
   * wrong for the own-profile route (`/profile`), which for any recipient is
   * THEIR profile; callers should pass the canonical `/profile/<id>` path. */
  url?: string;
  username?: string;
}

export function ProfileShareSheet({ open, onClose, url, username }: ProfileShareSheetProps) {
  const t = useAppTranslations();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

  const shareUrl =
    typeof window === 'undefined'
      ? ''
      : new URL(url ?? window.location.href, window.location.origin).toString();
  const shareText = username
    ? `${username} — ${GlobalConstants.projectName}`
    : GlobalConstants.projectName;

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(shareUrl);
      setCopied(true);
    } catch {
      /* noop */
    }
  };

  const openInNewTab = (link: string) => {
    if (typeof window !== 'undefined') window.open(link, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ url: shareUrl, title: shareText });
      } catch {
        /* user cancelled */
      }
    }
    onClose();
  };

  const options: ShareOption[] = [
    {
      key: 'copy',
      label: copied ? t('link copied') : t('copy link'),
      icon: copied ? Check : Copy,
      iconClass: copied ? 'text-success' : 'text-white',
      onClick: handleCopy,
    },
    {
      key: 'telegram',
      label: t('share on {place}', { place: 'Telegram' }),
      icon: Send,
      iconClass: 'text-telegram',
      onClick: () =>
        openInNewTab(
          `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
        ),
    },
    {
      key: 'twitter',
      label: t('share on {place}', { place: 'X' }),
      icon: Share2,
      iconClass: 'text-white',
      onClick: () =>
        openInNewTab(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
        ),
    },
    {
      key: 'native',
      label: t('share via system'),
      icon: Share2,
      iconClass: 'text-electric-pink',
      onClick: handleNativeShare,
    },
  ];

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <ClientPortal>
      <div
        aria-hidden={!open}
        inert={!open ? true : undefined}
        className={twMerge(
          'fixed inset-0 z-100 flex items-end transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="bg-fade absolute inset-0 backdrop-blur-[1px]" onClick={onClose} />

        <div
          className={twMerge(
            'bg-background relative flex w-full flex-col rounded-t-2xl transition-transform duration-300 ease-in-out',
            open ? 'translate-y-0' : 'translate-y-full'
          )}
        >
          <div className="flex justify-center pb-1 pt-3">
            <div className="h-1 w-10 rounded-full bg-white/20" />
          </div>

          <div className="flex flex-col gap-1 px-5 pb-2 pt-3">
            <h3 className="text-base font-bold text-white">{t('share profile')}</h3>
            <p className="text-xs text-white/55">{t('share profile description')}</p>
          </div>

          <div className="h-px bg-white/8" />

          <div className="flex flex-col gap-1.5 p-4 pb-7">
            {options.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={option.onClick}
                  className="animate-slide-in-bottom flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3 text-left transition-all active:scale-99 hover:bg-white/8"
                  style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
                >
                  <span
                    className={twMerge(
                      'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/8',
                      option.iconClass
                    )}
                  >
                    <Icon size={18} strokeWidth={2.4} />
                  </span>
                  <span className="text-sm font-bold text-white">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </ClientPortal>
  );
}
