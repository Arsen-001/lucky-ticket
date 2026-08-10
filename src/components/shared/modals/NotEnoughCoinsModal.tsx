'use client';

import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { RequirementModal } from '@/components/shared/modals/RequirementModal';
import { GlobalConstants } from '@/constants/global.constants';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useClaimableTasks } from '@/hooks/useClaimableTasks';

export interface NotEnoughCoinsModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * What the action costs, when the caller knows it. Omitted by screens that
   * only learn of the shortfall from the server's refusal, which names no
   * figure — better to say nothing than to invent one.
   */
  required?: number;
  current: number;
}

/**
 * "Not enough LC" used to be an OK button and nothing else — the balance is
 * named, but where LC comes from is not.
 *
 * The way out is a TOURNAMENT, not a top-up. LC is not sold: it is won, and the
 * button said "Top up LC" for a day, pointing at the LC wallet — a screen that
 * shows the balance and its history but has nothing to sell, so the one player
 * who followed it arrived exactly where they started. Tasks stays as the second
 * line, because unclaimed rewards are LC already earned — a shorter errand than
 * playing for it.
 */
export function NotEnoughCoinsModal({
  open,
  onClose,
  required,
  current,
}: NotEnoughCoinsModalProps) {
  const t = useAppTranslations();
  // The modal is about missing LC, and unclaimed tasks are LC already earned —
  // the dot says the shortfall may be covered by collecting, not by grinding.
  const { hasAny: hasClaimableTasks, route: claimRoute } = useClaimableTasks();

  const known = required != null && required > 0;
  /**
   * The balance on hand says the purchase was affordable — so this refusal came
   * from the server, and the number the client is holding is the stale one.
   *
   * Saying it out loud is worse than saying nothing: "your balance is 1,600,000,
   * but you need 1,200,000" under the heading "Not enough LC" reads as a broken
   * app, and the progress bar under it fills to 1.2M/1.2M, which argues the
   * opposite of the modal it sits in. (Seen 11.08.2026 the first time a market
   * purchase was refused by the backend rather than by the local check.)
   */
  const stale = known && current >= required;

  // Grouped, not raw: "10000" in a money modal reads as an unformatted debug
  // value next to every other price on the screen.
  const description = !known
    ? t('not enough coins short description')
    : stale
      ? t('balance changed description')
      : t('not enough coins description', {
          balance: current.toLocaleString(),
          required: required.toLocaleString(),
        });

  return (
    <RequirementModal
      open={open}
      onClose={onClose}
      icon={<CoinIcon size={34} />}
      title={t('not enough {coin}', { coin: GlobalConstants.coinName })}
      description={description}
      progress={known && !stale ? { label: t('balance'), current, required } : undefined}
      action={{
        label: t('win {coin}', { coin: GlobalConstants.coinName }),
        href: routes.tournaments.index,
      }}
      secondaryAction={{
        label: t('go to tasks'),
        href: claimRoute,
        claimable: hasClaimableTasks,
      }}
    />
  );
}
