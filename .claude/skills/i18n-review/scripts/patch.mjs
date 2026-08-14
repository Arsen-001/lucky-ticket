/**
 * Write translations into `messages/*.json` without disturbing anything else.
 *
 *   node .claude/skills/i18n-review/scripts/patch.mjs edits.json
 *
 * `edits.json` is `{ "<locale>": { "<key>": "<value>", … }, … }`.
 *
 * Why a script rather than an editor:
 *
 *  - **Key order is preserved.** The dictionaries are ordered by hand and a
 *    reorder turns a two-line change into a 1376-line diff that no one can read
 *    and that collides with every other session touching the file.
 *  - **A missing key is refused, not created.** A typo'd key would otherwise add
 *    a dead entry that `sync-translations` then dutifully propagates to all 18.
 *  - **Never `git checkout` a locale file to undo.** Another session's work in
 *    the same file dies with it. Patch forward instead.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const file = process.argv[2];
if (!file) {
  console.error('нужен путь к JSON с правками: { "<локаль>": { "<ключ>": "<строка>" } }');
  process.exit(1);
}

const edits = JSON.parse(readFileSync(file, 'utf8'));
let touched = 0;

for (const [locale, entries] of Object.entries(edits)) {
  const path = join('messages', `${locale}.json`);
  // Plain JSON.parse keeps insertion order for string keys, which is what the
  // dictionaries use — no ordered-map shim needed.
  const dict = JSON.parse(readFileSync(path, 'utf8'));

  for (const [key, value] of Object.entries(entries)) {
    if (!(key in dict)) {
      console.error(`${locale}: ключа «${key}» нет — правка отменена целиком`);
      process.exit(1);
    }
    if (typeof value !== 'string') {
      console.error(`${locale}/${key}: значение должно быть строкой`);
      process.exit(1);
    }
    dict[key] = value;
    touched += 1;
  }

  writeFileSync(path, JSON.stringify(dict, null, 2) + '\n');
  console.log(`${locale}: ${Object.keys(entries).length}`);
}

console.log(`строк записано: ${touched} — дальше prettier и scan.mjs`);
