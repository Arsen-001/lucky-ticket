import type { RouletteSlot, RouletteSlotKind } from '@/types/interfaces/roulette.interfaces';

/**
 * Насколько ценен ВИД приза. Порядок продуктовый, а не выведенный из чисел
 * слота, и другого способа его узнать у клиента нет: «7» у Lucky Player — это
 * дни, «100» у звёзд — звёзды, у подарка Telegram `amount` вообще ноль.
 *
 * Отдельно сказано, почему не «самый редкий шанс», хотя так и было написано
 * сначала: в живой таблице реже всех выпадает алмазный билет (0.5%), а самый
 * дорогой слот — недельная подписка Lucky Player за 100 ⭐, у неё 1.1%. Витрина,
 * собранная по шансу, объявляла главным призом билет.
 *
 * @see https://github.com/Arsen-001/lucky-ticket-docs — таблица призов рулетки
 */
const KIND_RANK: Record<RouletteSlotKind, number> = {
  // Целая недельная подписка — 100 ⭐ и до 70 пропущенных показов рекламы.
  LUCKY_PLAYER: 6,
  // Настоящий подарок Telegram: его отправляет админ рукой, 15–50 ⭐.
  TELEGRAM_GIFT: 5,
  STARS: 4,
  TICKET: 3,
  // Вещи и показы лежат в каталоге выключенными — пути начисления для них ещё
  // нет, но появятся, и место в лестнице у них уже своё.
  ITEM: 2,
  AD_VIEWS: 2,
  AP: 1,
  // Лишний спин ничего не стоит сам по себе — он лишь возвращает к барабану.
  EXTRA_SPIN: 0,
  LC: 1,
};

const RARITY_RANK = { EPIC: 2, RARE: 1, COMMON: 0 } as const;

/**
 * По ценности: сначала вид, потом редкость внутри вида, потом номинал.
 *
 * Внутри одного вида шанс — честная мера: «Подарок Telegram · 50 ⭐» выпадает
 * реже, чем «· 15 ⭐», ровно потому что дороже. Между видами он не значит
 * ничего.
 */
function byValue(a: RouletteSlot, b: RouletteSlot): number {
  const byKind = KIND_RANK[b.kind] - KIND_RANK[a.kind];
  if (byKind !== 0) return byKind;

  // Скрытый шанс (оператор выключил показ) не может выиграть у названного:
  // null — это «неизвестно», а не «ноль процентов».
  if (a.chance !== null && b.chance !== null && a.chance !== b.chance) return a.chance - b.chance;
  if ((a.chance === null) !== (b.chance === null)) return a.chance === null ? 1 : -1;

  if (a.amount !== b.amount) return b.amount - a.amount;
  // Ничья по всему — остаётся порядок, в котором таблицу опубликовал сервер.
  return RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity];
}

/**
 * Главный приз барабана — самый дорогой слот, а не самый редкий.
 *
 * Каталог правится в админке без деплоя, поэтому выбирается он каждый раз
 * заново из того, что реально пришло с сервера: выключенный Lucky Player просто
 * уступает место следующему по ценности.
 */
export function pickGrandPrize(slots: RouletteSlot[] | undefined): RouletteSlot | null {
  if (!slots?.length) return null;
  return slots.reduce((best, slot) => (byValue(slot, best) < 0 ? slot : best));
}

/** Сколько слотов одного вида пускать в витрину. @see rouletteShowcase */
const MAX_PER_KIND = 2;

/**
 * Витрина призов: самые ценные первыми, главный уже показан отдельно.
 *
 * Две причины, по которым это не просто `sort().slice()`:
 *
 *  1. **Порядок — по ценности, а не по таблице.** В конце каталога лежат AP и
 *     лишние спины; лента, набранная сверху вниз, показала бы их вместо
 *     подарков.
 *  2. **Не больше двух слотов одного вида.** Витрина говорит «призов много и
 *     они РАЗНЫЕ», а в живой таблице четыре подарка Telegram подряд — и первый
 *     экран промо выглядел как один приз, напечатанный четыре раза.
 */
export function rouletteShowcase(slots: RouletteSlot[] | undefined, limit: number): RouletteSlot[] {
  if (!slots?.length) return [];
  const grand = pickGrandPrize(slots);
  const ranked = [...slots].filter(slot => slot.key !== grand?.key).sort(byValue);

  const taken = new Map<RouletteSlotKind, number>();
  const picked = ranked.filter(slot => {
    const used = taken.get(slot.kind) ?? 0;
    if (used >= MAX_PER_KIND) return false;
    taken.set(slot.kind, used + 1);
    return true;
  });

  // Видов меньше, чем мест: добираем остатком по ценности, а не оставляем
  // ленту наполовину пустой.
  const rest = ranked.filter(slot => !picked.includes(slot));
  return [...picked, ...rest].slice(0, limit);
}
