import { routes, type Route } from '@/constants/routes';

/**
 * Test-Quest ladder — the 31-day launch quest ("Тестировщик 31 → 1").
 *
 * PROTOTYPE DATA. These per-level task/drop strings are front-end placeholder
 * content so the pinned card can be seen and clicked in the running app. When
 * the backend ships the `test-quest` endpoint the card switches to live data
 * (already-localized by the server) and this constant is retired.
 *
 * Countdown mechanic (see the launch design): every player enters at level 31
 * and climbs toward level 1 (1 = the top). Levels 31→4 are the daily ladder;
 * levels 3→1 are the competitive crown (leaderboard-assigned at test end).
 */

export type TestQuestZone = 'entry' | 'ladder' | 'wall' | 'crown';

export interface TestQuestLevel {
  /** Badge level. 31 = entry, 1 = top crown. */
  level: number;
  /** Day of the test the level maps to (null for entry / crown). */
  day: number | null;
  /** The level's own task (placeholder content until the backend owns it). */
  task: string;
  /** Reward that drops when the level is taken. */
  drop: string;
  zone: TestQuestZone;
}

export const TEST_QUEST_TOTAL_LEVELS = 31;

/** Demo: the level the pinned card starts on in the running app. */
export const TEST_QUEST_START_LEVEL = 27;

