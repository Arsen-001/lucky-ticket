#!/usr/bin/env node
/**
 * Two-locale workflow, kept committable.
 *
 * While a feature is still being decided, copy is written by hand in **en and
 * ru only** — translating a string into 18 languages and then changing the
 * wording twice is the same work done three times. But `tests/i18n.test.ts`
 * demands every dictionary hold the exact `en` key set, and the pre-commit hook
 * runs it, so an en+ru-only key cannot be committed at all.
 *
 * This script closes that gap without weakening the guard: every other locale
 * gets the **English string** for the new key (never a raw key on screen, never
 * an empty value, placeholders and brand tokens intact by construction), and
 * the key is written to a ledger so the final translation pass knows exactly
 * what it owes.
 *
 *   node scripts/i18n-draft.mjs          fill the 16 + record what was filled
 *   node scripts/i18n-draft.mjs --list   show what is waiting for translation
 *   node scripts/i18n-draft.mjs --check  exit 1 if anything is waiting
 *   node scripts/i18n-draft.mjs --clear  ledger is settled (after translating)
 *
 * The ledger warns, it does not block: nothing here is wired into the test
 * suite on purpose, because blocking commits is precisely what this avoids.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const messagesDir = resolve(root, 'messages');
const ledgerPath = resolve(root, '.claude/i18n-pending.json');

/** The two written by hand. Everything else is drafted from English. */
const AUTHORED = ['en', 'ru'];

const readJson = path => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);

const locales = readdirSync(messagesDir)
  .filter(name => name.endsWith('.json'))
  .map(name => name.replace(/\.json$/, ''))
  .sort();

const en = readJson(resolve(messagesDir, 'en.json'));
const enKeys = Object.keys(en);

const ledger = existsSync(ledgerPath) ? readJson(ledgerPath) : { keys: [] };

const mode = process.argv[2] ?? '--fill';

if (mode === '--clear') {
  writeJson(ledgerPath, { keys: [] });
  console.log('ledger cleared — every locale counts as translated');
  process.exit(0);
}

if (mode === '--list' || mode === '--check') {
  const ru = readJson(resolve(messagesDir, 'ru.json'));
  if (ledger.keys.length === 0) {
    console.log('nothing pending — all 18 locales are translated');
    process.exit(0);
  }
  console.log(`${ledger.keys.length} key(s) waiting for the final translation pass:\n`);
  for (const key of ledger.keys) {
    console.log(`  ${key}`);
    console.log(`    en: ${en[key] ?? '(gone from en.json)'}`);
    console.log(`    ru: ${ru[key] ?? '(MISSING — write the Russian first)'}`);
  }
  process.exit(mode === '--check' ? 1 : 0);
}

// --fill
const missingInRu = enKeys.filter(key => !(key in readJson(resolve(messagesDir, 'ru.json'))));
if (missingInRu.length > 0) {
  console.error('ru.json is missing keys — Russian is authored by hand, not drafted:');
  for (const key of missingInRu) console.error(`  ${key}  →  ${en[key]}`);
  process.exit(1);
}

const drafted = new Set(ledger.keys);
let filled = 0;

for (const locale of locales) {
  if (AUTHORED.includes(locale)) continue;

  const path = resolve(messagesDir, `${locale}.json`);
  const dict = readJson(path);
  const missing = enKeys.filter(key => !(key in dict));
  if (missing.length === 0) continue;

  // Insert each missing key next to the neighbour it has in en.json, so the
  // diff stays local instead of reordering a 1376-key file.
  const next = {};
  const pending = new Set(missing);
  for (const key of Object.keys(dict)) {
    next[key] = dict[key];
    const at = enKeys.indexOf(key);
    for (let i = at + 1; i < enKeys.length && pending.has(enKeys[i]); i += 1) {
      next[enKeys[i]] = en[enKeys[i]];
      pending.delete(enKeys[i]);
    }
  }
  for (const key of missing) if (pending.has(key)) next[key] = en[key];

  writeJson(path, next);
  missing.forEach(key => drafted.add(key));
  filled += missing.length;
  console.log(`${locale}: ${missing.length} key(s) drafted from English`);
}

// A key that no longer exists in en.json is not owed a translation any more.
writeJson(ledgerPath, { keys: [...drafted].filter(key => key in en).sort() });

console.log(
  filled === 0
    ? 'every locale already has the full key set'
    : `\n${filled} draft value(s) written — ${drafted.size} key(s) now waiting for translation`
);
