'use client';

import { BellOff } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useBotWriteAccess } from '@/hooks/useBotWriteAccess';

/**
 * The permission every toggle below depends on.
 *
 * A Telegram bot cannot open a conversation by itself, and a Mini App player
 * arrives by link or QR without ever meeting it — so until this is granted the
 * whole notification screen is a promise the game cannot keep. That was not
 * theoretical: production delivered ZERO of ~1000 engine-ready reminders on
 * 19.08.2026, every one refused with "chat not found".
 *
 * Renders only when there is something to ask for — granted, unsupported client
 * or plain browser all render nothing, so the screen stays quiet once the
 * problem is solved. @see useBotWriteAccess
 */
export function BotWriteAccessCard() {
  const t = useAppTranslations();
  const { canAsk, asking, ask } = useBotWriteAccess();

  if (!canAsk) return null;

  return (
    <div className="card-outlined flex flex-col gap-3 rounded-xl p-4">
      <div className="flex items-start gap-3.5">
        <div className="flex-center h-10 w-10 shrink-0 rounded-xl bg-white/[0.04] text-warning">
          <BellOff size={18} strokeWidth={2.4} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-white-secondary text-[15px] font-bold leading-tight">
            {t('bot cannot message you')}
          </span>
          <span className="text-gray-secondary text-[12px] font-semibold leading-relaxed">
            {t('bot cannot message you description')}
          </span>
        </div>
      </div>
      <Button loading={asking} onClick={() => void ask()}>
        {t('allow bot to message')}
      </Button>
    </div>
  );
}
