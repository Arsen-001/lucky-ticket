'use client';

import { useRouter } from 'next/navigation';
import { ArrowUp, Layers, Lock } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { Modal } from '@/components/shared/modals/Modal';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import { ChipInfoTypeRow } from './ChipInfoTypeRow';

export interface ChipInfoSheetProps {
  open: boolean;
  /** The type whose tile was tapped — that row opens lit. */
  focus?: InventoryChipType;
  onClose: () => void;
}

/**
 * What chips are, what each type does, and where shards come from.
 *
 * The screen was readable but unexplained: it showed a Time chip at +10% next
 * to a Capacity chip at +15% without ever saying that one shortens the cycle
 * and the other widens the batch — and a player with an empty shard row had no
 * way to learn that tournaments are what fill it. Both exits (tournaments,
 * market) are in the footer so the answer ends in an action.
 */
export function ChipInfoSheet({ open, focus, onClose }: ChipInfoSheetProps) {
  const t = useAppTranslations();
  const router = useRouter();

  const iconClass = 'mt-0.5 shrink-0 text-white/40';
  const rules = [
    { icon: <Lock size={13} strokeWidth={2.4} className={iconClass} />, text: t('chip tier rule') },
    {
      icon: <ArrowUp size={13} strokeWidth={2.4} className={iconClass} />,
      text: t('chip level explainer'),
    },
    {
      icon: <TelegramStarIcon size={13} className={iconClass} />,
      text: t('chip stars explainer'),
    },
  ];

  const go = (route: Parameters<typeof router.push>[0]) => {
    onClose();
    router.push(route);
  };

  return (
    <Modal open={open} onClose={onClose} label={t('what are chips')}>
      <div className="card-outlined bg-purple-gradient flex flex-col gap-4 rounded-2xl p-5">
        <header className="flex flex-col gap-1.5">
          <h2 className="text-base font-extrabold text-white">{t('what are chips')}</h2>
          <p className="text-[12px] leading-snug text-white/70">{t('chips explainer')}</p>
        </header>

        <section className="flex flex-col gap-2">
          <ChipInfoTypeRow type="speed" highlighted={focus === 'speed'} />
          <ChipInfoTypeRow type="capacity" highlighted={focus === 'capacity'} />
        </section>

        <section className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 p-3">
          <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-white/55">
            <Layers size={12} strokeWidth={2.6} />
            {t('where to get shards')}
          </span>
          <p className="text-[12px] leading-snug text-white/70">{t('shards source explainer')}</p>
          <p className="text-[12px] leading-snug text-white/70">{t('shards spend explainer')}</p>
        </section>

        <section className="flex flex-col gap-1.5">
          {rules.map(({ icon, text }) => (
            <span
              key={text}
              className="flex items-start gap-2 text-[11px] leading-snug text-white/55"
            >
              {icon}
              {text}
            </span>
          ))}
        </section>

        <footer className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => go(routes.tournaments.index)}
            className="flex-1 py-2.5 text-[12px]"
          >
            {t('tournaments')}
          </Button>
          <Button onClick={() => go(routes.market('shards'))} className="flex-1 py-2.5 text-[12px]">
            {t('buy shards')}
          </Button>
        </footer>
      </div>
    </Modal>
  );
}
