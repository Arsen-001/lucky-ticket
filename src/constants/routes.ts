export const routes = {
  home: '/',

  //(auth) routes
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  twoFactor: '/two-factor',
} as const;

export type Route = (typeof routes)[keyof typeof routes];
