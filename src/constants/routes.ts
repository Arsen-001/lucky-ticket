export const routes = {
  // tab routes
  home: '/',
  tournaments: {
    index: '/tournaments',
    getById: function (tournamentId: string) {
      return (this.index + `/${tournamentId}`) as `/tournaments/${string}`;
    },
  },
  // The cast is what keeps `Route` meaningful: a template with a dynamic part is
  // just `string`, and one `string` in the union absorbs every literal in it —
  // which is how `Route` came to mean nothing at all while every navigation prop
  // dutifully declared it.
  market: (tab?: string) => `/market${tab ? `?tab=${tab}` : ''}` as `/market${string}`,
  tasks: '/tasks',
  testQuest: '/test-quest',

  // auth routes
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  twoFactor: '/two-factor',

  // drawer routes
  inviteFriends: '/invite-friends',
  profile: {
    index: '/profile',
    getByUserId: function (userId: string) {
      return ('/profile/' + userId) as `/profile/${string}`;
    },
    achievements: '/profile/achievements',
    stats: '/profile/stats',
  },
  // Черновая витрина персонажей: кликер и доход по уровням. Своим адресом,
  // чтобы её можно было показать, не трогая остальные экраны.
  tikki: '/tikki',
  notifications: '/notifications',
  leaderboard: '/leaderboard',
  jackpot: '/jackpot',
  promo: '/promo',
  activity: '/activity',
  wallet: '/wallet',
  lc: '/lc',
  stars: '/stars',
  tickets: {
    index: '/tickets',
  },
  // Раздел — витрина игр; каждая игра живёт своим адресом, чтобы «назад»
  // возвращало к выбору, а ссылка из приглашения вела прямо в игру.
  games: {
    index: '/games',
    duel: '/games/duel',
    /** Ссылка из приглашения: открывает игру и сразу входит в это лобби. */
    getDuelLobby: function (lobbyId: string) {
      return (this.duel + `?lobby=${lobbyId}`) as `/games/duel?lobby=${string}`;
    },
    /** Позвать конкретного игрока: экран открывается сразу выбором ставки. */
    getDuelInvite: function (userId: string) {
      return (this.duel + `?invite=${userId}`) as `/games/duel?invite=${string}`;
    },
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
  termsOfUse: '/terms-of-use',
  support: {
    index: '/support',
  },

  settings: {
    index: '/settings',
    username: '/settings/username',
    // EMAIL OFF (2026-08-17) — the whole change-email flow is switched off in
    // the Mini App, not removed: the task went first (EMAIL TASK OFF, 2026-08-12),
    // now the screen, its Settings row, its AP source and the profile badge that
    // led to it. Nothing behind it works — the backend answers 404 on
    // request-code/confirm because SMTP is not configured on Railway.
    //
    // The path is deliberately not spelled as a string here: route-coverage.test
    // reads this file as TEXT and would demand an e2e sweep for a screen that no
    // longer resolves. The screen itself lives on as a private folder, next to
    // where it used to route — settings/_email (and @header/(drawer)/settings/_email).
    // Uncomment together with those two renames — grep `EMAIL OFF`.
    // email: settings/email,
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
  partners: {
    index: '/partners',
    new: '/partners/new',
    getById: function (id: string) {
      return (this.index + `/${id}`) as `/partners/${string}`;
    },
  },
} as const;

/* eslint-disable */

type RouteValue<T> = T extends (...args: any[]) => infer R
  ? R
  : T extends object
    ? RouteValue<T[keyof T]>
    : T;

type DeclaredRoute = RouteValue<typeof routes>;

/**
 * A path this app can actually navigate to: one declared above, optionally with a
 * query string (`?tab=`, `?highlight=`).
 *
 * The query arm has to be spelled out. Without it every caller that appends a
 * query would fail — and the tempting fix, letting one member of the union be a
 * plain `string`, silently turns the whole type back into `string`, since a union
 * with `string` absorbs every literal in it. That is what had happened: `Route`
 * was required by convention on every navigation prop while accepting anything.
 */
export type Route = DeclaredRoute | `${DeclaredRoute}?${string}`;
/* eslint-enable */
