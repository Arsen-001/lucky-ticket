import { routes, type Route } from '@/constants/routes';

/**
 * Telegram Mini App deep links.
 *
 * A shared in-app link is a bot link `t.me/<bot>?startapp=<param>`; Telegram
 * delivers `<param>` as `start_param`. Deep-link params are namespaced as
 * `<type>-<id>` (or `<type>_<id>`), so the single `start_param` slot can target
 * any screen — while a bare value (a referral id) stays a referral and is
 * handled by the backend on first sign-in.
 *
 * To add a new deep-link target: register one entry in `DEEP_LINK_ROUTES` and
 * build the param with `buildDeepLinkParam(type, id)` at the share site.
 */
const DEEP_LINK_ROUTES: Record<string, (id: string) => Route> = {
  faq: id => routes.faq.getById(id),
  // Приглашение на дуэль ведёт в КОНКРЕТНОЕ лобби, а не в список: человек
  // нажал «принять вызов», значит он идёт играть с тем, кто позвал.
  duel: id => routes.games.getDuelLobby(id),
  // Add more as needed, e.g.:
  // tournament: id => routes.tournaments.getById(id),
  // stake: id => routes.stakes.getById(id),
  // profile: id => routes.profile.getById(id),
};

/** Build a deep-link `start_param`, e.g. `buildDeepLinkParam('faq', '5')` → `'faq-5'`. */
export const buildDeepLinkParam = (type: string, id: string): string => `${type}-${id}`;

/**
 * Resolve a Telegram `start_param` to the in-app route it targets, or `null`
 * when it is not a recognised deep link (a bare referral id, an unknown type,
 * or empty). Pure and side-effect-free so the boot handler stays trivial.
 */
export const resolveStartParamRoute = (startParam: string | undefined | null): Route | null => {
  const match = startParam?.match(/^([a-zA-Z]+)[-_](.+)$/);
  if (!match) return null;
  const build = DEEP_LINK_ROUTES[match[1].toLowerCase()];
  return build ? build(match[2]) : null;
};
