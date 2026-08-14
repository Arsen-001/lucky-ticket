'use client';
import { useEffect, useState } from 'react';
import { Check, Copy, Send, Share2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useOverlayPresence } from '@/hooks/useOverlayPresence';
import { useOverlayFocusLock } from '@/hooks/useOverlayFocusLock';
import { useBackdropDismiss } from '@/hooks/useBackdropDismiss';
import { useBackDismiss } from '@/hooks/useBackDismiss';
import { GlobalConstants } from '@/constants/global.constants';
import { staggerMs } from '@/utils/global/animation.utils';
import { openExternalUrl } from '@/lib/telegram/telegram';

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

/** Matches the panel's `duration-300` slide. */
const ANIMATION_MS = 300;

export function ProfileShareSheet({ open, onClose, url, username }: ProfileShareSheetProps) {
  const t = useAppTranslations();
  const [copied, setCopied] = useState(false);
  // A sheet that only looked like a dialog: no role, no accessible name, and no
  // focus lock, so Tab walked straight into the profile behind it.
  // @see useOverlayFocusLock
  const panelRef = useOverlayFocusLock(open);
  const { mounted, visible } = useOverlayPresence(open, ANIMATION_MS);
  // The opening tap's own click lands on the backdrop. @see useBackdropDismiss
  const backdropProps = useBackdropDismiss(visible, ANIMATION_MS, onClose);
  // Back closes the sheet instead of leaving the profile. @see useBackDismiss
  useBackDismiss(open, onClose);

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
    openExternalUrl(link);
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

  // Closed → nothing in the DOM. This sheet stayed mounted whatever its state,
  // so a full-screen layer with `role="dialog"` sat over the profile at all
  // times — see useOverlayPresence, which every other overlay here already uses.
  if (!mounted) return null;

  return (
    <ClientPortal>
      <div
        aria-hidden={!open}
        inert={!open ? true : undefined}
        className={twMerge(
          'fixed inset-0 z-100 flex items-end justify-center transition-opacity duration-300',
          visible ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="bg-fade absolute inset-0 backdrop-blur-[1px]" {...backdropProps} />

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('share profile')}
          tabIndex={-1}
          className={twMerge(
            // Capped to the phone column like every other overlay. @see BottomSheet
            'bg-background relative flex w-full max-w-[var(--app-max-w)] flex-col rounded-t-2xl transition-transform duration-300 ease-in-out',
            visible ? 'translate-y-0' : 'translate-y-full'
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
                  className="animate-slide-in-bottom flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3 text-start transition-all active:scale-99 hover:bg-white/8"
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
