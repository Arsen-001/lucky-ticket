import {
  tikkiAwayDays,
  tikkiBaseRate,
  tikkiBuyPaybackDays,
  tikkiLevelPaybackDays,
  tikkiMaxHours,
  tikkiMaxLevel,
  tikkiMergeStepUp,
  tikkiStartHours,
  tikkiTapMinPresses,
  tikkiTierMultiplier,
  tikkiTiers,
  tikkiVisitHours,
  tikkiWindowPriceSpan,
  type TikkiTier,
  type TikkiUnit,
} from './tikki.constants';

const HOUR_MS = 3_600_000;

/** Сколько бронзовый/серебряный/… даёт в час на первом уровне: 25 × ступень. */
export const tikkiTierBase = (tier: TikkiTier) => tikkiBaseRate * tikkiTierMultiplier[tier];

/** Следующая ступень тира — или `null`, если дальше некуда (алмаз). */
export const nextTikkiTier = (tier: TikkiTier): TikkiTier | null =>
  tikkiTiers[tikkiTiers.indexOf(tier) + 1] ?? null;

/** Только что купленный Тикки: оба уровня первые, оба буста первые. */
export const buyTikkiUnit = (tier: TikkiTier, id: string, now: number): TikkiUnit => ({
  id,
  tier,
  level: 1,
  base: tikkiTierBase(tier),
  passiveLevel: 1,
  passiveBase: tikkiTierBase(tier),
  tapLevel: 1,
  windowLevel: 1,
  fill: 0,
  filledAt: now,
  paidAt: now,
});

// ── что Тикки даёт ────────────────────────────────────────────────────────────

/** Кликер в час. Двигает его ТОЛЬКО уровень кликера, прибавкой шага тира. */
export const tikkiClickerRate = (unit: TikkiUnit) =>
  unit.base + (unit.level - 1) * tikkiTierMultiplier[unit.tier];

/** Пассив в час. Идёт на счёт сам, забирать не нужно. */
export const tikkiPassiveRate = (unit: TikkiUnit) =>
  unit.passiveBase + (unit.passiveLevel - 1) * tikkiTierMultiplier[unit.tier];

/** Окно: за сколько часов кликер наполняется доверху. Ступень — час. */
export const tikkiWindowHours = (unit: TikkiUnit) =>
  Math.min(tikkiMaxHours, tikkiStartHours + (unit.windowLevel - 1));

/** Сколько влезает в кликер: доход в час × окно. */
export const tikkiCapacity = (unit: TikkiUnit) => tikkiClickerRate(unit) * tikkiWindowHours(unit);

/** Сколько тап забрал бы, не будь пола по нажатиям. */
export const tikkiTapRaw = (unit: TikkiUnit) =>
  Math.max(1, tikkiTierMultiplier[unit.tier] * unit.tapLevel);

/**
 * Сколько тап забирает на самом деле. Пол по нажатиям: за одно нажатие уходит
 * не больше десятой части кликера, иначе полный Тикки опустошался бы в один тап.
 */
export const tikkiTapValue = (unit: TikkiUnit) =>
  Math.max(1, Math.min(tikkiTapRaw(unit), Math.floor(tikkiCapacity(unit) / tikkiTapMinPresses)));

/** Сколько нажатий нужно, чтобы вынести полный кликер. */
export const tikkiTapPresses = (unit: TikkiUnit) =>
  Math.ceil(tikkiCapacity(unit) / tikkiTapValue(unit));

/**
 * Дневной доход кликера — усреднённый по тому, как люди правда заходят.
 * Игрок приходит раз в `T` часов и забирает накопившееся, но не больше того,
 * что влезло в окно. Отсюда окно и уровень сами упираются друг в друга, и цена
 * перестаёт хвалить бесполезную покупку.
 */
export const tikkiClickerDayIncome = (rate: number, capacity: number) =>
  tikkiVisitHours.reduce((sum, hours) => sum + Math.min(capacity, rate * hours) * (24 / hours), 0) /
  tikkiVisitHours.length;

/** Дневной доход Тикки целиком: кликер по привычкам + пассив все 24 часа. */
export const tikkiDayIncome = (unit: TikkiUnit) =>
  tikkiClickerDayIncome(tikkiClickerRate(unit), tikkiCapacity(unit)) + tikkiPassiveRate(unit) * 24;

