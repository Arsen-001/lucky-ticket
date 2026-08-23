import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pickGrandPrize, rouletteShowcase } from '@/utils/global/roulette.utils';
import type { RouletteSlot } from '@/types/interfaces/roulette.interfaces';

/**
 * Главный приз рулетки, который печатает промо приглашений.
 *
 * Первая версия выбирала САМЫЙ РЕДКИЙ слот, и на живой таблице это дало
 * «Алмазный билет» (0.5%) вместо недельной подписки Lucky Player (1.1%, 100 ⭐)
 * — то есть приглашение обещало не то, ради чего зовут. Отсюда правило по
 * ценности вида и этот файл.
 */

const slot = (over: Partial<RouletteSlot> & Pick<RouletteSlot, 'key' | 'kind'>): RouletteSlot => ({
  title: over.key,
  emoji: '🎁',
  rarity: 'COMMON',
  amount: 0,
  tier: null,
  chance: 1,
  ...over,
});

describe('главный приз рулетки', () => {
  it('недельная подписка обходит более редкий билет', () => {
    const grand = pickGrandPrize([
      slot({ key: 'ticket-diamond', kind: 'TICKET', rarity: 'EPIC', chance: 0.5 }),
      slot({
        key: 'lucky-player-7d',
        kind: 'LUCKY_PLAYER',
        rarity: 'EPIC',
        chance: 1.1,
        amount: 7,
      }),
    ]);

    expect(grand?.key).toBe('lucky-player-7d');
  });

  it('внутри одного вида дороже тот, что выпадает реже', () => {
    const grand = pickGrandPrize([
      slot({ key: 'gift-heart', kind: 'TELEGRAM_GIFT', chance: 3.2 }),
      slot({ key: 'gift-bear', kind: 'TELEGRAM_GIFT', chance: 1.1 }),
    ]);

    expect(grand?.key).toBe('gift-bear');
  });

  it('выключенный в панели Lucky Player уступает место следующему по ценности', () => {
    // Каталог правится без деплоя — выбор обязан пересчитываться от того, что
    // реально пришло, а не от захардкоженного ключа.
    const grand = pickGrandPrize([
      slot({ key: 'stars-100', kind: 'STARS', amount: 100, chance: 1.1 }),
      slot({ key: 'gift-bear', kind: 'TELEGRAM_GIFT', chance: 1.1 }),
      slot({ key: 'ap-250', kind: 'AP', amount: 250, chance: 7.5 }),
    ]);

    expect(grand?.key).toBe('gift-bear');
  });

  it('скрытые оператором шансы не делают приз главным', () => {
    // `chance: null` значит «не показываем процент», а не «выпадает никогда».
    const grand = pickGrandPrize([
      slot({ key: 'stars-100', kind: 'STARS', amount: 100, chance: null }),
      slot({ key: 'stars-15', kind: 'STARS', amount: 15, chance: 5.4 }),
    ]);

    expect(grand?.key).toBe('stars-15');
  });

  it('пустая или неприехавшая таблица — не приз, а null', () => {
    expect(pickGrandPrize([])).toBeNull();
    expect(pickGrandPrize(undefined)).toBeNull();
  });
});

describe('витрина призов', () => {
  const table: RouletteSlot[] = [
    slot({ key: 'extra-spin', kind: 'EXTRA_SPIN', chance: 3.2 }),
    slot({ key: 'ap-250', kind: 'AP', amount: 250, chance: 7.5 }),
    slot({ key: 'lucky-player-7d', kind: 'LUCKY_PLAYER', chance: 1.1 }),
    slot({ key: 'gift-bear', kind: 'TELEGRAM_GIFT', chance: 1.1 }),
    slot({ key: 'stars-100', kind: 'STARS', amount: 100, chance: 1.1 }),
  ];

  it('главный приз в ленту не попадает — он уже показан крупно', () => {
    expect(rouletteShowcase(table, 4).map(s => s.key)).not.toContain('lucky-player-7d');
  });

  it('лента начинается с дорогого, а не с того, что лежит первым в таблице', () => {
    expect(rouletteShowcase(table, 2).map(s => s.key)).toEqual(['gift-bear', 'stars-100']);
  });

  it('одного вида не больше двух, пока есть чем заполнить ленту', () => {
    // В живой таблице четыре подарка Telegram подряд, и первый экран промо
    // выглядел как один приз, напечатанный четыре раза.
    const showcase = rouletteShowcase(
      [
        ...[1.1, 1.2, 2.2, 3.2].map((chance, i) =>
          slot({ key: `gift-${i}`, kind: 'TELEGRAM_GIFT', chance })
        ),
        slot({ key: 'stars-100', kind: 'STARS', amount: 100, chance: 1.1 }),
        slot({ key: 'stars-50', kind: 'STARS', amount: 50, chance: 2.2 }),
        slot({ key: 'ticket-diamond', kind: 'TICKET', chance: 0.5 }),
        slot({ key: 'ap-250', kind: 'AP', amount: 250, chance: 7.5 }),
      ],
      4
    );

    // gift-0 ушёл в главный приз; из оставшихся трёх подарков в ленту попадают
    // два, остальные места достаются другим видам.
    expect(showcase.filter(s => s.kind === 'TELEGRAM_GIFT')).toHaveLength(2);
    expect(new Set(showcase.map(s => s.kind)).size).toBeGreaterThan(1);
  });

  it('видов меньше, чем мест — лента добирается остатком, а не пустеет', () => {
    // Каталог, где включены только подарки: лимит уступает, иначе в промо
    // окажется две плитки вместо ленты.
    const gifts: RouletteSlot[] = [1.1, 1.2, 2.2, 3.2].map((chance, i) =>
      slot({ key: `gift-${i}`, kind: 'TELEGRAM_GIFT', chance })
    );

    // Один из четырёх — главный приз, в ленте остаются все три остальных.
    expect(rouletteShowcase(gifts, 4)).toHaveLength(3);
  });
});

describe('живая таблица призов из мока', () => {
  it('главным призом остаётся Lucky Player', () => {
    // Фикстура — копия дефолтной серверной таблицы, поэтому она и проверяется:
    // именно на ней правило «самый редкий» выдало билет.
    const source = readFileSync(resolve(process.cwd(), 'src/mock/roulette.mock.ts'), 'utf8');
    const rows = [
      ...source.matchAll(
        /key: '([^']+)',\s*kind: '([^']+)',\s*title: '([^']*)',\s*emoji: '([^']*)',\s*rarity: '([^']+)',\s*amount: (\d+),\s*tier: [^,]+,\s*chance: ([\d.]+|null),/g
      ),
    ].map(
      ([, key, kind, title, emoji, rarity, amount, chance]) =>
        ({
          key,
          kind,
          title,
          emoji,
          rarity,
          amount: Number(amount),
          tier: null,
          chance: chance === 'null' ? null : Number(chance),
        }) as RouletteSlot
    );

    expect(
      rows.length,
      'фикстура должна разбираться — иначе тест ничего не проверяет'
    ).toBeGreaterThan(10);
    expect(pickGrandPrize(rows)?.key).toBe('lucky-player-7d');
  });
});
