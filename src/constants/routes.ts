export const routes = {
  home: '/',
  leaderboard: '/leaderboard',
  tournaments: '/tournaments',
  boosts: '/boosts',
  tasks: '/tasks',

  //(auth) routes
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  twoFactor: '/two-factor',
} as const;

export type Route = (typeof routes)[keyof typeof routes];
