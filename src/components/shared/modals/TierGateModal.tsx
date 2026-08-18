'use client';

import { useGetMeQuery } from '@/api/me.api';
import { RequirementModal } from '@/components/shared/modals/RequirementModal';
import { GlobalConstants } from '@/constants/global.constants';
import { routes } from '@/constants/routes';
import { tierNameId } from '@/constants/tier-names';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';
import type { TicketType } from '@/types/types/ticket.types';

export interface TierGateModalProps {
  open: boolean;
  onClose: () => void;
  /** Tier of the thing that was tapped — the gate it sits behind. */
  tier: TicketType;
  /** Headline naming what is locked; receives the localized tier name as `{tier}`. */
  titleId: MessageIds;
}

/**
 * The AP tier gate (DOCS §5.2) stated as a way forward.
 *
 * Tier-locked cards and CTAs used to swallow the tap or sit disabled under a
 * one-word "Locked" — the requirement is real, but the screen that moves it is
 * never named. This shows both halves of the gate, which one is blocking, and
 * opens the page that closes it.
 */
export function TierGateModal({ open, onClose, tier, titleId }: TierGateModalProps) {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();

  const requiredAp = GlobalConstants.apTierThresholds[tier];
  const requiredReferrals = GlobalConstants.tierReferralRequirements[tier];
  const currentAp = me?.activityPoints ?? 0;
  const currentReferrals = me?.referralsCount ?? 0;
  const tierName = t(tierNameId[tier]);

  // The gate has two halves and each is closed on a different screen. Lead with
  // friends when they are the short one — AP keeps accruing on its own, invites
  // never do — and keep the AP page reachable underneath either way.
  const needsFriends = currentReferrals < requiredReferrals;
  const apAction = { label: t('how to earn ap'), href: routes.activity };

  return (
    <RequirementModal
      open={open}
      onClose={onClose}
      title={t(titleId, { tier: tierName })}
      description={
        <>
          {t('reach {tier} tier', { tier: tierName })}
          {/* Two requirements, two lines — inlined behind a separator they read
              as one sentence and the "…and" of the second key looks like a typo. */}
          {requiredReferrals > 0 && (
            <>
              <br />
              {t('and invite {n} friends', { n: requiredReferrals })}
            </>
          )}
        </>
      }
      progress={
        needsFriends
          ? { label: t('friends invited'), current: currentReferrals, required: requiredReferrals }
          : {
              label: t('activity points'),
              current: currentAp,
              required: requiredAp,
              // The bar fills against the threshold; the threshold itself is
              // not named (@see ActivityGateBand).
              hideRequired: true,
            }
      }
      action={needsFriends ? { label: t('invite friends'), href: routes.inviteFriends } : apAction}
      secondaryAction={needsFriends ? apAction : undefined}
    />
  );
}
