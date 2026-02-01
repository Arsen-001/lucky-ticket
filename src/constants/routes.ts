export const routes = {
  // tab routes
  home: '/',
  leaderboard: '/leaderboard',
  tournaments: {
    index: '/tournaments',
    getById: function (tournamentId: string) {
      return (this.index + `/${tournamentId}`) as `/tournaments/${string}`;
    },
  },
  boosts: '/boosts',
  tasks: '/tasks',

  // auth routes
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  twoFactor: '/two-factor',

  // drawer routes
  inviteFriends: '/invite-friends',
  profile: '/profile',
  notifications: '/notifications',
  shop: '/shop',
  exchange: '/exchange',
  support: {
    index: '/support',
    getById: function (id: string) {
      return (this.index + `/${id}`) as `/support/${string}`;
    },
  },

  settings: '/settings',
  languages: '/languages',
} as const;

/* eslint-disable */

type RouteValue<T> = T extends (...args: any[]) => infer R
  ? R
  : T extends object
    ? RouteValue<T[keyof T]>
    : T;

export type Route = RouteValue<typeof routes>;
/* eslint-enable */
