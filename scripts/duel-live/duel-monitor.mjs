// Монитор живого вызова AK001 → Davit (1303526890): читает базу каждые 1.5 с и пишет ленту событий.
// Плюс пробы посторонним (тестовый аккаунт): приватное лобби не видно в списке и не даёт войти.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { createHmac } from 'node:crypto';
const require = createRequire('/Users/arsen/WebstormProjects/lucky-ticket-backend/package.json');
const { Client } = require('pg');

const S = new URL('.', import.meta.url).pathname;
const DBURL = fs.readFileSync(S + '/.dburl', 'utf8').trim();
const API = 'https://lucky-ticket-backend-production.up.railway.app';
const AK001 = '16eb243f-0025-4fb7-ad22-5e7b7fb42e2d';
const ts = () => new Date().toISOString().slice(11, 23);
const log = (...a) => console.log(ts(), ...a);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// свежий токен тестового аккаунта (доступ протухает за полчаса)
async function loginTest() {
  const env = fs.readFileSync('/Users/arsen/WebstormProjects/lucky-ticket-backend/.env', 'utf8');
  const bot = (env.match(/^TELEGRAM_BOT_TOKEN=["']?([^"'\n]+)/m) || [])[1];
  const p = new URLSearchParams();
  p.set('user', JSON.stringify({ id: 6709953752, username: 'AK00001KA', first_name: '.', is_premium: false }));
  p.set('auth_date', String(Math.floor(Date.now() / 1000)));
  p.set('query_id', 'mon_' + Math.random().toString(36).slice(2, 10));
  const dcs = [...p.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(bot).digest();
  p.set('hash', createHmac('sha256', secret).update(dcs).digest('hex'));
  const r = await fetch(API + '/auth/telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ initData: p.toString() }) });
  const b = await r.json().catch(() => null);
  if (r.status !== 200) throw new Error('login ' + r.status);
  return b.accessToken;
}
let TOKEN = await loginTest();
const api = async (method, path, body) => {
  const r = await fetch(API + path, { method, headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  let b = null; try { b = await r.json(); } catch {}
  return { status: r.status, body: b };
};

const pg = new Client({ connectionString: DBURL, connectionTimeoutMillis: 20000 });
await pg.connect();
log('monitor started; test account logged in');
const start = new Date(Date.now() - 60_000).toISOString(); // строкой в UTC: Date через node-pg уезжает в параметр с местным смещением и сравнивается с timestamp как местное время
let seen = {};
let probed = new Set();
const t0 = Date.now();
while (Date.now() - t0 < 25 * 60_000) {
  try {
    const { rows } = await pg.query(
      `SELECT d.id, d.status, d.stake, d."createdAt", d."updatedAt", d."guestId", d."seedPlayerId", d."hostReady", d."guestReady", d."hostWins", d."guestWins", d.winner, d."cancelReason", d."stakesPaid",
        (SELECT count(*) FROM "DuelRound" r WHERE r."duelId"=d.id) AS rounds,
        (SELECT string_agg(r.index||':'||COALESCE(r."hostMove"::text,'-')||'/'||COALESCE(r."guestMove"::text,'-')||'/'||COALESCE(r.winner::text,'-')||CASE WHEN r."revealedAt" IS NULL THEN '' ELSE 'R' END, ' ' ORDER BY r.index) FROM "DuelRound" r WHERE r."duelId"=d.id) AS rdesc,
        (SELECT string_agg(COALESCE(u.username,'?')||'['||CASE WHEN i."respondedAt" IS NULL THEN 'pending' ELSE (CASE WHEN i.accepted THEN 'accepted' ELSE 'declined' END) END||']', ',') FROM "DuelInvite" i LEFT JOIN "User" u ON u.id=i."toUserId" WHERE i."duelId"=d.id) AS invites,
        g.username AS guest, s.username AS seed
       FROM "Duel" d LEFT JOIN "User" g ON g.id=d."guestId" LEFT JOIN "SeedPlayer" s ON s.id=d."seedPlayerId"
       WHERE d."hostId"=$1 AND d."createdAt" > $2 ORDER BY d."createdAt" DESC LIMIT 3`, [AK001, start]);
    for (const d of rows) {
      const sig = JSON.stringify([d.status, d.guest, d.seed, d.hostReady, d.guestReady, d.hostWins, d.guestWins, d.winner, d.cancelReason, d.rounds, d.rdesc, d.invites]);
      if (seen[d.id] !== sig) {
        seen[d.id] = sig;
        log(`duel ${d.id.slice(0, 8)} ${d.status} stake=${d.stake} guest=${d.guest ?? '-'} seed=${d.seed ?? '-'} ready=${d.hostReady}/${d.guestReady} score=${d.hostWins}:${d.guestWins} winner=${d.winner ?? '-'} cancel=${d.cancelReason ?? '-'} paid=${d.stakesPaid} invites=[${d.invites ?? ''}] rounds=${d.rounds} ${d.rdesc ?? ''}`);
      }
      // Пробы посторонним, пока лобби ждёт и вызов жив
      if (d.status === 'WAITING' && d.invites && d.invites.includes('pending') && !probed.has(d.id)) {
        probed.add(d.id);
        const list = await api('GET', '/games/duel/lobbies');
        if (list.status === 401) { TOKEN = await loginTest(); }
        const l2 = list.status === 401 ? await api('GET', '/games/duel/lobbies') : list;
        const visible = (l2.body?.lobbies ?? []).some(x => x.id === d.id);
        log(`ПРОБА постороннего: лобби в списке чужого = ${visible} (ожидаю false); tickets=${l2.body?.tickets}`);
        const j = await api('POST', `/games/duel/${d.id}/join`);
        log(`ПРОБА постороннего: join → ${j.status} ${j.body?.message ?? j.body?.status} (ожидаю 400 reserved)`);
        const inv = await api('GET', '/games/duel/invites');
        log(`ПРОБА: у постороннего вызовов = ${inv.body?.length ?? '?'} (ожидаю 0)`);
      }
      if (d.status === 'READY' && !probed.has(d.id + ':ready')) {
        probed.add(d.id + ':ready');
        const j = await api('POST', `/games/duel/${d.id}/join`);
        log(`ПРОБА постороннего в READY: join → ${j.status} ${j.body?.message ?? ''} (ожидаю 400 taken)`);
      }
    }
  } catch (e) {
    log('monitor error:', e.message);
    await sleep(3000);
  }
  await sleep(1500);
}
await pg.end();
log('monitor stopped');
