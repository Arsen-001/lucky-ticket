'use client';

import { useState } from 'react';
import { Check, Share } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { getTelegramWebApp } from '@/lib/telegram/telegram';
import { useToast } from '@/hooks/useToast';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { buildDeepLinkParam } from '@/utils/global/deep-link.utils';

interface FaqShareButtonProps {
  id: string;
  title?: string;
  loading?: boolean;
}

export function FaqShareButton({ id, title, loading }: FaqShareButtonProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  // Deep link that reopens the Mini App straight to this article — the
  // `faq-<id>` `start_param` is parsed on boot in TelegramProvider. A plain web
  // URL can't carry `start_param`, so this must go through the bot link.
  const link = `${GlobalConstants.telegramBotUrl}?startapp=${buildDeepLinkParam('faq', id)}`;

  const handleShare = async () => {
    const text = title ?? t('faq');
    const webApp = getTelegramWebApp();

    // Inside Telegram: native "share to a chat" picker (same flow as invites).
    if (webApp?.openTelegramLink) {
      webApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
      );
      return;
    }

    // Outside Telegram (web / dev): copy the link to the clipboard as a fallback.
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success(t('link copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('action failed'));
    }
  };

  return (
    <Button
      variant="secondary"
      loading={loading}
      className={copied ? 'bg-success p-2 text-sm' : 'p-2 text-sm'}
      onClick={handleShare}
      aria-label={t('share')}
    >
      {copied ? <Check size={18} /> : <Share size={18} />}
    </Button>
  );
}
