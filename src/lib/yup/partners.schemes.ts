import type { Dictionary } from '@/types/types/i18n.types';
import * as yup from 'yup';
import { appConfig } from '@/config/app.config';
import type { TournamentType } from '@/types/types/tournaments.types';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';

const { form } = appConfig.partners;

const TIER_VALUES: TournamentType[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
const SHARD_VALUES: InventoryChipType[] = ['speed', 'capacity'];

/** http(s)-only URL check for the optional branding links (logo/banner/sponsor). */
const isHttpUrl = (value?: string): boolean => {
  if (!value) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/** Validation for the "create sponsored tournament" builder (DOCS §11.8). */
export const getCreateSponsoredTournamentSchema = (t: Dictionary) => {
  const cfg = appConfig.partners.sponsoredTournament;
  // Passes when empty (optional) or a valid http(s) URL.
  const optionalHttpUrl = (msg: string) =>
    yup.string().test('http-url', msg, value => !value || isHttpUrl(value));

  return yup.object({
    name: yup
      .string()
      .required(t('tournament name required'))
      .min(form.titleMinLength, t('min length is {num}', { num: form.titleMinLength }))
      .max(form.titleMaxLength, t('max length is {num}', { num: form.titleMaxLength })),
    type: yup.mixed<TournamentType>().oneOf(TIER_VALUES).required(),
    shardType: yup.mixed<InventoryChipType>().oneOf(SHARD_VALUES).required(),
    prizePool: yup
      .number()
      .transform((value, original) => (original === '' ? undefined : value))
      .typeError(t('enter a valid number'))
      .required(t('prize pool required'))
      .integer(t('enter a valid number'))
      .min(
        cfg.prizePoolMin,
        t('min prize pool is {num}', { num: cfg.prizePoolMin.toLocaleString() })
      )
      .max(
        cfg.prizePoolMax,
        t('max prize pool is {num}', { num: cfg.prizePoolMax.toLocaleString() })
      ),
    teamSize: yup
      .number()
      .transform((value, original) => (original === '' ? undefined : value))
      .typeError(t('enter a valid number'))
      .required(t('team size required'))
      .integer(t('enter a valid number'))
      .min(cfg.teamSizeMin, t('min team size is {num}', { num: cfg.teamSizeMin }))
      .max(cfg.teamSizeMax, t('max team size is {num}', { num: cfg.teamSizeMax })),
    startDate: yup
      .string()
      .required(t('start date required'))
      .matches(/^\d{4}-\d{2}-\d{2}$/, t('start date required'))
      .test('not-past', t('start in the past'), value => {
        if (!value) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const picked = new Date(`${value}T00:00:00`);
        return Number.isFinite(picked.getTime()) && picked.getTime() >= today.getTime();
      }),
    startTime: yup
      .string()
      .required(t('start time required'))
      .matches(/^([01][0-9]|2[0-3]):(00|30)$/, t('start time required')),
    sponsorName: yup
      .string()
      .required(t('brand name required'))
      .max(form.titleMaxLength, t('max length is {num}', { num: form.titleMaxLength })),
    logoUrl: optionalHttpUrl(t('enter a valid url')),
    bannerUrl: optionalHttpUrl(t('enter a valid url')),
    sponsorUrl: optionalHttpUrl(t('enter a valid url')),
  });
};
