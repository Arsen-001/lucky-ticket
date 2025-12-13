export const routes = {
  // tab routes
  home: '/',
  leaderboard: '/leaderboard',
  tournaments: '/tournaments',
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

  // dynamic route
  tournamentById: (tournamentId: string) => `/tournaments/${tournamentId}`,
} as const;

type RouteValue<T> = T extends (...args: string[]) => infer R ? R : T;

export type Route = RouteValue<(typeof routes)[keyof typeof routes]>;
