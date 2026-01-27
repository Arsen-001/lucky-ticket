export const routes = {
  // tab routes
  home: '/',
  leaderboard: '/leaderboard',
  tournaments: {
    index: '/tournaments',
    tournamentById: function (tournamentId: string): `/tournaments/${string}` {
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
  helpCenter: '/help-center',
  settings: '/settings',
  languages: '/languages',
} as const;

type RouteValue<T> = T extends (...args: any[]) => infer R
  ? R
  : T extends object
    ? RouteValue<T[keyof T]>
    : T;

export type Route = RouteValue<typeof routes>;
