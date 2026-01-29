import type { Dictionary } from '@/types/types/i18n.types';

export const getTicketPerTimeUnit = (t: Dictionary) => {
  return `${t('ticket')[0]}/${t('hours')[0]}`;
};
