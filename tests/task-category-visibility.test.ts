import { describe, expect, it } from 'vitest';
import { TaskCategory, TaskFrequency } from '@/types/enums/tasks.enums';
import { isCategoryVisibleForFrequency } from '@/utils/global/tasks-claimable.utils';

/**
 * Which categories a frequency tab renders.
 *
 * The predicate hides the chip AND the section, and no other screen lists
 * one-time tasks — so a category hidden here is a task nobody can see or claim.
 * Profile sat in that hole until 19.08.2026: «Pick a nickname», «Connect a TON
 * wallet» and «Make your first deposit» had 0 claims on production not because
 * nobody qualified, but because the app drew no button for them.
 */
describe('isCategoryVisibleForFrequency', () => {
  const every = Object.values(TaskFrequency) as TaskFrequency[];

  it('shows Profile on every tab, one-time included', () => {
    for (const frequency of every)
      expect(isCategoryVisibleForFrequency(TaskCategory.PROFILE, frequency)).toBe(true);
  });

  it('keeps Partners off the one-time tab', () => {
    expect(isCategoryVisibleForFrequency(TaskCategory.PARTNERS, TaskFrequency.ONCE)).toBe(false);
  });

  it('hides every ad surface when the admin switch is off', () => {
    for (const frequency of every)
      expect(isCategoryVisibleForFrequency(TaskCategory.ADS, frequency, false)).toBe(false);
    // Negative control: with ads on, the same call is true — otherwise this
    // test would pass against a predicate that always says false.
    expect(isCategoryVisibleForFrequency(TaskCategory.ADS, TaskFrequency.ONCE, true)).toBe(true);
  });

  it('leaves the rest of the catalog on the one-time tab', () => {
    const hidden = (Object.values(TaskCategory) as TaskCategory[]).filter(
      c => !isCategoryVisibleForFrequency(c, TaskFrequency.ONCE)
    );
    expect(hidden).toEqual([TaskCategory.PARTNERS]);
  });
});
