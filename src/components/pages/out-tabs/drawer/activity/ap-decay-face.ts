import { Flame, ShieldAlert, TrendingDown, type LucideIcon } from 'lucide-react';
import type { ApDecayInfo } from '@/utils/global/activity.utils';
import type { Dictionary } from '@/types/types/i18n.types';

export interface ApDecayFace {
  Icon: LucideIcon;
  /** CSS colour of the state — readable text tone, not the fill tone. */
  color: string;
  title: string;
  sub: string;
  /** Chip-length version of the title. */
  short: string;
}

/**
 * Colour, glyph and copy for one decay state, in one place — the chip, the band
 * and the row all read from here so the same state can never be amber in one
 * shape and red in the next.
 */
export const apDecayFace = (decay: ApDecayInfo, t: Dictionary): ApDecayFace =>
  ({
    active: {
      Icon: Flame,
      color: 'var(--color-success-text)',
      title: t('activity active'),
      sub: t('keep playing to hold your AP'),
      short: t('activity active'),
    },
    grace: {
      Icon: ShieldAlert,
      color: 'var(--color-warning)',
      title: t('decay in {n} days', { n: decay.daysUntilDecay }),
      sub: t('play any action to reset the timer'),
      short: t('decay in {n} days', { n: decay.daysUntilDecay }),
    },
    decaying: {
      Icon: TrendingDown,
      color: 'var(--color-error-text)',
      title: t('decay active'),
      sub: t('losing {n} AP per day until you return', { n: decay.decayPerDay }),
      short: `−${decay.decayPerDay}`,
    },
  })[decay.state];
