export const routes = {
  // tab routes
  home: '/',
  tournaments: {
    index: '/tournaments',
    getById: function (tournamentId: string) {
      return (this.index + `/${tournamentId}`) as `/tournaments/${string}`;
    },
  },
  market: (tab?: string) => `/market${tab ? `?tab=${tab}` : ''}`,
  tasks: '/tasks',

  // auth routes
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  twoFactor: '/two-factor',

  // drawer routes
  inviteFriends: '/invite-friends',
  refererLink: function (refererId: string) {
    return `/referer/${refererId}`;
  },
  profile: '/profile',
  notifications: '/notifications',
  leaderboard: '/leaderboard',
  wallet: '/wallet',
  tickets: {
    index: '/tickets',
    getById: function (ticketId: string) {
      return (this.index + `/${ticketId}`) as `/tickets/${string}`;
    },
  },
  support: {
    index: '/support',
    getById: function (id: string) {
      return (this.index + `/${id}`) as `/support/${string}`;
    },
  },

  settings: {
    index: '/settings',
    username: '/settings/username',
    email: '/settings/email',
    phone: '/settings/phone',
    security: '/settings/security',
  },
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
