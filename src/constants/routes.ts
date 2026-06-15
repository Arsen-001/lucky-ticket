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
  profile: {
    index: '/profile',
    getByUserId: function (userId: string) {
      return ('/profile/' + userId) as `/profile/${string}`;
    },
    achievements: '/profile/achievements',
  },
  notifications: '/notifications',
  leaderboard: '/leaderboard',
  jackpot: '/jackpot',
  promo: '/promo',
  activity: '/activity',
  wallet: '/wallet',
  lc: '/lc',
  tickets: {
    index: '/tickets',
  },
  engines: {
    index: '/engines',
    getById: function (engineId: string) {
      return (this.index + `/${engineId}`) as `/engines/${string}`;
    },
  },
  faq: {
    index: '/faq',
    getById: function (id: string) {
      return (this.index + `/${id}`) as `/faq/${string}`;
    },
  },
  privacy: '/privacy',
  support: {
    index: '/support',
  },

  settings: {
    index: '/settings',
    username: '/settings/username',
    email: '/settings/email',
    security: '/settings/security',
    luckyPlayer: '/settings/lucky-player',
    vip: '/settings/vip',
  },
  languages: '/languages',
  inventory: '/inventory',
  stakes: {
    index: '/stakes',
    new: '/stakes/new',
    history: '/stakes/history',
    getById: function (stakeId: string) {
      return (this.index + `/${stakeId}`) as `/stakes/${string}`;
    },
    getReadyById: function (stakeId: string) {
      return (this.index + `/ready/${stakeId}`) as `/stakes/ready/${string}`;
    },
  },
} as const;

/* eslint-disable */

type RouteValue<T> = T extends (...args: any[]) => infer R
  ? R
  : T extends object
    ? RouteValue<T[keyof T]>
    : T;

export type Route = RouteValue<typeof routes>;
/* eslint-enable */
