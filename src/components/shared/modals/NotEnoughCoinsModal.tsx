'use client';

import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { RequirementModal } from '@/components/shared/modals/RequirementModal';
import { GlobalConstants } from '@/constants/global.constants';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface NotEnoughCoinsModalProps {
  open: boolean;
  onClose: () => void;
  required: number;
  current: number;
}

/**
 * "Not enough LC" used to be an OK button and nothing else — the balance is
 * named, but where LC comes from is not. Tasks is the screen that answers that,
 * so the modal carries the player there.
 */
export function NotEnoughCoinsModal({
  open,
  onClose,
  required,
  current,
}: NotEnoughCoinsModalProps) {
  const t = useAppTranslations();

  // Grouped, not raw: "10000" in a money modal reads as an unformatted debug
  // value next to every other price on the screen.
  const description = t('not enough coins description', {
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
      progress={{ label: t('balance'), current, required }}
      action={{ label: t('go to tasks'), href: routes.tasks }}
    />
  );
}