// ── цены ──────────────────────────────────────────────────────────────────────

/**
 * Цена ступени уровня кликера. Считается по приросту РЕАЛЬНОГО дневного дохода,
 * поэтому зависит от окна: при окне 4 ч на бронзе это 6 716, при 12 ч — 8 760.
 * Порядок прокачки на итоговую сумму влияет, и подсказки игроку тут нет: кто
 * разберётся — сэкономит.
 */
export const tikkiClickerLevelCost = (unit: TikkiUnit) => {
  if (unit.level >= tikkiMaxLevel) return Infinity;
  const next: TikkiUnit = { ...unit, level: unit.level + 1 };
  const gain =
    tikkiClickerDayIncome(tikkiClickerRate(next), tikkiCapacity(next)) -
    tikkiClickerDayIncome(tikkiClickerRate(unit), tikkiCapacity(unit));
  return Math.max(100, Math.round(gain * tikkiLevelPaybackDays));
};

/**
 * Цена ступени пассива. Пассив идёт все сутки и ничем не ограничен, поэтому
 * цена ровная вдоль всей лестницы: шаг тира × 24 часа × год.
 */
export const tikkiPassiveLevelCost = (unit: TikkiUnit) => {
  if (unit.passiveLevel >= tikkiMaxLevel) return Infinity;
  return Math.max(100, Math.round(tikkiTierMultiplier[unit.tier] * 24 * tikkiLevelPaybackDays));
};

/**
 * Цена часа окна. Дорого войти, дальше дешевле: первый докупленный час стоит
 * двадцать дневных доходов Тикки, последний — двенадцать.
 */
export const tikkiWindowCost = (unit: TikkiUnit) => {
  const hours = tikkiWindowHours(unit);
  if (hours >= tikkiMaxHours) return Infinity;
  return Math.round(tikkiDayIncome(unit) * (tikkiWindowPriceSpan - hours));
};

/** Тап упёрся в пол по нажатиям — дальше ступень не продаётся. */
export const tikkiTapMaxed = (unit: TikkiUnit) =>
  unit.tapLevel >= tikkiMaxLevel ||
  tikkiTapRaw(unit) >= Math.floor(tikkiCapacity(unit) / tikkiTapMinPresses);

/**
 * Цена ступени тапа. Тап дохода не печатает — он экономит нажатия, поэтому
 * оценён не окупаемостью, а долей дневного дохода, и дешевеет с уровнем.
 */
export const tikkiTapCost = (unit: TikkiUnit) => {
  if (tikkiTapMaxed(unit)) return Infinity;
  return Math.round(tikkiDayIncome(unit) * (1.3 - unit.tapLevel / tikkiMaxLevel));
};

/**
 * Цена покупки Тикки любого тира: его дневной доход × 395 дней. Окупаемость у
 * всех пяти одинаковая — старший тир не выгоднее, он просто крупнее.
 */
export const tikkiBuyCost = (tier: TikkiTier) => {
  const fresh = buyTikkiUnit(tier, '', 0);
  const day =
    tikkiClickerDayIncome(tikkiClickerRate(fresh), tikkiCapacity(fresh)) +
    tikkiClickerRate(fresh) * 24;
  return Math.round(day * tikkiBuyPaybackDays);
};

// ── сплав ─────────────────────────────────────────────────────────────────────

/**
 * База нового тира, которая приходит сверх суммы. Она одна и та же, сколько бы
 * карточек ни положили: в серебро 100, в золото 400, в платину 1600, в алмаз 6400.
 */
export const tikkiMergeGift = (tier: TikkiTier) => {
  const to = nextTikkiTier(tier);
  return to ? tikkiTierBase(to) : 0;
};

/** Вся лестница надбавок разом — для того, что рисует правила целиком. */
export const tikkiMergeStepUpPercentByTier = (): Record<string, number> =>
  Object.fromEntries(tikkiTiers.map(tier => [tier, tikkiMergeStepUp[tier]]));

/** Процент ступени, на которую поднимаешься: 1 · 2 · 3 · 4. */
export const tikkiMergePercent = (tier: TikkiTier) => {
  const to = nextTikkiTier(tier);
  return to ? tikkiMergeStepUp[to] : 0;
};

