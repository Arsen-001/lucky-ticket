'use client';

import type { ChangeEvent, KeyboardEvent } from 'react';
import { CircleAlert, Gift, Sparkles } from 'lucide-react';
import { Input } from '@/components/shared/form-elements/inputs/Input';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface PromoCouponCardProps {
  readonly code: string;
  readonly errorMessage: string | null;
  readonly loading: boolean;
  onCodeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

/**
 * The redeem "coupon": hero header and code form joined by a perforated
 * tear-line, so the whole card reads as a lottery-ticket stub.
 */
export function PromoCouponCard({
  code,
  errorMessage,
  loading,
  onCodeChange,
  onSubmit,
}: PromoCouponCardProps) {
  const t = useAppTranslations();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSubmit();
  };

  return (
    <div
      className="shine-card relative overflow-hidden rounded-3xl p-5"
      style={{ ['--shine-card-accent' as string]: 'var(--color-electric-pink)' }}
    >
      <span
        aria-hidden
        className="bg-electric-pink/15 pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl"
      />
      <span
        aria-hidden
        className="bg-electric-purple/10 pointer-events-none absolute -right-10 top-16 h-28 w-28 rounded-full blur-3xl"
      />

      <div className="relative flex flex-col items-center gap-2.5 text-center">
        <span className="bg-electric-pink/15 ring-electric-pink/30 text-electric-pink flex-center h-14 w-14 rounded-2xl ring-1">
          <Gift size={26} strokeWidth={2.2} />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-extrabold leading-tight text-white">
            {t('enter promo code')}
          </h2>
          <p className="text-white-secondary/80 mx-auto max-w-[17rem] text-[12px] font-medium leading-snug">
            {t('promo intro')}
          </p>
        </div>
      </div>

      {/* Perforated tear-line: the side notches are page-background circles
          clipped in half by the card's overflow-hidden, faking punched holes. */}
      <div aria-hidden className="relative -mx-5 my-5">
        <span className="bg-background absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full ring-1 ring-white/10" />
        <span className="mx-5 block border-t-2 border-dashed border-white/10" />
        <span className="bg-background absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full ring-1 ring-white/10" />
      </div>

      <div className="relative flex flex-col gap-3">
        <Input
          value={code}
          onChange={onCodeChange}
          onKeyDown={handleKeyDown}
          placeholder={t('promo placeholder')}
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="rounded-xl border border-white/5 bg-black/25 py-3.5"
          classNames={{
            input:
              'text-center text-base font-extrabold uppercase tracking-[0.25em] placeholder:text-[13px] placeholder:font-semibold placeholder:tracking-[0.12em] placeholder:text-white/25',
          }}
        />
        {errorMessage && (
          <div className="bg-error/15 animate-fade-in flex items-center justify-center gap-1.5 rounded-lg px-3 py-2">
            <CircleAlert size={13} className="text-error shrink-0" />
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
          className="w-full rounded-xl"
        >
          {t('redeem')}
        </Button>
      </div>
    </div>
  );
}
