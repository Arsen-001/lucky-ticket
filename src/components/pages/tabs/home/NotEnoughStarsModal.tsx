'use client';

import { Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { ModalCloseButton } from '@/components/shared/modals/ModalCloseButton';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';

const STAR_PRESETS = [100, 250, 500, 1000, 2500] as const;

export interface NotEnoughStarsModalProps {
  open: boolean;
  onClose: () => void;
  requiredStars?: number;
  currentStars: number;
  onTopUp?: (amount: number) => void;
}

export function NotEnoughStarsModal({
  open,
  onClose,
  requiredStars,
  currentStars,
  onTopUp,
}: NotEnoughStarsModalProps) {
  const t = useAppTranslations();

  const hasRequirement = typeof requiredStars === 'number';
  const deficit = hasRequirement ? Math.max(1, requiredStars - currentStars) : null;
  // De-duplicate so the exact-deficit chip never collides with a matching preset
  // (which would render two identical buttons and clash on the `amount` key).
  const presets = Array.from(new Set(deficit ? [deficit, ...STAR_PRESETS] : STAR_PRESETS)).sort(
    (a, b) => a - b
  );

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
        <div className="bg-fade absolute inset-0 backdrop-blur-[2px]" onClick={onClose} />

        <div
          className={twMerge(
            'bg-background relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl transition-transform duration-300 ease-in-out',
            open ? 'translate-y-0' : 'translate-y-full'
          )}
          style={{
            boxShadow: '0 -10px 40px rgba(248,189,62,0.12)',
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(248,189,62,0.32) 0%, rgba(248,189,62,0.08) 40%, transparent 70%)',
            }}
          />

          <div className="relative flex-shrink-0">
            <div className="flex justify-center pt-3 pb-1">
              <div className="bg-gold/30 h-1 w-10 rounded-full" />
            </div>
            <ModalCloseButton onClick={onClose} className="z-10" />
          </div>

          <div className="relative flex flex-col gap-5 px-5 pb-7 pt-3">
            <div className="flex flex-col items-center gap-2.5 text-center">
              <div className="relative">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(248,189,62,0.65) 0%, transparent 65%)',
                    filter: 'blur(10px)',
                  }}
                />
                <div
                  className="border-gold/55 bg-gold/15 flex-center relative h-20 w-20 rounded-full border-2"
                  style={{
                    boxShadow: '0 0 36px rgba(248,189,62,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
                  }}
                >
                  <TelegramStarIcon size={44} />
                  <Sparkles
                    aria-hidden
                    size={14}
                    className="text-gold absolute -right-1 -top-1 drop-shadow-[0_0_6px_rgba(248,189,62,0.9)]"
                    style={{ fill: 'rgba(248,189,62,0.65)' }}
                  />
                  <Sparkles
                    aria-hidden
                    size={10}
                    className="text-electric-pink absolute -bottom-0.5 -left-1 drop-shadow-[0_0_6px_rgba(222,0,155,0.8)]"
                    style={{ fill: 'rgba(222,0,155,0.65)' }}
                  />
                </div>
              </div>
              <h3 className="text-lg font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                {hasRequirement ? t('not enough stars') : t('add stars')}
              </h3>
              <p className="text-pink-secondary text-sm">
                {hasRequirement
                  ? t('not enough stars description', {
                      balance: currentStars,
                      required: requiredStars,
                    })
                  : t('top up stars description')}
              </p>
            </div>

            <div
              className="border-gold/25 from-gold/12 to-gold/4 relative flex items-center justify-between overflow-hidden rounded-xl border bg-gradient-to-r px-4 py-3"
              style={{
                boxShadow: '0 0 20px rgba(248,189,62,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="bg-gold/20 border-gold/35 flex-center h-7 w-7 rounded-full border">
                  <TelegramStarIcon size={14} />
                </div>
                <span className="text-gold/85 text-xs font-extrabold uppercase tracking-wider">
                  {t('balance')}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-extrabold tabular-nums text-white">
                  {formatNumber(currentStars)}
                </span>
                {hasRequirement && (
                  <span className="text-pink-secondary text-[11px] font-semibold tabular-nums">
                    / {formatNumber(requiredStars)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-pink-secondary text-xs font-bold uppercase tracking-wider">
                  {t('add stars')}
                </span>
                {deficit && (
                  <span className="border-success/30 bg-success/12 text-success inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                    <Sparkles size={9} strokeWidth={2.6} />
                    {t('missing {n}', { n: formatNumber(deficit) })}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {presets.map((amount, index) => {
                  const isDeficit = deficit !== null && amount === deficit;
                  return (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => onTopUp?.(amount)}
                      className={twMerge(
                        'group animate-slide-in-bottom relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border px-4 py-3 transition-all active:scale-99 cursor-pointer',
                        isDeficit
                          ? 'bg-pink-gradient border-electric-pink/60 text-white'
                          : 'border-electric-pink/30 bg-electric-pink/10 hover:border-electric-pink/55 hover:bg-electric-pink/18 text-white'
                      )}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        ...(isDeficit
                          ? {
                              boxShadow:
                                '0 6px 22px rgba(222,0,155,0.45), inset 0 1px 0 rgba(255,255,255,0.35)',
                            }
                          : {
                              boxShadow:
                                '0 0 14px rgba(222,0,155,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
                            }),
                      }}
                    >
                      {isDeficit && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
                        >
                          <span className="animate-task-shine absolute -left-1/2 -top-1/2 h-[200%] w-[55%] bg-gradient-to-r from-transparent via-white/55 to-transparent" />
                        </span>
                      )}
                      <TelegramStarIcon size={20} className="relative" />
                      <span className="relative text-base font-extrabold tabular-nums text-white">
                        +{formatNumber(amount)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
}
