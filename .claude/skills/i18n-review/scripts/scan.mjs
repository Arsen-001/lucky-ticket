/**
 * Mechanical sweep over `messages/*.json` — everything about a translation that
 * can be checked without reading it.
 *
 *   node .claude/skills/i18n-review/scripts/scan.mjs
 *
 * Every check here earned its place by catching a real defect. What is NOT here
 * earned its absence the same way — see the header of SKILL.md for the four
 * regex checks that produced only false positives and were deleted.
 *
 * Exit code 1 when anything is reported, so it can gate a commit.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from '@formatjs/icu-messageformat-parser';

const DIR = 'messages';
/** Discovered, never typed — a copy of the language list rots. */
const locales = readdirSync(DIR)
  .filter(f => f.endsWith('.json'))
  .map(f => f.slice(0, -5));
const load = l => JSON.parse(readFileSync(join(DIR, `${l}.json`), 'utf8'));
const en = load('en');

/**
 * "Identical to English" is a HINT, never a verdict — and it is reported
 * separately for that reason (see `notes` below, which does not fail the run).
 *
 * Tuning it was the whole lesson. Raw, it reports 143 hits and every one is a
 * real German or Spanish word: Avatar, Collage, April, Bronze, Gold, Status,
 * System, Ticket, Chip, Jackpot. Narrowed to multi-word strings it still reports
 * 43 — including `ru`, which is authored by hand, and that is the tell: a check
 * accusing a language nobody touched is a broken check.
 *
 * What is left after stripping ICU placeholders and brand tokens is the only
 * part a translator would ever have rendered. Three words of it surviving
 * untouched is worth a look. The one true finding this ever produced — the
 * "open in the Telegram app" gate sitting in English in 17 of 18 locales — has
 * four.
 */
const BRANDS =
  /LuckyTicket365|Telegram Premium|Telegram|Tonscan|TON|Lucky Coin|Lucky Stars|Lucky Player|Premium|Stakes?|\bLC\b|\bAP\b|\bLP\b|\bVIP\b/g;
const translatableWords = text =>
  text
    .replace(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, ' ')
    .replace(BRANDS, ' ')
    .split(/[^\p{L}]+/u)
    .filter(w => w.length > 1).length;

const looksUntranslated = (value, source) => value === source && translatableWords(source) >= 3;

/** Objective breakage — fails the run. */
const problems = [];
const note = (locale, key, what) => problems.push(`${locale}/${key}: ${what}`);
/** Judgement calls — printed for a human, never a gate. */
const notes = [];

/** Argument names an ICU message actually takes (plural bodies excluded). */
const argsOf = (ast, out = new Set()) => {
  for (const node of ast) {
    if (node.value && node.type !== 0) out.add(node.value);
    if (node.options) for (const k of Object.keys(node.options)) argsOf(node.options[k].value, out);
  }
  return out;
};

for (const locale of locales) {
  const dict = load(locale);

  // Key parity is `sync-translations`' job, but a missing key breaks every check
  // below with a confusing error, so fail loudly here instead.
  for (const key of Object.keys(en)) if (!(key in dict)) note(locale, key, 'ключа нет');

  for (const [key, value] of Object.entries(dict)) {
    if (!(key in en)) {
      note(locale, key, 'лишний ключ, в английском его нет');
      continue;
    }
    const source = en[key];

    // 1. Still English. Caught the device gate sitting in English in 17 of 18
    //    locales — the FIRST screen a browser visitor sees.
    if (locale !== 'en' && looksUntranslated(value, source))
      notes.push(`${locale}/${key}: ${source.slice(0, 60)}`);

    // 2. Local digit forms. The app renders every runtime counter in Latin
    //    digits, so «۱۰» in a sentence sits next to «3/10» from the same screen.
    //    Persian was the only locale of eighteen doing this — 21 strings.
    if (/[٠-٩۰-۹]/.test(value)) note(locale, key, 'восточные цифры — приложение рисует латинские');
    if (value.includes('٪')) note(locale, key, 'знак ٪ — везде используется %');

    // 3. The brand must survive exactly where the source has it, and as one
    //    unbroken word. @see tests/wordmark.test.ts
    if (source.includes('LuckyTicket365') !== value.includes('LuckyTicket365'))
      note(locale, key, 'бренд LuckyTicket365 не совпадает с оригиналом');

    // 4. ICU has to parse, and has to take the same arguments. This replaced
    //    every regex attempt: a regex cannot tell an argument name from a
    //    single-word plural body (`one {tournament}`).
    let mine;
    try {
      mine = argsOf(parse(value));
    } catch (error) {
      note(locale, key, `ICU не разбирается — ${String(error.message).slice(0, 70)}`);
      continue;
    }
    try {
      for (const arg of argsOf(parse(source)))
        if (!mine.has(arg)) note(locale, key, `потерян аргумент {${arg}}`);
    } catch {
      /* a broken English source is not this locale's problem */
    }
  }
}

if (notes.length) {
  console.log(
    `НА ПРОЧТЕНИЕ (${notes.length}) — фраза совпала с английской, но это может быть намеренно:`
  );
  for (const n of notes.slice(0, 40)) console.log('  ' + n);
  if (notes.length > 40) console.log(`  … и ещё ${notes.length - 40}`);
  console.log('');
}

if (problems.length) {
  console.error(`СЛОМАНО (${problems.length}):`);
  for (const p of problems.slice(0, 60)) console.error('  ' + p);
  if (problems.length > 60) console.error(`  … и ещё ${problems.length - 60}`);
  process.exit(1);
}
console.log(`✅ ${locales.length} языков: ICU, аргументы, цифры, бренд и набор ключей — чисто`);
