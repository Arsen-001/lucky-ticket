import { routes, type Route } from '@/constants/routes';
import type { MessageIds } from '@/types/types/i18n.types';

/**
 * Onboarding tour — single source of truth for the guided first-run walkthrough.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * HOW TO ADD / REORDER / REMOVE A STEP (no engine changes required):
 *   1. Add (or move / delete) a `TourStep` object in `TOUR_STEPS` below.
 *   2. Put `data-tour="<anchor>"` on the real element you want highlighted.
 *   3. Add the two i18n keys (`titleKey`, `bodyKey`) to messages/en|ru|hy.json.
 *
 * The engine walks `TOUR_STEPS` in array order and renders every step
 * generically — there is no per-step branching anywhere else. `realAction:
 * true` makes the user's tap fire the target's real `onClick` (used only for
 * the final "claim your first ticket" step); every other step just advances.
 * ──────────────────────────────────────────────────────────────────────────
 */

export type TourPlacement = 'top' | 'bottom' | 'auto';

export interface TourStep {
  /** Stable id — also useful for analytics / debugging. */
  readonly id: string;
  /** Screen the tour navigates to before showing this step. */
  readonly route: Route;
  /** `data-tour` value of the element to spotlight on that screen. */
  readonly anchor: string;
  /**
   * Optional second `data-tour` anchor. When set, the spotlight covers the
   * union of both boxes — e.g. two adjacent tab rows highlighted together.
   */
  readonly secondaryAnchor?: string;
  /** i18n key for the bubble heading. */
  readonly titleKey: MessageIds;
  /** i18n key for the bubble body text. */
  readonly bodyKey: MessageIds;
  /** Preferred bubble side relative to the target (auto-flips on overflow). */
  readonly placement?: TourPlacement;
  /** When true the tap triggers the target's real click (e.g. claim) before finishing. */
  readonly realAction?: boolean;
  /** i18n hint under the bubble on a `realAction` step (defaults to a generic "tap the highlighted area"). */
  readonly actionHintKey?: MessageIds;
  /** Delay (ms) before auto-advancing — lets a `realAction` settle (e.g. the claim flight animation finishing and the ticket minting) before the next step navigates away. */
  readonly advanceAfterMs?: number;
}

export const TOUR_STEPS: readonly TourStep[] = [
  {
    id: 'engine',
    route: routes.home,
    anchor: 'engine',
    titleKey: 'tour engine title',
    bodyKey: 'tour engine body',
    placement: 'bottom',
  },
  {
    id: 'tickets',
    route: routes.tickets.index,
    anchor: 'tickets',
    titleKey: 'tour tickets title',
    bodyKey: 'tour tickets body',
    placement: 'bottom',
  },
  {
    id: 'tournaments',
    route: routes.tournaments.index,
    anchor: 'tournaments',
    titleKey: 'tour tournaments title',
    bodyKey: 'tour tournaments body',
    placement: 'bottom',
  },
  {
    id: 'tasks',
    route: routes.tasks,
    anchor: 'tasks',
    secondaryAnchor: 'tasks-nav',
    titleKey: 'tour tasks title',
    bodyKey: 'tour tasks body',
    placement: 'bottom',
  },
  {
    id: 'ap',
    route: routes.tasks,
    anchor: 'ap',
    titleKey: 'tour ap title',
    bodyKey: 'tour ap body',
    placement: 'bottom',
  },
  {
    id: 'stakes',
    route: routes.stakes.index,
    anchor: 'stakes',
    titleKey: 'tour stakes title',
    bodyKey: 'tour stakes body',
    placement: 'bottom',
  },
  {
    id: 'referrals',
    route: routes.inviteFriends,
    anchor: 'referrals',
    titleKey: 'tour referrals title',
    bodyKey: 'tour referrals body',
    placement: 'bottom',
  },
  {
    id: 'claim',
    route: routes.home,
    anchor: 'claim-cta',
    titleKey: 'tour claim title',
    bodyKey: 'tour claim body',
    placement: 'top',
    realAction: true,
    actionHintKey: 'tap to claim your ticket',
    // Hold on the claim step long enough for the flight animation to finish and
    // the ticket to actually mint before the next step navigates to Tournaments
    // (which unmounts the engine and would otherwise cancel the pending claim).
    advanceAfterMs: 1500,
  },
  {
    id: 'join-tournament',
    route: routes.tournaments.index,
    anchor: 'tournament-join',
    titleKey: 'tour join title',
    bodyKey: 'tour join body',
    placement: 'top',
    realAction: true,
    actionHintKey: 'tap to join tournament',
  },
];
