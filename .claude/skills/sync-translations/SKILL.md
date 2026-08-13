---
name: sync-translations
description: Verify that every messages/*.json dictionary has an identical key set to en.json, and add missing keys. Use whenever any messages/*.json file is edited, before committing translation changes, or when investigating untranslated UI strings. The app silently renders raw keys when a translation is missing — this skill catches the drift.
---

# sync-translations

Keep every dictionary in `messages/` in lockstep with `en.json`.

## The language list is read, never typed

This file used to name the locales (`en`, `hy`, `ru`, `de`). That is a copy of
the list, and copies rot: it went on naming `hy.json` after that file was gone,
so the quick-check command below threw instead of checking anything, and it
would have quietly skipped any language added since.

**Always discover the dictionaries by listing the folder.** Same rule as
`tests/i18n.test.ts`, which reads `messages/` for exactly this reason.

```bash
ls messages/*.json
```

## When to use

- After editing any `messages/*.json` file
- When the user adds a new `t('...')` call in JSX
- When the user reports "the UI shows the raw English key" in some language
- Before committing changes that touch translations

## How translations work here

- Every file shares the same flat key namespace.
- Keys are full English sentences with optional `{name}` interpolation:
  `"min length is {num}"`, `"level {from} → {to}"`.
- Code calls `t('key')` via `useAppTranslations()`. A missing key renders as the
  raw key — **no error, no warning, easy to miss**.
- A dictionary existing is not the same as the language being selectable. The
  live list is `locales` in `src/i18n/config.ts`; a language stays out of it
  until its file is complete, and `tests/i18n.test.ts` fails if one is promoted
  early. **Never add a code to `locales` to "make it show up" while its
  dictionary is still partial** — that is precisely how raw keys reach players.

## Steps

1. List `messages/*.json` and read every file found
2. Compute key-set differences against `en.json`:
   - Keys in `en.json` missing from any other file
   - Keys in another file that are not in `en.json` (typos or stale leftovers)
3. Report the diff to the user
4. For missing keys:
   - English is canonical — never delete from `en.json`
   - Either ask the user for the translation, or insert the English string as a
     placeholder and flag it explicitly for human review
5. Verify every file still parses as valid JSON after edits
6. If a key was added but no `t('...')` call exists in `src/`, flag it as
   potentially dead — but check for runtime-built keys first (see below)

## Quick check command

```bash
node -e "
const fs = require('fs');
const en = Object.keys(require('./messages/en.json'));
const locales = fs.readdirSync('./messages').filter(f => f.endsWith('.json')).map(f => f.replace(/\.json\$/, '')).filter(l => l !== 'en');
const report = locales.flatMap(name => {
  const keys = Object.keys(require('./messages/' + name + '.json'));
  return [
    ...en.filter(k => !keys.includes(k)).map(k => name + ' missing: ' + k),
    ...keys.filter(k => !en.includes(k)).map(k => name + ' extra:   ' + k),
  ];
});
console.log(report.join('\n') || 'in sync (' + locales.length + ' locales vs en)');
"
```

## Don'ts

- Don't hardcode the locale list anywhere — list the folder
- Don't translate LuckyTicket365-specific terms inconsistently (LC, XTR, VIP —
  keep as-is across locales)
- Don't reorder keys "for tidiness" — diffs become unreadable, and this tree is
  often shared with another session editing the same files
- Don't add a key only to `en.json` and call it done
- Don't auto-machine-translate without flagging it for human review
- Don't delete a key just because `grep` finds no `t('key')` for it. Several
  families are built at runtime (`t(\`${tier} ticket\`)`, month names, status
perk rows) and are invisible to a source scan — `tests/i18n.test.ts`
  enumerates them for this reason. Five keys were already lost this way once.