/** Full ladder, level 31 (entry) down to level 1 (top crown). */
export const testQuestLadder: TestQuestLevel[] = [
  {
    level: 31,
    day: null,
    task: 'Старт: собери набор новичка',
    drop: '500k LC · 10 билетов · LP 3д · 10 LS',
    zone: 'entry',
  },
  {
    level: 30,
    day: 1,
    task: 'Забери билет с движка',
    drop: '200k LC · 5 билетов · +10 AP',
    zone: 'ladder',
  },
  {
    level: 29,
    day: 2,
    task: 'Посмотри 3 рекламы',
    drop: '200k LC · 5 билетов · 5 LS',
    zone: 'ladder',
  },
  {
    level: 28,
    day: 3,
    task: 'Лайк профилю + отправь билет другу',
    drop: '250k LC · 5 билетов · +15 AP',
    zone: 'ladder',
  },
  {
    level: 27,
    day: 4,
    task: 'Собери 5 билетов за день',
    drop: '300k LC · 8 билетов · LP 2д',
    zone: 'ladder',
  },
  {
    level: 26,
    day: 5,
    task: 'Пригласи 1 друга',
    drop: '400k LC · 10 билетов · 20 LS',
    zone: 'wall',
  },
  {
    level: 25,
    day: 6,
    task: 'Апгрейдни движок',
    drop: '400k LC · 10 билетов · +20 AP',
    zone: 'ladder',
  },
  { level: 24, day: 7, task: 'Подтверди почту', drop: '300k LC · 30 LS · +20 AP', zone: 'ladder' },
  {
    level: 23,
    day: 8,
    task: 'Сыграй турнир',
    drop: '500k LC · 10 билетов · 25 LS',
    zone: 'ladder',
  },
  {
    level: 22,
    day: 9,
    task: 'Посмотри 10 реклам',
    drop: '400k LC · 10 билетов · LP 3д',
    zone: 'ladder',
  },
  {
    level: 21,
    day: 10,
    task: 'Сделай первый стейк',
    drop: '600k LC · 15 билетов · 30 LS',
    zone: 'ladder',
  },
  {
    level: 20,
    day: 11,
    task: 'Достигни Silver',
    drop: '750k LC · 15 билетов · 1 движок',
    zone: 'wall',
  },
  {
    level: 19,
    day: 12,
    task: '3 друга суммарно',
    drop: '700k LC · 15 билетов · 40 LS',
    zone: 'wall',
  },
  {
    level: 18,
    day: 13,
    task: 'Выиграй турнир (топ-3)',
    drop: '800k LC · 20 билетов · LP 5д',
    zone: 'ladder',
  },
  {
    level: 17,
    day: 14,
    task: 'Собери 20 билетов',
    drop: '700k LC · 15 билетов · 50 LS',
    zone: 'ladder',
  },
  {
    level: 16,
    day: 15,
    task: '5 друзей суммарно',
    drop: '1M LC · 20 билетов · 50 LS',
    zone: 'wall',
  },
  { level: 15, day: 16, task: 'Достигни Gold', drop: '1M LC · 20 билетов · LP 7д', zone: 'wall' },
  {
    level: 14,
    day: 17,
    task: 'Выиграй 3 турнира суммарно',
    drop: '900k LC · 20 билетов · 60 LS',
    zone: 'ladder',
  },
  {
    level: 13,
    day: 18,
    task: '200 реклам суммарно',
    drop: '800k LC · 15 билетов · 75 LS',
    zone: 'ladder',
  },
  {
    level: 12,
    day: 19,
    task: '7 друзей суммарно',
    drop: '1.2M LC · 25 билетов · 1 движок',
    zone: 'wall',
  },
  {
    level: 11,
    day: 20,
    task: '2 активных стейка',
    drop: '1M LC · 20 билетов · 80 LS',
    zone: 'ladder',
  },
  {
    level: 10,
    day: 21,
    task: '10 друзей суммарно',
    drop: '1.5M LC · 25 билетов · 100 LS · LP 14д',
    zone: 'wall',
  },
  {
    level: 9,
    day: 22,
    task: 'Держи Gold + выиграй Gold-турнир',
    drop: '1.5M LC · 25 билетов · 100 LS',
    zone: 'ladder',
  },
  {
    level: 8,
    day: 23,
    task: 'Топ-10 в турнире',
    drop: '1.3M LC · 25 билетов · 120 LS',
    zone: 'ladder',
  },
  {
    level: 7,
    day: 24,
    task: '15 друзей суммарно',
    drop: '2M LC · 30 билетов · 150 LS',
    zone: 'wall',
  },
  {
    level: 6,
    day: 25,
    task: '300 реклам суммарно',
    drop: '1.5M LC · 25 билетов · 150 LS · 1 движок',
    zone: 'ladder',
  },
  {
    level: 5,
    day: 26,
    task: '18 друзей суммарно',
    drop: '3M LC · 40 билетов · 200 LS',
    zone: 'wall',
  },
  {
    level: 4,
    day: 27,
    task: 'Достигни Platinum · квалификация',
    drop: '3M LC · 40 билетов · LP 30д',
    zone: 'wall',
  },
  {
    level: 3,
    day: null,
    task: 'Корона · топ-50 по друзьям',
    drop: '4M LC · 45 билетов · 300 LS',
    zone: 'crown',
  },
  {
    level: 2,
    day: null,
    task: 'Корона · топ-10',
    drop: '4.5M LC · 50 билетов · VIP 1 · 250 LS',
    zone: 'crown',
  },
  {
    level: 1,
    day: null,
    task: 'Корона · #1',
    drop: '5M LC · 50 билетов · 500 LS · VIP 3 · именная печать',
    zone: 'crown',
  },
];

/**
 * One actionable step toward completing a level's task, shown in the checklist
 * under the slider on the Test-Quest screen. A step with `detail` or `subSteps`
 * renders as an expandable dropdown; a plain step is a single row with an
 * optional "go there" deep-link.
 */
export interface TestQuestStep {
  /** Short imperative line, e.g. "Посмотри 3 рекламы". */
  text: string;
  /** Where the action is performed — rendered as a "Перейти" deep-link. */
  href?: Route;
  /** Optional how-to line; its presence turns the row into a dropdown. */
  detail?: string;
  /** Optional sub-checklist; its presence turns the row into a dropdown. */
  subSteps?: string[];
}

// Keyword → the screen where that action is performed. First match wins.
const STEP_HREF_RULES: { match: RegExp; href: Route }[] = [
  { match: /реклам/i, href: routes.tasks },
  { match: /(пригласи|друг|рефер)/i, href: routes.inviteFriends },
  { match: /стейк/i, href: routes.stakes.index },
  { match: /турнир/i, href: routes.tournaments.index },
  { match: /билет/i, href: routes.tickets.index },
  { match: /(движ|двигател|апгрейд)/i, href: routes.market() },
  { match: /почт/i, href: routes.settings.email },
  { match: /(профил|лайк)/i, href: routes.profile.index },
  { match: /(звёзд|звезд|stars)/i, href: routes.stars },
  { match: /(silver|gold|platinum|diamond|vip|статус)/i, href: routes.settings.vip },
];

