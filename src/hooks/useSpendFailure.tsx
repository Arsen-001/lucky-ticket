'use client';

import { useState, type ReactNode } from 'react';
import { Diamond, Ticket as TicketIcon, Wallet } from 'lucide-react';
import { useGetMeQuery } from '@/api/me.api';
import { NotEnoughCoinsModal } from '@/components/shared/modals/NotEnoughCoinsModal';
import { RequirementModal } from '@/components/shared/modals/RequirementModal';
import { SpendFailedModal } from '@/components/shared/modals/SpendFailedModal';
import { StarsTopUpFlow } from '@/components/pages/tabs/home/StarsTopUpFlow';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  spendFailure,
  type SpendFailure,
  type SpendShortfallKind,
} from '@/utils/global/spend-failure.utils';

export interface SpendFailureReport {
  /**
   * What the action was going to cost, when the screen knows it. Drives the
   * "you have X of Y" line and its progress bar; without it the modal states
   * the shortfall without pretending to a number it does not have.
   */
  required?: number;
}

export interface UseSpendFailure {
  /** Hand it the rejected mutation's error; it decides what the player sees. */
  report: (error: unknown, options?: SpendFailureReport) => Promise<void>;
  /**
   * The same modals without a request. For screens that can see the shortfall
   * before they ask — a price against a known balance — so a local check and a
   * server refusal never diverge into two different-looking answers.
   */
  show: (kind: SpendShortfallKind, options?: SpendFailureReport) => void;
  /** Render once, anywhere in the screen's tree. */
  modals: ReactNode;
}

/**
 * One answer to "you can't afford this", for every screen that spends.
 *
 * Every paid action used to end in `toast.error(t('action failed'))` — the same
 * three-second grey line whether the server refused for want of LC, of Stars,
 * of TON or of tickets. Reported 11.08.2026 from «Продлить Lucky Player»: the
 * balance was short, and all the app said was "couldn't do it, try again",
 * which reads as a broken button rather than as a price.
 *
 * So the refusal is classified once (@see spendFailure) and answered with the
 * screen that fixes it: LC → the tournaments (it is won, never sold), Stars →
 * the buy-Stars sheet in place, TON → the wallet, tickets and shards → their
 * market shelf. Reasons
 * with no way out still get a modal, never a toast — the point is that a
 * refusal is readable and has somewhere to go, not that it is loud.
 */
export function useSpendFailure(): UseSpendFailure {
  const t = useAppTranslations();
  const { data: me, refetch: refetchMe } = useGetMeQuery();
  const [failure, setFailure] = useState<SpendFailure | null>(null);
  const [required, setRequired] = useState<number | undefined>(undefined);

  const report = async (error: unknown, options?: SpendFailureReport) => {
    const resolved = spendFailure(error, t);
    setRequired(options?.required);
    if (resolved.kind !== 'message') {
      // The screen let the tap through, so it believed the balance covered
      // this — which makes the number it is holding the stale one. Awaited,
      // not fired off: opening first would state a balance that contradicts
      // the very refusal it is explaining.
      await refetchMe();
    }
    setFailure(resolved);
  };

  const show = (kind: SpendShortfallKind, options?: SpendFailureReport) => {
    setRequired(options?.required);
    setFailure({ kind });
  };

  const close = () => setFailure(null);
  const kind = failure?.kind;

  const modals = (
    <>
      <NotEnoughCoinsModal
        open={kind === 'coins'}
        onClose={close}
        required={required}
        current={me?.coins ?? 0}
      />

      <StarsTopUpFlow
        open={kind === 'stars'}
        onClose={close}
        requiredStars={required}
        currentStars={me?.telegramStars ?? 0}
      />

      <RequirementModal
        open={kind === 'ton'}
        onClose={close}
        icon={<Wallet size={26} className="text-pink-secondary" strokeWidth={2.2} />}
        title={t('not enough balance')}
        description={t('not enough ton description')}
        action={{ label: t('go to wallet'), href: routes.wallet }}
      />

      <RequirementModal
        open={kind === 'tickets'}
        onClose={close}
        icon={<TicketIcon size={26} className="text-pink-secondary" strokeWidth={2.2} />}
        title={t('not enough tickets')}
        description={t('not enough tickets description')}
        action={{ label: t('go to market'), href: routes.market('tickets') }}
      />

      <RequirementModal
        open={kind === 'shards'}
        onClose={close}
        icon={<Diamond size={26} className="text-pink-secondary" strokeWidth={2.2} />}
        title={t('not enough shards')}
        description={t('not enough shards description')}
        action={{ label: t('go to market'), href: routes.market('shards') }}
      />

      <SpendFailedModal
        open={kind === 'message'}
        onClose={close}
        reason={failure?.kind === 'message' ? failure.text : undefined}
      />
    </>
  );

  return { report, show, modals };
}
