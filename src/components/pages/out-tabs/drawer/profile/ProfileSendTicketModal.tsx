'use client';
import { useEffect, useState } from 'react';
import { Lock, Minus, Plus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { useGetProfileQuery, useSendTicketMutation } from '@/api/profile.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import type { TicketType } from '@/types/types/ticket.types';
import type { MessageIds } from '@/types/types/i18n.types';

const TIER_ORDER: TicketType[] = [
  TicketsEnum.BRONZE,
  TicketsEnum.SILVER,
  TicketsEnum.GOLD,
  TicketsEnum.PLATINUM,
  TicketsEnum.DIAMOND,
];

const TIER_LABEL_KEY: Record<TicketType, MessageIds> = {
  bronze: 'bronze',
  silver: 'silver',
  gold: 'golden',
  platinum: 'platinum',
  diamond: 'diamond',
};

export interface ProfileSendTicketModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  username?: string;
}

export function ProfileSendTicketModal({
  open,
  onClose,
  userId,
  username,
}: ProfileSendTicketModalProps) {
  const t = useAppTranslations();
  const { data: me } = useGetProfileQuery(undefined);
  const [sendTicket, { isLoading }] = useSendTicketMutation();

  const byTier = me?.privateStats?.ticketsByTier ?? {};
  const ownedTiers = TIER_ORDER.filter(tt => (byTier[tt] ?? 0) > 0);
  const sendLimits =
    GlobalConstants.ticketSendDailyLimits[me?.isLuckyPlayer ? 'luckyPlayer' : 'default'];

  const [tier, setTier] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!open) {
      setTier(null);
      setQuantity(1);
    }
  }, [open]);

  const maxQty = tier ? Math.min(byTier[tier] ?? 0, sendLimits[tier]) : 0;
  const canSend = !!tier && quantity > 0 && quantity <= maxQty && !isLoading;

  const selectTier = (next: TicketType) => {
    if (sendLimits[next] <= 0) return;
    setTier(next);
    setQuantity(1);
  };

  const handleSend = async () => {
    if (!tier || !canSend) return;
    await sendTicket({ userId, tier, quantity });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} hideCloseButton>
      <div className="bg-purple-gradient mx-auto flex w-full max-w-[360px] flex-col gap-4 rounded-3xl p-5">
        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-base font-extrabold text-white">{t('send a ticket')}</h2>
          {username && (
            <p className="text-[12px] text-white/55">
              {t('send ticket to {name}', { name: username })}
            </p>
          )}
        </div>

        {ownedTiers.length === 0 ? (
          <p className="rounded-xl bg-white/5 px-4 py-6 text-center text-[12px] text-white/55">
            {t('no tickets to send')}
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <span className="px-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                {t('select tier')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ownedTiers.map(tt => {
                  const locked = sendLimits[tt] <= 0;
                  return (
                    <button
                      key={tt}
                      type="button"
                      onClick={() => selectTier(tt)}
                      disabled={locked}
                      className={twMerge(
                        'flex min-w-[88px] flex-1 items-center gap-2 rounded-xl border px-2.5 py-2 transition-all',
                        locked
                          ? 'border-white/8 bg-white/3 opacity-60'
                          : tier === tt
                            ? 'border-electric-pink/50 bg-electric-pink/12'
                            : 'border-white/10 bg-white/5 hover:bg-white/8'
                      )}
                    >
                      <TicketOverlap type={tt} width={28} height={20} />
                      <span className="flex min-w-0 flex-col text-left leading-tight">
                        <span className="text-[12px] font-bold text-white">
                          {t(TIER_LABEL_KEY[tt])}
                        </span>
                        {locked ? (
                          <span className="text-warning flex items-center gap-0.5 text-[10px]">
                            <Lock size={9} strokeWidth={2.6} />
                            {t('lucky player required')}
                          </span>
                        ) : (
                          <span className="text-[10px] text-white/50">
                            {t('you own {n}', { n: byTier[tt] ?? 0 })}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-white/55">{t('quantity')}</span>
                {tier && (
                  <span className="text-[10px] text-white/40">
                    {t('up to {n} per day', { n: sendLimits[tier] })}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <StepperButton
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={!tier || quantity <= 1}
                >
                  <Minus size={16} />
                </StepperButton>
                <span className="min-w-8 text-center text-lg font-extrabold tabular-nums text-white">
                  {tier ? quantity : '—'}
                </span>
                <StepperButton
                  onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                  disabled={!tier || quantity >= maxQty}
                >
                  <Plus size={16} />
                </StepperButton>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <BoltIcon size={13} />
              <span className="text-teal text-[12px] font-bold">
                {t('plus {n} ap', { n: GlobalConstants.apRewards.sendTicket })}
              </span>
              <span className="text-[12px] text-white/50">{t('for sending')}</span>
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button className="flex-1" onClick={handleSend} loading={isLoading} disabled={!canSend}>
            {t('send')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

type StepperButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

function StepperButton({ className, children, ...rest }: StepperButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={twMerge(
        'flex-center h-8 w-8 rounded-lg bg-white/8 text-white transition-all hover:bg-white/15 active:scale-95 disabled:opacity-30',
        className
      )}
    >
      {children}
    </button>
  );
}
