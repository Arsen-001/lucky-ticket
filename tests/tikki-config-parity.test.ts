import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import {
  tikkiAwayDays,
  tikkiBaseRate,
  tikkiBuyPaybackDays,
  tikkiLevelPaybackDays,
  tikkiMaxHours,
  tikkiMaxLevel,
  tikkiMergeSize,
  tikkiMergeStepUp,
  tikkiStartHours,
  tikkiTapMinPresses,
  tikkiTierMultiplier,
  tikkiVisitHours,
  tikkiWindowPriceSpan,
} from '@/components/shared/tikki/tikki.constants';

/**
 * Экономику Тикки считает СЕРВЕР, но его числа скопированы сюда руками — мок,
 * предпросмотр сплава и подписи на экране считаются этими копиями. Пока они
 * совпадают, локальная разработка показывает ту же игру, что и прод; разойдутся
 * — экран будет обещать одно, а сервер списывать другое, и ни один тест по
 * отдельности этого не заметит: обе стороны останутся «правильными».
 *
 * Сверялось вручную 05.09.2026 прогоном формул с обеих сторон (сошлось до
 * рубля). Это то же самое, но каждый раз.
 *
 * Требует бэкенд рядом; иначе тест пропускается — как и `enum-parity`.
 */

const root = process.cwd();
const backendPath = resolve(root, '../lucky-ticket-backend/src/common/economy.constants.ts');
const hasBackend = existsSync(backendPath);

/**
 * Достаёт объект `TIKKI_CONFIG_DEFAULTS` из исходника бэкенда.
 *
 * Именно текстом, а не импортом: файл тянет за собой пол-бэкенда (Prisma,
 * конфиги), и тест, который на этом падает, проверяет сборку соседнего репо, а
 * не числа. Здесь нужен один литерал — его и берём.
 */
function readBackendDefaults(): Record<string, unknown> {
  const source = readFileSync(backendPath, 'utf8');
  const start = source.indexOf('TIKKI_CONFIG_DEFAULTS: TikkiConfigData = {');
  expect(start, 'TIKKI_CONFIG_DEFAULTS не найден в бэкенде').toBeGreaterThan(-1);
  const open = source.indexOf('{', start);

  let depth = 0;
  let end = open;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  const literal = source
    .slice(open, end + 1)
    .replace(/\/\/[^\n]*/g, '') // комментарии строкой
    .replace(/\/\*[\s\S]*?\*\//g, '') // комментарии блоком
    .replace(/(\d)_(\d)/g, '$1$2') // 25_000 → 25000
    .replace(/([{,]\s*)([A-Za-z][A-Za-z0-9]*)\s*:/g, '$1"$2":') // ключи в кавычки
    .replace(/'/g, '"')
    .replace(/,(\s*[}\]])/g, '$1'); // висящая запятая

  return JSON.parse(literal) as Record<string, unknown>;
}

describe.skipIf(!hasBackend)('Тикки: числа фронта и бэкенда — одни и те же', () => {
  // Тело describe Vitest выполняет при сборе тестов и для ПРОПУЩЕННОГО набора
  // тоже — только сами `it` не запускает. Читать файл здесь без проверки нельзя:
  // на CI бэкенда рядом нет, и ENOENT при сборе валил весь джоб юнит-тестов
  // (06.09.2026), хотя набор формально был пропущен.
  const backend = hasBackend ? readBackendDefaults() : {};

  const SCALARS: [string, number][] = [
    ['baseRatePerHour', tikkiBaseRate],
    ['startHours', tikkiStartHours],
    ['maxHours', tikkiMaxHours],
    ['windowPriceSpanHours', tikkiWindowPriceSpan],
    ['maxLevel', tikkiMaxLevel],
    ['mergeSize', tikkiMergeSize],
    ['tapMinPresses', tikkiTapMinPresses],
    ['awayDays', tikkiAwayDays],
    ['levelPaybackDays', tikkiLevelPaybackDays],
    ['buyPaybackDays', tikkiBuyPaybackDays],
  ];

  it.each(SCALARS)('%s совпадает', (key, mine) => {
    expect(backend[key], `${key} разошёлся`).toBe(mine);
  });

  it('привычки заходов те же — от них считается дневной доход', () => {
    expect(backend.visitHours).toEqual([...tikkiVisitHours]);
  });

  it('ступень тира та же — на ней стоит вся лестница цен', () => {
    expect(backend.tierMultiplier).toEqual({
      BRONZE: tikkiTierMultiplier[TicketsEnum.BRONZE],
      SILVER: tikkiTierMultiplier[TicketsEnum.SILVER],
      GOLD: tikkiTierMultiplier[TicketsEnum.GOLD],
      PLATINUM: tikkiTierMultiplier[TicketsEnum.PLATINUM],
      DIAMOND: tikkiTierMultiplier[TicketsEnum.DIAMOND],
    });
  });

  it('надбавка за сплав та же — единственный процент во всей механике', () => {
    expect(backend.mergeStepUpPercent).toEqual({
      BRONZE: tikkiMergeStepUp[TicketsEnum.BRONZE],
      SILVER: tikkiMergeStepUp[TicketsEnum.SILVER],
      GOLD: tikkiMergeStepUp[TicketsEnum.GOLD],
      PLATINUM: tikkiMergeStepUp[TicketsEnum.PLATINUM],
      DIAMOND: tikkiMergeStepUp[TicketsEnum.DIAMOND],
    });
  });

  it('база цены тапа та же', () => {
    // На фронте она живёт литералом внутри `tikkiTapCost`, а не именованной
    // константой — сверяем с формулой, иначе эта цифра единственная из всех
    // осталась бы без присмотра.
    const utils = readFileSync(resolve(root, 'src/components/shared/tikki/tikki.utils.ts'), 'utf8');
    expect(utils).toContain(`(${String(backend.tapPriceBase)} - unit.tapLevel / tikkiMaxLevel)`);
  });
});
