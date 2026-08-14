---
name: i18n-review
description: Review translation QUALITY across messages/*.json — read the strings, find mistranslations, wrong register, inconsistent game terms and locale-specific digit forms, then patch them safely. Use when translations were added or reworded, when a language "looks bad", or when finishing a feature whose copy is now settled. Companion to sync-translations, which only checks that key SETS match — this one checks that what the keys say is right.
---

# i18n-review

`sync-translations` answers "does every dictionary have the same keys". This one
answers "does what they say make sense". Different failure, different method:
that one is a set comparison, this one ends in reading.

**Do not ask which languages ship or which layers exist — read them.** Every
list in this file is discovered at runtime; the decisions below are already made
and need no confirmation.

---

## Decisions already taken — do not re-open

| Question                              | Answer                                                                                                                                                                   | Where it is enforced                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Which languages?                      | Whatever `messages/*.json` contains — **list the folder**                                                                                                                | `tests/i18n.test.ts`                                                        |
| FAQ, Privacy, Terms                   | **English only.** User's call 14.08.2026, and it includes removing the ru/hy/de that predated it                                                                         | `tests/faq-i18n.test.ts` guards that each article has exactly one key, `en` |
| Copy still being reworded?            | Hand-write **en + ru only**; the other 16 take an English draft via `npm run i18n:draft`, recorded in `.claude/i18n-pending.json`                                        | the ledger warns, never blocks                                              |
| When is the final pass due?           | When wording is settled: `npm run i18n:draft -- --list` → translate exactly those → `-- --clear`                                                                         | —                                                                           |
| Digits                                | **Latin everywhere**, `%` never `٪` — the app renders every runtime counter in Latin, so a local numeral in prose collides with the counter beside it                    | `scan.mjs`                                                                  |
| Brand                                 | `LuckyTicket365`, one unbroken word, present exactly where English has it                                                                                                | `tests/wordmark.test.ts`, `scan.mjs`                                        |
| Register (ты/вы, -ください, tú/usted) | **Already established per language. Read a neighbour and match it — never invent one.** A whole-app register change is a brand-voice decision, not this skill's business | —                                                                           |

---

## The run

### 1. Sweep what a machine can see

```bash
node .claude/skills/i18n-review/scripts/scan.mjs
```

Two sections, and the split matters:

- **СЛОМАНО** — ICU that will not parse, a lost argument, a local numeral, a
  brand that appeared or vanished, a key that drifted. Objective. Exits 1.
- **НА ПРОЧТЕНИЕ** — a phrase identical to English. A hint, never a verdict, so
  it never fails the run.

That second section is the reason to trust the first. Untuned, "identical to
English" reports **143** hits and every one is a real word in that language
(Avatar, Collage, April, Bronze, Status, Ticket). Narrowed to multi-word strings
it still reports 43, `ru` among them — and `ru` is written by hand, which is the
tell. Only after stripping ICU placeholders and brand tokens and requiring three
surviving words does it settle at one, a genuine German product term. Keep it
that quiet: a section that cries wolf trains you to skip the section beside it.

Fix everything under СЛОМАНО before reading — it is cheap and it distorts the
reading. All four gate checks are verified by breaking them on purpose.

### 2. Read, in this order

```bash
node .claude/skills/i18n-review/scripts/read.mjs <locale…> --slice=pairs   # first
node .claude/skills/i18n-review/scripts/read.mjs <locale…>                 # hot path
node .claude/skills/i18n-review/scripts/read.mjs <locale…> --slice=short
node .claude/skills/i18n-review/scripts/read.mjs <locale…> --slice=prose
```

**`--slice=pairs` first, always.** It prints the strings a player sees _next to
each other_, and that is where the defects no rule can catch live. Seven locales
put a noun on one wallet button and a verb on the button beside it
(`Depósito`/`Retirar`, `Yatırma`/`Çek`, `Поповнення`/`Вивести`). Each string was
correct alone; the pair was wrong. When a screen puts labels in a row, add that
row to `PAIRS` in `read.mjs`.

What to look for, in yield order:

1. **A word from the wrong domain.** The commonest real defect by far. `تکلیف`
   (fa) and `과제` (ko) both mean _school homework_ — used for the game's daily
   tasks in 22 strings each. Check the game nouns against how the language's own
   games talk: task, quest, engine, shard, chip, booster, stake, tier.
2. **Wrong part of speech on a control.** German `retry` was `Erneut` — the
   adverb "again", not a button. Every other locale had a verb there.
3. **A term rendered two ways.** One noun, one word, everywhere. Check the core
   set; they are consistent today, so any split is new.
4. **Register drift inside one language** — formal and informal in the same
   dictionary.
5. **A figure that changed or vanished.** `scan.mjs` cannot see this (it only
   guards ICU arguments); a number written into prose is prose.

### 3. Patch

Write a JSON of edits and apply it:

```bash
node .claude/skills/i18n-review/scripts/patch.mjs /tmp/edits.json
npx prettier -w 'messages/*.json'
node .claude/skills/i18n-review/scripts/scan.mjs
```

Never hand-edit a dictionary in an editor and **never `git checkout` one to
undo**: key order shifts turn a two-line change into a 1376-line diff, and a
checkout kills whatever another session had in that file. Patch forward.

**Morphology is not search-and-replace.** Swapping a term means writing the
forms out:

- Persian ezafe and possessive — `تکالیف هفتگی` → `مأموریت‌های هفتگی`,
  `تکالیفت` → `مأموریت‌هایت`
- Korean particles follow the final consonant, and a swap can change it
  (`과제` ends in a vowel, `미션` in a consonant) — `과제로`→`미션으로`,
  `과제를`→`미션을`, `과제가`→`미션이`, `과제와`→`미션과`
- Turkic vowel harmony, Slavic case, German compounds (`Einstiegsticket`)

Order the rules longest-first so the specific ones win.

### 4. Prove it

```bash
npm test                                                    # parity + guards
NEXT_PUBLIC_API_URL= npm run dev                            # mock layer, or you measure the QR wall
npx playwright test e2e/locale-layout.spec.ts               # 320px, clipping, RTL
```

`locale-layout` is not optional when a label got **longer** — `Erneut versuchen`
for `Erneut`, `Depositar` for `Depósito`. It checks the narrowest supported
width, which is where a translation runs out of room.

For a language whose script you cannot judge from source, take a screenshot:
cookie `locale=<code>` on `localhost:3000`, wait for `[data-testid="app-shell"]`
(without it you are photographing the pre-launch gate), then hide the mock's
gift/win modals — they cover every screen and `Escape` does not close them.

### 5. Ship

```bash
git commit -F <msg> -- messages/de.json messages/ko.json …   # explicit paths only
git push origin main && npm run deploy:slice
```

Explicit paths are not a style preference here: a wide sweep is exactly when
another session's uncommitted work hides in the diff.

---

## The other five surfaces

`messages/` is the Mini App only. A language is not done until all of these are,
and each has a different owner:

| Surface           | File                                               | Note                                                                                                                                  |
| ----------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Task catalog      | `backend: src/tasks/milestones.i18n.data.ts`       | Overlay by id. `seedCatalog` only **creates** — a running backfill writes a language only when it is missing or byte-equal to English |
| Bot chat          | `backend: src/telegram/bot-message-catalog.ts`     | **Code is the default, the DB holds panel edits, and the edit wins.** A message edited in the panel ignores this file                 |
| Notification feed | `backend: src/notifications/notification-copy.ts`  | —                                                                                                                                     |
| Achievements      | `backend: src/achievements/series-names.i18n.ts`   | Badges are a **projection** of the milestone catalog — read `localizedMilestoneTasks()`, not the raw one                              |
| Landing           | `lucky-ticket-landing: src/i18n/locales/<code>.ts` | `ru.ts` defines the shape; a forgotten key is a compile error. OG cards ask the font's cmap first — satori cannot shape Arabic        |

⚠️ **These use the OPPOSITE case**: `Locale` is a Prisma enum, so the keys are
`EN`, `DE`, `AR` — grepping for `de:` finds nothing and looks like a gap.
Adding or removing a language touches 42 files across four repos —
read `DOCS/ADDING_A_LANGUAGE.md` first.

---

## Four checks that were tried and deleted

All four flagged locales that had not been touched — including English and
Russian. **That is the tell: when a check accuses a language you never edited,
the check is wrong, not the language.**

1. `\{(\w+)` for placeholder parity — cannot tell an argument from a one-word
   plural body (`one {tournament}`). Use the ICU parser; it is already a
   dependency.
2. "Brand missing" without checking the English source first — flags every
   locale on strings whose source never had the brand.
3. `\bterm\b` for "is this word translated" — blind to German compounds
   (`Ticketmenge`), derived verbs (`staken`) and agglutinative suffixes
   (`chipini`).
4. Counting _distinct whole strings_ containing a term as "different
   translations of the term" — measures sentences, not the noun. Compare the
   noun.

And one that is not a check at all: **an exclusion may not rest on the property
it hides.** `e2e/locale-layout.spec.ts` skipped the drawer as "parked off-screen
while closed" — which was the very fact worth testing, and it was false in RTL.
249 checks ran green over a panel covering every page. If something is excluded
as "closed", assert the closedness separately.
