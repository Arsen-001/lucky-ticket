import { Env } from '@/services/environment.service';
import { routes } from '@/constants/routes';

export const getRefererLink = (refererId?: string) => {
  if (!refererId) return '';
  return `${Env.appUrl || window.location.origin}${routes.refererLink(refererId)}`;
};
