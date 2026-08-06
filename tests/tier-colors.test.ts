import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  marketAccentColors,
  rarityColors,
  rarityMarkColors,
  tierAccentColors,
} from '@/constants/tier-colors';
import { AchievementRarity } from '@/types/enums/achievement.enums';

const root = process.cwd();

const sourceFiles = (dir: string): string[] =>
  readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap(entry => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });

const themeCss = () => readFileSync(resolve(root, 'src/styles/global/theme.css'), 'utf8');

/** `--color-x: rgba(1, 2, 3, 1)` → `#010203`. */
const themeHex = (name: string): string => {
  const match = themeCss().match(new RegExp(`--color-${name}:\\s*rgba\\(([^)]+)\\)`));
  if (!match) throw new Error(`--color-${name} is not defined in theme.css`);
  const [r, g, b] = match[1].split(',').map(part => Number(part.trim()));
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
};

describe('tier and rarity palette', () => {
  /**
   * The accent ramp used to exist as seven byte-identical copies. Nothing
   * failed when one was edited and the others were not, which is exactly how
   * the achievements ramp had already drifted apart.
   */
  it('is declared exactly once', () => {
    const offenders = sourceFiles('src').filter(file => {
      if (file.endsWith('constants/tier-colors.ts')) return false;
      const source = readFileSync(resolve(root, file), 'utf8');
      return /bronze:\s*'#E08A3A'/.test(source);
    });
    expect(offenders).toEqual([]);
  });

  it('recognises the shape it forbids', () => {
    // Without this the sweep passes whether the codebase is clean or the
    // pattern simply stopped matching — a green test proving nothing.
    expect(/bronze:\s*'#E08A3A'/.test("  bronze: '#E08A3A',")).toBe(true);
  });

  it('covers every tier', () => {
    expect(Object.keys(tierAccentColors)).toEqual([
      'bronze',
      'silver',
      'gold',
      'platinum',
      'diamond',
    ]);
    for (const value of Object.values(tierAccentColors)) expect(value).toMatch(/^#[0-9A-F]{6}$/i);
  });

  /**
   * Hex, not `var(--…)`: call sites append a two-digit alpha straight onto the
   * value (`${glow}66`), and `var(--x)66` is not a colour.
   */
  it('keeps the tier ramp concatenable', () => {
    for (const value of Object.values(tierAccentColors)) expect(value).not.toContain('var(');
  });

  /**
   * The storefront card read the theme variable while the info sheet hardcoded
   * a lighter #FF4FBE — the same avatar changed shade when you tapped it.
   */
  it('takes the market’s non-tier accents from the theme, not a literal', () => {
    expect(marketAccentColors.pink).toBe('var(--color-electric-pink)');
    expect(marketAccentColors.purple).toBe('var(--color-electric-purple)');
    expect(themeHex('electric-pink')).not.toBe('#FF4FBE');
  });

  it('extends the tier ramp rather than restating it', () => {
    for (const [tier, value] of Object.entries(tierAccentColors)) {
      expect(marketAccentColors[tier as keyof typeof tierAccentColors]).toBe(value);
    }
  });

  /**
   * The mark ramp differs from the card ramp in exactly one entry — a decision
   * (the ladder starts neutral), not the leftovers of a copy that drifted.
   */
  it('differs from the mark ramp only at bronze', () => {
    const differing = Object.keys(rarityColors).filter(
      key => rarityColors[key as AchievementRarity] !== rarityMarkColors[key as AchievementRarity]
    );
    expect(differing).toEqual([AchievementRarity.BRONZE]);
    expect(rarityMarkColors[AchievementRarity.BRONZE]).toBe('#FFFFFF');
  });

  it('has no rarity ramp left inline in a component', () => {
    const offenders = sourceFiles('src').filter(file => {
      if (file.endsWith('constants/tier-colors.ts')) return false;
      return /Record<AchievementRarity, string> = \{/.test(
        readFileSync(resolve(root, file), 'utf8')
      );
    });
    expect(offenders).toEqual([]);
  });
});
