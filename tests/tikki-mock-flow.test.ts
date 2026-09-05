import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import type { TikkiState } from '@/types/interfaces/tikki.interfaces';
import { tikkiMock } from '@/mock/tikki.mock';
import { mockDb } from '@/mock/backend/db';

/**
 * Мок Тикки — тот бэкенд, на котором механику смотрят локально и по которому
 * ходит e2e. Числа у него общие с экраном, а вот ДЕНЬГИ он обязан двигать сам:
 * начислять за тап, списывать за прокачку и отказывать, когда не хватает.
 *
 * Проверяется именно это, а не формулы (их держит `tikki-economy.test.ts`):
 * мок, который всегда соглашается, показывает экран, которого не существует, —
 * ровно та ловушка, что уже случилась с маркетом.
 *
 * Время заморожено. Кликер наполняется от часов, и на живых часах «взял ровно
 * пять» превращается в «взял пять и ещё капельку»: тест либо мигает, либо
 * написан так широко, что перестаёт что-либо ловить.
 */

const call = (url: string, body?: unknown) => tikkiMock[url]({ url, body } as never) as TikkiState;

const state = () => call('tikki');
const selected = (s: TikkiState) => s.units.find(u => u.selected) ?? s.units[0];

/** Часы идут только вперёд: у мока состояние общее на весь файл. */
let clock = Date.UTC(2026, 8, 1);

describe('мок Тикки двигает настоящий баланс', () => {
  beforeEach(() => {
    clock += 24 * 3_600_000;
    vi.useFakeTimers();
    vi.setSystemTime(clock);
    // Догнать время ДО того, как выставлен баланс: пассив за сутки иначе
    // упал бы сверху и все разницы поехали бы.
    state();
    mockDb.user.coins = 1_000_000;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('первый бронзовый выдаётся сам и приезжает с ценами', () => {
    const s = state();
    expect(s.units.length).toBeGreaterThan(0);
    expect(selected(s).cost.clicker).toBe(6_716);
    expect(s.config.buyPaybackDays).toBe(395);
  });

  it('за два часа кликер набирает свои 50, и тап уносит ровно пять', () => {
    // Сутки простоя в beforeEach уже набили кликер доверху — сливаем, чтобы
    // считать именно эти два часа.
    const drained = selected(state());
    call('tikki/tap', { unitId: drained.id, count: 10_000 });
    vi.setSystemTime(clock + 2 * 3_600_000);

    const unit = selected(state());
    expect(unit.fill).toBe(50); // 25 LC/ч × 2 ч
    const before = mockDb.user.coins;

    const after = call('tikki/tap', { unitId: unit.id, count: 5 });

    expect(mockDb.user.coins - before).toBe(5 * unit.tapValue);
    expect(selected(after).fill).toBe(45);
    expect(after.balance).toBe(mockDb.user.coins);
  });

  it('из пустого кликера тап не печатает ничего', () => {
    const unit = selected(state());
    expect(selected(call('tikki/tap', { unitId: unit.id, count: 10_000 })).fill).toBe(0);

    const before = mockDb.user.coins;
    call('tikki/tap', { unitId: unit.id, count: 50 });

    expect(mockDb.user.coins).toBe(before);
  });

  it('прокачка списывает свою цену', () => {
    const unit = selected(state());
    const price = unit.cost.clicker!;
    const before = mockDb.user.coins;

    const after = call('tikki/upgrade', { unitId: unit.id, kind: 'clicker' });

    expect(mockDb.user.coins).toBe(before - price);
    expect(selected(after).level).toBe(unit.level + 1);
  });

  it('денег не хватает — мок отказывает, а не выдаёт покупку даром', () => {
    mockDb.user.coins = 10;
    const unit = selected(state());

    expect(() => call('tikki/upgrade', { unitId: unit.id, kind: 'passive' })).toThrow();
    expect(mockDb.user.coins).toBe(10);
  });

  it('покупка тира стоит ровно свою цену', () => {
    const s = state();
    const price = s.buyCost[TicketsEnum.BRONZE];
    const before = mockDb.user.coins;
    const had = s.units.length;

    const after = call('tikki/buy', { tier: TicketsEnum.BRONZE });

    expect(mockDb.user.coins).toBe(before - price);
    expect(after.units).toHaveLength(had + 1);
  });

  it('сплав съедает отмеченных и рождает следующий тир', () => {
    mockDb.user.coins = 10_000_000;
    while (state().units.filter(u => u.tier === TicketsEnum.BRONZE).length < 4)
      call('tikki/buy', { tier: TicketsEnum.BRONZE });

    const before = state();
    const bronze = before.units.filter(u => u.tier === TicketsEnum.BRONZE).slice(0, 4);
    const cost = before.merge.costByTier[TicketsEnum.BRONZE];
    const coins = mockDb.user.coins;

    const after = call('tikki/merge', { unitIds: bronze.map(u => u.id) });

    expect(mockDb.user.coins).toBe(coins - cost);
    expect(after.units.filter(u => bronze.some(b => b.id === u.id))).toHaveLength(0);
    expect(after.units.some(u => u.tier === TicketsEnum.SILVER)).toBe(true);
  });
});
