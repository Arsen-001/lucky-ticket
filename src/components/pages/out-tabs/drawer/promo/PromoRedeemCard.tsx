'use client';

import Image from 'next/image';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { CircleAlert, Gift, Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Input } from '@/components/shared/form-elements/inputs/Input';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { icons } from '@/constants/icons';
import { PromoSourceRow } from './PromoSourceRow';
import type { StaticImageData } from 'next/image';

export interface PromoRedeemCardProps {
  readonly code: string;
  readonly errorMessage: string | null;
  readonly loading: boolean;
  onCodeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  className?: string;
}

/** The three reward kinds a code can hold, as the card's own band. */
const BAND: { key: string; art: StaticImageData; width: string; label: string }[] = [
  { key: 'lc', art: icons.coin, width: 'w-8', label: GlobalConstants.coinName },
  { key: 'stars', art: icons.telegramStar, width: 'w-7', label: GlobalConstants.starName },
  { key: 'tickets', art: icons.goldenTicketOverlap, width: 'w-12', label: 'tickets' },
];

/**
 * The code field spoken in the language of `/lc` and `/jackpot`: one dark card
 * with a coloured hairline, the prize art as a watermark, the input where those
 * screens put their number, a band under it and an action footer.
 */
export function PromoRedeemCard({
  code,
  errorMessage,
  loading,
  onCodeChange,
  onSubmit,
  className,
}: PromoRedeemCardProps) {
  const t = useAppTranslations();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSubmit();
  };

  return (
    <div
      className={twMerge(
        'border-electric-pink/25 relative overflow-hidden rounded-3xl border bg-[#171430]',
        className
      )}
      style={{ boxShadow: '0 14px 34px rgba(0,0,0,0.45)' }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(219,52,158,0.22) 0%, rgba(140,60,220,0.14) 45%, transparent 72%)',
        }}
      />
      <Image
        src={icons.goldenTicketOverlap}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-6 h-auto w-44 rotate-[-14deg] opacity-[0.1]"
      />

      <div className="relative px-5 pb-4 pt-5">
        <div className="flex items-center gap-2">
          <Gift size={15} className="text-electric-pink" strokeWidth={2.4} />
          {/* Not `promo code` — the page header already says that, verbatim. */}
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">
            {t('enter promo code')}
          </span>
        </div>

        <p className="text-white-secondary/80 mt-2 max-w-[17rem] text-[12px] font-medium leading-snug">
          {t('promo intro')}
        </p>

        <Input
          value={code}
          onChange={onCodeChange}
          onKeyDown={handleKeyDown}
          placeholder={t('promo placeholder')}
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="mt-3.5 rounded-2xl border border-white/8 bg-black/35 py-4"
          classNames={{
            input:
              'text-center text-[19px] font-extrabold uppercase tracking-[0.3em] placeholder:text-[13px] placeholder:font-semibold placeholder:tracking-[0.14em] placeholder:text-white/25',
          }}
        />

        {errorMessage && (
          <div className="bg-error/15 animate-fade-in mt-2.5 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2">
            <CircleAlert size={13} className="text-error-text shrink-0" />
            <span className="text-[12px] font-semibold leading-snug text-white/90">
              {errorMessage}
            </span>
          </div>
        )}

        <Button
          onClick={onSubmit}
          loading={loading}
          disabled={!code.trim()}
          icon={<Sparkles />}
          iconSize={15}
          className="mt-2.5 w-full rounded-2xl"
        >
          {t('redeem')}
        </Button>
      </div>

      {/* Band: the prize art marching across the card, the way /lc puts its
          curve in a strip of its own rather than behind the text. */}
      <div className="relative border-t border-white/8 bg-black/20 px-4 pb-3.5 pt-2.5">
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
          {t('promo possible rewards')}
        </span>
        <div className="mt-2 flex items-end justify-around">
          {BAND.map(item => (
            <span key={item.key} className="flex flex-col items-center gap-1.5">
              <Image
                src={item.art}
                alt=""
                aria-hidden
                className={twMerge('h-auto drop-shadow-lg', item.width)}
              />
              <span className="text-[10px] font-bold uppercase tracking-wide text-white/75">
                {item.key === 'tickets' ? t('tickets') : item.label}
              </span>
            </span>
          ))}
        </div>
      </div>

      <PromoSourceRow />
    </div>
  );
}