/**
 * 🔴 Цена сплава ФИКСИРОВАННАЯ — ровно цена покупки того тира, в который
 * поднимаешься, при любом числе карточек. Бесплатных сплавов нет, платится с
 * самого первого. Поэтому класть больше четверых всегда выгоднее: цена та же,
 * а сумма больше.
 */
export const tikkiMergeCost = (tier: TikkiTier) => {
  const to = nextTikkiTier(tier);
  return to ? tikkiBuyCost(to) : 0;
};

/**
 * Что получится из отмеченных. Складывается ТОЛЬКО доход в час — окно, тап и
 * уровень у нового такие же, как у купленного его тира. Процент идёт на полный
 * результат, а не только на подарок: иначе класть больше четверых нет смысла.
 */
export const tikkiMergeResult = (units: readonly TikkiUnit[]) => {
  const from = units[0]?.tier;
  const to = from ? nextTikkiTier(from) : null;
  if (!from || !to) return null;

  const gift = tikkiMergeGift(from);
  const percent = tikkiMergePercent(from);
  const scale = 1 + percent / 100;
  const clickerSum = units.reduce((sum, unit) => sum + tikkiClickerRate(unit), 0);
  const passiveSum = units.reduce((sum, unit) => sum + tikkiPassiveRate(unit), 0);

  return {
    from,
    to,
    gift,
    percent,
    clickerSum,
    passiveSum,
    base: Math.round((clickerSum + gift) * scale),
    passiveBase: Math.round((passiveSum + gift) * scale),
    cost: tikkiMergeCost(from),
  };
};

/** Новый Тикки из отмеченных: первого уровня, но с большой базой. */
export const mergeTikkiUnits = (
  units: readonly TikkiUnit[],
  id: string,
  now: number
): TikkiUnit | null => {
  const result = tikkiMergeResult(units);
  if (!result) return null;

  return {
    ...buyTikkiUnit(result.to, id, now),
    base: result.base,
    passiveBase: result.passiveBase,
  };
};

/**
 * Что получится из отмеченных — ДЛЯ ПОКАЗА, пока игрок ещё выбирает.
 *
 * Считается ровно теми числами, что прислал сервер (доход каждого, база тира,
 * процент ступени, цена), а не своей копией экономики: своя копия однажды
 * разошлась бы с той, по которой списывают. Сервер пересчитает всё заново, и
 * если экран врал — это станет видно в первый же сплав.
 */
export const tikkiMergePreview = (
  units: readonly { tier: string; clickerPerHour: number; passivePerHour: number }[],
  tierBase: Record<string, number>,
  stepUpPercent: Record<string, number>,
  costByTier: Record<string, number>
) => {
  const from = units[0]?.tier as TikkiTier | undefined;
  const to = from ? nextTikkiTier(from) : null;
  if (!from || !to) return null;

  const gift = tierBase[to] ?? 0;
  const percent = stepUpPercent[to] ?? 0;
  const scale = 1 + percent / 100;
  const clickerSum = units.reduce((sum, u) => sum + u.clickerPerHour, 0);
  const passiveSum = units.reduce((sum, u) => sum + u.passivePerHour, 0);

  return {
    from,
    to,
    gift,
    percent,
    clickerSum,
    passiveSum,
    /** Столько даёт обычный купленный — с ним и сравнивают результат. */
    plain: gift,
    base: Math.round((clickerSum + gift) * scale),
    passiveBase: Math.round((passiveSum + gift) * scale),
    cost: costByTier[from] ?? 0,
  };
};

// ── время ─────────────────────────────────────────────────────────────────────

/** Сколько лежит в кликере к моменту `now`. Дальше окна не растёт. */
export const tikkiFillAt = (unit: TikkiUnit, now: number) => {
  const hours = Math.max(0, (now - unit.filledAt) / HOUR_MS);
  return Math.min(tikkiCapacity(unit), unit.fill + tikkiClickerRate(unit) * hours);
};

/**
 * Сколько пассив накапал на счёт с прошлого зачисления. Без захода он работает
 * неделю, дальше останавливается до следующего входа.
 */
export const tikkiPassiveEarned = (unit: TikkiUnit, now: number) => {
  const hours = Math.min(Math.max(0, (now - unit.paidAt) / HOUR_MS), tikkiAwayDays * 24);
  return tikkiPassiveRate(unit) * hours;
};
