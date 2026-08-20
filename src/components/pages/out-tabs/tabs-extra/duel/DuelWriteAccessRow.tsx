'use client';

import { BellRing } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useBotWriteAccess } from '@/hooks/useBotWriteAccess';

/**
 * Просьба разрешить боту писать — на том экране, где от неё есть польза.
 *
 * Пока разрешения нет, игрок для друзей недостижим: их приглашения ему просто
 * не дойдут, и в чужом списке «кого позвать» он серая строка. Настройки об
 * этом тоже говорят, но туда заходят единицы — а сюда приходят играть.
 *
 * Ничего не рисует, когда просить нечего: разрешение уже дано, клиент старше
 * 6.9 не умеет, или это вообще браузер. @see useBotWriteAccess
 */
export function DuelWriteAccessRow() {
  const t = useAppTranslations();
  const { canAsk, asking, ask } = useBotWriteAccess();

  if (!canAsk) return null;

  return (
    <div className="border-gold/35 bg-gold/8 flex items-center gap-3 rounded-2xl border p-3">
      <span className="flex-center bg-gold/15 text-gold h-9 w-9 shrink-0 rounded-xl">
        <BellRing size={17} />
      </span>
      <span className="min-w-0 flex-1 text-[11.5px] leading-snug">
        {t('duel write access note')}
      </span>
      <Button className="h-9 shrink-0 px-3 text-[12px]" loading={asking} onClick={() => void ask()}>
        {t('duel write access allow')}
      </Button>
    </div>
  );
}
