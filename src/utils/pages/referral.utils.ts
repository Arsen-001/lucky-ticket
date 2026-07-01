import { GlobalConstants } from '@/constants/global.constants';

/**
 * Telegram Mini App invite link. Opening `t.me/<bot>?startapp=<refererId>`
 * launches the app and delivers `<refererId>` as `start_param` inside initData,
 * which the backend reads on the friend's first sign-in to record the referral
 * and reward the inviter. A plain web URL can't carry `start_param`, so the
 * referral would never register.
 */
export const getRefererLink = (refererId?: string) => {
  if (!refererId) return '';
  return `${GlobalConstants.telegramBotUrl}?startapp=${refererId}`;
};
