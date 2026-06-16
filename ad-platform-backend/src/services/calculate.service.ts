import { PRICING } from '../config/pricing';
import { ValidationError } from '../errors';
import type { CostBreakdown, LinkType } from '../types';
import { cpcForLinkType, detectLinkType } from '../utils/linkType';

export interface CalculateInput {
  url: string;
  clicksRequested: number;
  /** Optional custom banner (+$50 fixed). */
  withBanner?: boolean;
  /** Optional long ad text up to 500 chars (+$20 fixed). */
  withLongText?: boolean;
  /** The long text itself, when provided — length-validated against the limit. */
  longText?: string | null;
}

/**
 * The single source of truth for campaign pricing. Used by both the
 * `/calculate` preview endpoint AND `/create` (which never trusts a
 * client-supplied total — it recomputes here).
 *
 * Returns every figure in integer cents.
 */
export function calculateCost(input: CalculateInput): CostBreakdown {
  const { url, clicksRequested, withBanner = false, withLongText = false, longText } = input;

  if (!Number.isInteger(clicksRequested) || clicksRequested <= 0) {
    throw new ValidationError('clicks_requested must be a positive integer');
  }
  if (withLongText && longText && longText.length > PRICING.LONG_TEXT_MAX_LENGTH) {
    throw new ValidationError(
      `long_text must be at most ${PRICING.LONG_TEXT_MAX_LENGTH} characters`
    );
  }

  // Auto-detect the link tier from the destination host → fixes the CPC rate.
  const linkType: LinkType = detectLinkType(url);
  const cpcRate = cpcForLinkType(linkType);

  // Fixed (one-off) fees.
  const base = PRICING.CREATE_TOURNAMENT_FIXED_CENTS;
  const banner = withBanner ? PRICING.BANNER_OPTION_CENTS : 0;
  const longTextFee = withLongText ? PRICING.LONG_TEXT_OPTION_CENTS : 0;
  const fixedTotal = base + banner + longTextFee;

  // Variable (CPC) budget — fully frozen on creation.
  const clickBudget = cpcRate * clicksRequested;

  return {
    linkType,
    cpcRate,
    clicksRequested,
    fixed: { base, banner, longText: longTextFee, total: fixedTotal },
    clickBudget,
    total: fixedTotal + clickBudget,
  };
}
