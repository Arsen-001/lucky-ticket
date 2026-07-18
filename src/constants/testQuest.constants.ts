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
  /** Badge level. 31 = entry, 1 = Genesis crown. */
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

/** Full ladder, level 31 (entry) down to level 1 (Genesis). */
export const testQuestLadder: TestQuestLevel[] = [
  {
    level: 31,
    day: null,
    task: '— (вход в тест)',
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
    drop: '750k LC · 15 билетов · 50 LS',
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
    drop: '1.2M LC · 25 билетов · 60 LS',
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
    drop: '1.5M LC · 25 билетов · 150 LS',
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
    task: 'Корона · топ-50 по рефералам',
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
    task: 'Корона · #1 Genesis',
    drop: '5M LC · 50 билетов · 500 LS · VIP 3 · печать Genesis',
    zone: 'crown',
  },
];