const hrefForStep = (text: string): Route | undefined =>
  STEP_HREF_RULES.find(r => r.match.test(text))?.href;

// Authored checklist per level (31 → 1). Every step maps to a real in-app
// action with a deep-link; steps with `detail`/`subSteps` expand into how-to
// dropdowns. Front-end prototype — the backend will own these once it ships
// real per-step data. `resolveTestQuestSteps` falls back to splitting the task
// line for any level that has no override here.
const TEST_QUEST_STEP_OVERRIDES: Record<number, TestQuestStep[]> = {
  // 31 · entry — a rich onboarding bundle (profile · engine · ad · first invite)
  31: [
    {
      text: 'Оформи профиль — аватар и никнейм',
      href: routes.profile.index,
      detail: 'Профиль → изменить фото и имя.',
    },
    { text: 'Запусти движок и забери первый билет', href: routes.home },
    { text: 'Посмотри первую рекламу за награду', href: routes.tasks },
    {
      text: 'Отправь ссылку-приглашение другу',
      href: routes.inviteFriends,
      subSteps: ['Открой «Пригласить»', 'Отправь ссылку в Telegram', 'Друг заходит в игру'],
    },
  ],
  // 30 → 27 · warm-up
  30: [
    { text: 'Открой главную — блок движков', href: routes.home },
    {
      text: 'Забери готовый билет с движка',
      detail: 'Движок печатает билеты со временем — как готов, забирай.',
    },
  ],
  29: [
    {
      text: 'Открой рекламу в задачах',
      href: routes.tasks,
      detail: 'Задачи → Реклама, до 10 роликов в день.',
    },
    { text: 'Досмотри 3 ролика до конца', detail: 'Награда — только за полный просмотр.' },
  ],
  28: [
    { text: 'Поставь лайк на профиле', href: routes.profile.index },
    { text: 'Подари билет другу', href: routes.tickets.index, detail: 'Билеты → отправить другу.' },
  ],
  27: [
    { text: 'Забирай билеты с движков за день', href: routes.home },
    { text: 'Не хватает до 5 — докупи в маркете', href: routes.market() },
  ],
  // 26 → 21 · first of each mechanic
  26: [
    { text: 'Открой «Пригласить друзей»', href: routes.inviteFriends },
    {
      text: 'Отправь личную ссылку',
      subSteps: [
        'Скопируй ссылку или карточку',
        'Отправь другу в Telegram',
        'Друг открывает Mini App',
      ],
    },
    {
      text: 'Друг активируется — входит в игру',
      detail: 'Засчитывается активированный друг, не просто клик по ссылке.',
    },
  ],
  25: [
    { text: 'Открой Маркет → свой движок', href: routes.market() },
    { text: 'Прокачай уровень движка', detail: 'Апгрейд ускоряет печать билетов.' },
  ],
  24: [
    {
      text: 'Открой смену почты',
      href: routes.settings.email,
      detail: 'Профиль → Настройки → Почта.',
    },
    {
      text: 'Подтверди адрес кодом',
      detail: 'На новый адрес придёт код из 6 символов — введи его в течение 15 минут.',
    },
  ],
  23: [
    { text: 'Открой турниры и выбери свой тир', href: routes.tournaments.index },
    { text: 'Купи билет и вступи в турнир', detail: 'Дождись финиша — награда по месту.' },
  ],
  22: [
    { text: 'Открой рекламу в задачах', href: routes.tasks },
    { text: 'Досмотри 10 роликов', detail: 'До 10 в день — можно собрать за один заход.' },
  ],
  21: [
    { text: 'Открой Стейки → «Новый»', href: routes.stakes.new },
    {
      text: 'Запусти первый стейк',
      subSteps: ['Выбери сумму LC и срок', 'Подтверди', 'AP начислится сразу'],
    },
  ],
  // 20 → 11 · scaling walls
  20: [
    {
      text: 'Открой свой статус',
      href: routes.settings.vip,
      detail: 'Статус растёт от активности и AP.',
    },
    { text: 'Добери активность до Silver' },
  ],
  19: [
    { text: 'Открой «Пригласить друзей»', href: routes.inviteFriends },
    {
      text: 'Доведи число активных друзей до 3',
      detail: 'Считаются активированные с начала теста.',
    },
  ],
  18: [
    { text: 'Вступи в турнир по силам', href: routes.tournaments.index },
    { text: 'Финишируй в топ-3', detail: 'Награда — за место 1–3.' },
  ],
  17: [
    { text: 'Забирай билеты с движков', href: routes.home },
    { text: 'Ускорься апгрейдом или вторым движком', href: routes.market() },
    { text: 'Собери 20 билетов' },
  ],
  16: [
    { text: 'Открой «Пригласить друзей»', href: routes.inviteFriends },
    { text: 'Доведи активных друзей до 5' },
  ],
  15: [
    { text: 'Открой свой статус', href: routes.settings.vip },
    { text: 'Добери активность до Gold' },
  ],
  14: [
    { text: 'Играй турниры своего тира', href: routes.tournaments.index },
    { text: 'Набери 3 победы за тест' },
  ],
  13: [
    { text: 'Смотри рекламу каждый день', href: routes.tasks, detail: 'До 10/день — держи темп.' },
    { text: 'Добей до 200 просмотров суммарно' },
  ],
  12: [
    { text: 'Открой «Пригласить друзей»', href: routes.inviteFriends },
    { text: 'Доведи активных друзей до 7' },
  ],
  11: [
    { text: 'Открой Стейки → «Новый»', href: routes.stakes.new },
    {
      text: 'Держи 2 активных стейка одновременно',
      detail: 'Оба должны быть активны в один момент.',
    },
  ],
  // 10 → 4 · endgame
  10: [
    { text: 'Открой «Пригласить друзей»', href: routes.inviteFriends },
    { text: 'Доведи активных друзей до 10' },
  ],
  9: [
    { text: 'Держи статус Gold', href: routes.settings.vip },
    { text: 'Выиграй турнир Gold-тира', href: routes.tournaments.index },
  ],
  8: [
    { text: 'Вступи в крупный турнир', href: routes.tournaments.index },
    { text: 'Финишируй в топ-10' },
  ],
  7: [
    { text: 'Открой «Пригласить друзей»', href: routes.inviteFriends },
    { text: 'Доведи активных друзей до 15' },
  ],
  6: [
    { text: 'Смотри рекламу ежедневно', href: routes.tasks },
    { text: 'Добей до 300 просмотров суммарно' },
  ],
  5: [
    { text: 'Открой «Пригласить друзей»', href: routes.inviteFriends },
    { text: 'Доведи активных друзей до 18' },
  ],
  4: [
    {
      text: 'Прокачай статус до Platinum',
      href: routes.settings.vip,
      detail: 'Platinum — порог квалификации на корону.',
    },
    {
      text: 'Квалификация на корону открыта',
      detail: 'Дальше корону 3 → 1 решает «Топ по друзьям».',
    },
  ],
  // 3 → 1 · crown (provisional — decided by the friends leaderboard at test end)
  3: [
    {
      text: 'Войди в топ-50 «Топ по друзьям»',
      href: routes.inviteFriends,
      detail: 'Корона присуждается в конце теста по числу активированных друзей.',
    },
  ],
  2: [{ text: 'Войди в топ-10 «Топ по друзьям»', href: routes.inviteFriends }],
  1: [{ text: 'Стань #1 в «Топ по друзьям»', href: routes.inviteFriends }],
};

/**
 * Resolve the checklist for a level. Prefers an authored override; otherwise
 * splits the one-line `task` into steps on " · " / " + " and attaches a
 * deep-link by keyword. Front-end prototype until the backend ships real steps.
 */
export const resolveTestQuestSteps = (level: number, task: string): TestQuestStep[] => {
  const override = TEST_QUEST_STEP_OVERRIDES[level];
  if (override) return override;
  return task
    .split(/\s*[·+]\s*/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(text => ({ text, href: hrefForStep(text) }));
};
