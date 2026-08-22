// Хозяин: тестовый аккаунт создаёт лобби, зовёт AK001, ждёт входа, жмёт «готов», ходит.
import fs from 'node:fs';
import { createHmac } from 'node:crypto';
const API = 'https://lucky-ticket-backend-production.up.railway.app';
const AK001 = '16eb243f-0025-4fb7-ad22-5e7b7fb42e2d';
const ts = () => new Date().toISOString().slice(11, 23);
const log = (...a) => console.log(ts(), ...a);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const env = fs.readFileSync('/Users/arsen/WebstormProjects/lucky-ticket-backend/.env', 'utf8');
const bot = (env.match(/^TELEGRAM_BOT_TOKEN=["']?([^"'\n]+)/m) || [])[1];
const p = new URLSearchParams();
p.set('user', JSON.stringify({ id: 6709953752, username: 'AK00001KA', first_name: '.', is_premium: false }));
p.set('auth_date', String(Math.floor(Date.now() / 1000)));
p.set('query_id', 'host_' + Math.random().toString(36).slice(2, 10));
const dcs = [...p.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
p.set('hash', createHmac('sha256', createHmac('sha256', 'WebAppData').update(bot).digest()).update(dcs).digest('hex'));
const lr = await fetch(API + '/auth/telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ initData: p.toString() }) });
const TOKEN = (await lr.json()).accessToken; log('login', lr.status);
const api = async (m, path, body) => { const r = await fetch(API + path, { method: m, headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); let b = null; try { b = await r.json(); } catch {} return { status: r.status, body: b }; };

const list = await api('GET', '/games/duel/lobbies'); log('tickets', list.body?.tickets, 'active', JSON.stringify(list.body?.active));
const created = await api('POST', '/games/duel/lobbies', { stake: 1 }); log('create', created.status, created.body?.status ?? created.body?.message);
const id = created.body.id;
const inv = await api('POST', `/games/duel/${id}/invite`, { userIds: [AK001] }); log('invite AK001 →', inv.status, JSON.stringify(inv.body));

let readyPressed = false, lastStatus = '', lastRound = -1, lastReveal = -1, moveIdx = 0; const MOVES = ['TICKET', 'ROCK', 'SCISSORS', 'TICKET', 'ROCK'];
const t0 = Date.now();
while (Date.now() - t0 < 12 * 60_000) {
  const s = await api('GET', `/games/duel/${id}`);
  if (s.status !== 200) { log('state', s.status, s.body?.message); await sleep(800); continue; }
  const d = s.body;
  if (d.status !== lastStatus) { log('status →', d.status, d.status === 'READY' ? `foe=${d.opponent?.name} foeReady=${d.foe.ready}` : d.status === 'WAITING' ? `awaitingInvite=${d.awaitingInvite} invited=${d.invitedName}` : ''); lastStatus = d.status; if (d.status === 'WAITING') readyPressed = false; }
  if (d.status === 'READY' && !readyPressed) { const r = await api('POST', `/games/duel/${id}/ready`); log('ready:', r.status, r.body?.status ?? r.body?.message); readyPressed = true; }
  if (d.status === 'PLAYING' && d.round) {
    if (d.round.index !== lastRound && !d.round.revealed) { lastRound = d.round.index; const mv = MOVES[moveIdx++ % MOVES.length]; const r = await api('POST', `/games/duel/${id}/move`, { move: mv }); log(`round ${d.round.index}: my move ${mv} →`, r.status, r.body?.me?.move ?? r.body?.message, '| foe moved:', r.body?.foe?.moved); }
    if (d.round.revealed && d.round.index !== lastReveal) { lastReveal = d.round.index; log(`round ${d.round.index} REVEAL: me ${d.me.move} vs foe ${d.foe.move} → ${d.round.winner} | ${d.me.wins}:${d.foe.wins}`); }
  }
  if (d.status === 'FINISHED') { log('FINISHED winner=', d.winner, d.winner === 'HOST' ? 'Я ВЫИГРАЛ' : 'я проиграл', `${d.me.wins}:${d.foe.wins}`); break; }
  if (d.status === 'CANCELLED') { log('CANCELLED', d.cancelReason); break; }
  await sleep(500);
}
log('tickets after:', (await api('GET', '/games/duel/lobbies')).body?.tickets);
