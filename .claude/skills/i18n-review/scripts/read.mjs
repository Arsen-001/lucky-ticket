/**
 * Put English and one or more translations side by side, so they can be READ.
 *
 *   node .claude/skills/i18n-review/scripts/read.mjs de es fr          # the hot set
 *   node .claude/skills/i18n-review/scripts/read.mjs de --slice=short  # every short label
 *   node .claude/skills/i18n-review/scripts/read.mjs de --slice=prose  # sentences
 *   node .claude/skills/i18n-review/scripts/read.mjs de --slice=pairs  # neighbours only
 *   node .claude/skills/i18n-review/scripts/read.mjs de --key=deposit,withdraw
 *
 * Reading is the part no check replaces. Every real defect found so far — school
 * homework for "task" in Persian and Korean, an adverb on a German button, a
 * noun beside a verb on two adjacent buttons — was invisible to every automated
 * rule and obvious on sight.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const load = l => JSON.parse(readFileSync(join('messages', `${l}.json`), 'utf8'));
const en = load('en');

const args = process.argv.slice(2);
const locales = args.filter(a => !a.startsWith('--'));
const slice = (args.find(a => a.startsWith('--slice=')) ?? '').split('=')[1] ?? 'hot';
const only = (args.find(a => a.startsWith('--key=')) ?? '').split('=')[1];

if (!locales.length) {
  const all = readdirSync('messages')
    .filter(f => f.endsWith('.json'))
    .map(f => f.slice(0, -5));
  console.error(`укажи язык. Доступны: ${all.join(' ')}`);
  process.exit(1);
}

/**
 * Strings a player meets on the way through the app, in the order they meet
 * them. Deliberately hand-picked and deliberately small: this is the set worth
 * reading in EVERY language, and a list nobody finishes is worth nothing.
 */
const HOT = [
  'tickets',
  'tournaments tab',
  'home',
  'market',
  'tasks',
  'claim',
  'claim all',
  'buy',
  'join tournament',
  'watch',
  'activate booster',
  'equip chip',
  'send',
  'save',
  'close',
  'retry',
  'something went wrong',
  'insufficient balance',
  'loading',
  'no results',
  'confirm purchase',
  'you save',
  'locked',
  'coming soon',
  'daily',
  'weekly',
  'one-time',
  'streak',
  'claim reward',
  'deposit',
  'withdraw',
  'settings',
  'sign out',
  'all done description',
  'claim modal description',
  'inventory empty',
  'ad ready hint',
  'be the first',
  'no eligible chips',
  'booster activate note',
];

/**
 * Strings the player sees NEXT TO EACH OTHER. This is the highest-yield read of
 * the lot: each of these is fine alone and wrong together — seven locales put a
 * noun on one wallet button and a verb on the one beside it, and no per-string
 * check can see that. Add a pair here whenever a screen puts labels in a row.
 */
const PAIRS = [
  ['deposit', 'withdraw'],
  ['daily', 'weekly', 'one-time'],
  ['min', 'max'],
  ['pin', 'unpin'],
  ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
  ['task', 'category quest'],
  ['tickets', 'tournaments tab', 'home', 'market', 'tasks'],
  ['claim', 'claim all'],
  ['done', 'close', 'retry'],
];

const pick = () => {
  if (only) return [only.split(',').map(k => k.trim())];
  if (slice === 'pairs') return PAIRS;
  if (slice === 'short')
    return [Object.keys(en).filter(k => en[k].length <= 22 && !en[k].includes('{'))];
  if (slice === 'prose')
    return [Object.keys(en).filter(k => en[k].length >= 40 && !en[k].includes('{'))];
  return [HOT];
};

for (const locale of locales) {
  const dict = load(locale);
  console.log(`\n######## ${locale}${slice === 'pairs' ? '  (соседи — сверять часть речи)' : ''}`);
  for (const group of pick()) {
    if (slice === 'pairs' || only) console.log('  ──');
    for (const key of group) {
      if (!(key in en)) continue;
      console.log(`  ${en[key].slice(0, 46).padEnd(46)} → ${dict[key]}`);
    }
  }
}
