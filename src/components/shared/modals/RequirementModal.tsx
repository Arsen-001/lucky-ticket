'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { Progress } from '@/components/shared/Progress';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';
import type { Route } from '@/constants/routes';

// The counter shares one line with its label at 390 px. Friend counts read
// better in full ("2/5"); an LC balance in the millions has to compact or it
// pushes the label off the row.
const formatCount = (value: number) =>
  value >= 10_000 ? formatCompact(value) : value.toLocaleString();

export interface RequirementAction {
  label: string;
  href: Route;
}

export interface RequirementProgress {
  /** What is being counted ("friends invited", "activity points"). */
  label: string;
  current: number;
  required: number;
}

export interface RequirementModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  /** How close the player already is — omitted when the gate has no progress. */
  progress?: RequirementProgress;
  /** Defaults to a lock; pass a coin/star icon when the requirement is a balance. */
  icon?: ReactNode;
  /** The way out of the dead end: closes the modal, then navigates. */
  action: RequirementAction;
  /** A second route worth offering (e.g. "how AP works" next to "invite friends"). */
  secondaryAction?: RequirementAction;
}

/**
 * The one modal for "you can't do this yet".
 *
 * A gate stated in a toast is a dead end: it names a requirement and leaves the
 * player on the screen that just refused them, with no idea where the thing it
 * asks for is earned. This says what is missing, how far along they are, and
 * carries them to the screen that fixes it.
 */
export function RequirementModal({
  open,
  onClose,
  title,
  description,
  progress,
  icon,
  action,
  secondaryAction,
}: RequirementModalProps) {
  const t = useAppTranslations();
  const router = useRouter();

  // Closing first keeps the modal from animating out over the next screen.
  const handleNavigate = (href: Route) => {
    onClose();
    router.push(href);
  };

  const current = progress ? Math.min(progress.current, progress.required) : 0;
  // `required` is 0 only if the gate was lifted between the read and this
  // render — treat that as complete rather than dividing by zero.
  const percentage = progress && progress.required > 0 ? (current / progress.required) * 100 : 100;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl p-6 text-center">
        <span
          aria-hidden
          className="bg-electric-purple/12 pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-2xl"
        />

        <div className="flex-center ring-electric-purple/20 relative h-14 w-14 rounded-2xl bg-white/5 ring-1">
          {icon ?? <Lock size={26} className="text-pink-secondary" strokeWidth={2.2} />}
        </div>

        <h2 className="relative text-lg font-extrabold leading-tight text-white">{title}</h2>
        {description && (
          <p className="text-pink-secondary relative max-w-[280px] text-[12px] leading-snug">
            {description}
          </p>
        )}

        {progress && (
          <div className="relative mt-1 flex w-full flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
              <span className="text-pink-secondary">{progress.label}</span>
              <span className="tabular-nums text-white">
                {formatCount(current)}/{formatCount(progress.required)}
              </span>
            </div>
            {/* Lighter track than the default: at 0/3 the bar itself is
                invisible, so the empty track carries the progress alone. */}
            <Progress percentage={percentage} className="h-2 bg-white/10" />
          </div>
        )}

        <div className="relative mt-1 flex w-full flex-col gap-2">
          <Button
            variant="primary"
            onClick={() => handleNavigate(action.href)}
            icon={<ArrowRight />}
            iconPosition="right"
            iconSize={16}
            className="w-full rounded-xl py-3 text-sm font-bold"
          >
            {action.label}
          </Button>
          {secondaryAction && (
            <Button
              variant="transparent"
              onClick={() => handleNavigate(secondaryAction.href)}
              className="text-pink-secondary w-full rounded-xl py-2 text-[12px] font-bold"
            >
              {secondaryAction.label}
            </Button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-pink-secondary text-[11px] font-bold uppercase tracking-wider"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
