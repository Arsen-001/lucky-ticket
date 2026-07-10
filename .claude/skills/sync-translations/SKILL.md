---
name: sync-translations
description: Verify that messages/en.json, messages/hy.json, and messages/ru.json have identical key sets, and add missing keys. Use whenever any messages/*.json file is edited, before committing translation changes, or when investigating untranslated UI strings. The app silently renders raw keys when a translation is missing — this skill catches the drift.
---

# sync-translations

Keep `messages/en.json`, `messages/hy.json`, and `messages/ru.json` in lockstep.

## When to use

- After editing any `messages/*.json` file
- When the user adds a new `t('...')` call in JSX
- When the user reports "the UI shows the raw English key in Russian/Armenian"
- Before committing changes that touch translations

## How translations work here

- All three files share the same flat key namespace.
- Keys are full English sentences with optional `{name}` interpolation: `"min length is {num}"`, `"level {from} → {to}"`.
- Code calls `t('key')` via `useAppTranslations()`. Missing keys render as the raw key — **no error, no warning, easy to miss**.

## Steps

1. Read all three message files
2. Compute key-set differences:
   - Keys in `en.json` missing from `hy.json` and/or `ru.json`
   - Keys in `hy.json` or `ru.json` not in `en.json` (likely typos or stale)
3. Report the diff to the user
4. For missing keys:
   - English is canonical — never delete from `en.json`
   - For `hy.json` / `ru.json`, ask the user for the translation OR offer to insert the English string as a placeholder and flag it for human review
5. Verify all three files parse as valid JSON after edits
6. If a key was added but no `t('...')` call exists in `src/`, flag it as potentially dead

## Quick check command

```bash
node -e "
const en = Object.keys(require('./messages/en.json'));
#const hy = Object.keys(require('./messages/hy.json'));
#const ru = Object.keys(require('./messages/ru.json'));
const missing = (target, name) => en.filter(k => !target.includes(k)).map(k => name + ': ' + k);
const extra = (target, name) => target.filter(k => !en.includes(k)).map(k => name + ' (extra): ' + k);
console.log([...missing(hy, 'hy'), ...missing(ru, 'ru'), ...extra(hy, 'hy'), ...extra(ru, 'ru')].join('\n') || 'in sync');
"
```

## Don'ts

- Don't translate LuckyTicket365–specific terms inconsistently (LC, XTR, VIP — keep as-is across locales)
- Don't reorder keys "for tidiness" — diffs become unreadable
- Don't add a key only to `en.json` and call it done
- Don't auto-machine-translate without flagging it for human review
