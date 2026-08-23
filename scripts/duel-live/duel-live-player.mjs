// Второй игрок живого матча на проде: ждёт лобби хозяина, входит, подтверждает готовность, ходит.
// env: TOKEN — Bearer тестового аккаунта, HOST — username хозяина (по умолчанию AK001),
//      MOVES — последовательность ходов через запятую (ROCK,TICKET,SCISSORS), WAIT_MIN — сколько минут ждать лобби.
const API = process.env.API ?? 'https://lucky-ticket-backend-production.up.railway.app';
const TOKEN = process.env.TOKEN;
const HOST = (process.env.HOST ?? 'AK001').toLowerCase();
const HOST_ID = process.env.HOST_ID ?? '';
const MOVES = (process.env.MOVES ?? 'ROCK,TICKET,SCISSORS,TICKET,ROCK,SCISSORS,ROCK,TICKET').split(',');
const WAIT_MIN = Number(process.env.WAIT_MIN ?? 6);
if (!TOKEN) { console.error('TOKEN missing'); process.exit(1); }

const ts = () => new Date().toISOString().slice(11, 23);
const log = (...a) => console.log(ts(), ...a);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function api(method, path, body) {
  const r = await fetch(API + path, { method, headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  let b = null; try { b = await r.json(); } catch {}
  return { status: r.status, body: b };
}

const me = await api('GET', '/me');
log('me:', me.status, me.body?.username, 'duel feature:', me.body?.features?.duel);
let list = await api('GET', '/games/duel/lobbies');
log('lobbies:', list.status, list.body?.message ?? '', 'tickets=', list.body?.tickets, 'active=', JSON.stringify(list.body?.active), 'n=', list.body?.lobbies?.length);
if (list.status !== 200) process.exit(2);

// ── 1. ждём лобби хозяина (или свой незакрытый матч) ─────────────────
let duelId = list.body.active?.id ?? null;
const t0 = Date.now();
while (!duelId && Date.now() - t0 < WAIT_MIN * 60_000) {
  list = await api('GET', '/games/duel/lobbies');
  if (list.body?.active) { duelId = list.body.active.id; log('у меня уже есть матч:', duelId, list.body.active.status); break; }
  // Вызов на дуэль — то, что на телефоне всплывает модалкой: принимаем его входом в это лобби.
  const inv = await api('GET', '/games/duel/invites');
  if (inv.status === 200 && inv.body?.length) {
    const i = inv.body[0];
    log('ВИЖУ ВЫЗОВ от', i.fromName, 'stake', i.stake, 'duel', i.duelId, '→ принимаю (join)');
    const j = await api('POST', `/games/duel/${i.duelId}/join`);
    log('join по вызову:', j.status, j.body?.status ?? j.body?.message);
    if (j.status === 200) { duelId = j.body.id; break; }
  }
  const lobby = process.env.ONLY_INVITE ? null : (list.body?.lobbies ?? []).find(l => l.host?.id === HOST_ID || (l.host?.name ?? '').toLowerCase() === HOST);
  if (lobby) {
    log('вижу лобби хозяина:', lobby.host.name, 'stake', lobby.stake, 'waiting', lobby.waitingSeconds, 's → join');
    const j = await api('POST', `/games/duel/${lobby.id}/join`);
    log('join:', j.status, j.body?.status ?? j.body?.message);
    if (j.status === 200) { duelId = j.body.id; break; }
  }
  if ((Date.now() - t0) % 15_000 < 1000) log('жду лобби…', (list.body?.lobbies ?? []).map(l => `${l.host?.name}:${l.stake}`).join(' ') || '(пусто)');
  await sleep(1000);
}
if (!duelId) { log('лобби хозяина не появилось за', WAIT_MIN, 'мин'); process.exit(3); }

// ── 2. матч: готовность, ходы, вскрытия ──────────────────────────────
let readyPressed = false, moveIdx = 0, lastRound = -1, lastStatus = '', lastRevealIdx = -1, revealSeenAt = 0, maxIdxSeen = -1;
const tStart = Date.now();
while (Date.now() - tStart < 20 * 60_000) {
  const s = await api('GET', `/games/duel/${duelId}`);
  if (s.status !== 200) { log('state', s.status, s.body?.message); await sleep(700); continue; }
  const d = s.body;
  if (d.status !== lastStatus) { log('status →', d.status, d.status === 'READY' ? `foe=${d.opponent?.name} foeReady=${d.foe.ready} deadline=${d.readyDeadline}` : ''); lastStatus = d.status; }
  if (d.status === 'READY' && !readyPressed) {
    const r = await api('POST', `/games/duel/${duelId}/ready`);
    log('ready:', r.status, r.body?.status ?? r.body?.message);
    readyPressed = true;
  }
  if (d.status === 'PLAYING' && d.round) {
    // Контроль паузы и «не того» раунда: вскрытый раунд с индексом меньше уже виденного = показан старый.
    if (d.round.index < maxIdxSeen) log(`!!! STALE ROUND SHOWN: index ${d.round.index} < seen ${maxIdxSeen} (revealed=${d.round.revealed})`);
    maxIdxSeen = Math.max(maxIdxSeen, d.round.index);
    if (d.round.index !== lastRound && !d.round.revealed) {
      if (revealSeenAt) log(`пауза между вскрытием раунда ${lastRevealIdx} и открытием ${d.round.index}: ${((Date.now() - revealSeenAt) / 1000).toFixed(2)} с`);
      lastRound = d.round.index;
      const mv = MOVES[moveIdx++ % MOVES.length];
      const r = await api('POST', `/games/duel/${duelId}/move`, { move: mv });
      log(`round ${d.round.index}: my move ${mv} →`, r.status, r.body?.me?.move ?? r.body?.message, '| foe moved:', r.body?.foe?.moved);
    }
    if (d.round.revealed && d.round.index !== lastRevealIdx) {
      lastRevealIdx = d.round.index; revealSeenAt = Date.now();
      log(`round ${d.round.index} REVEAL: me ${d.me.move} vs foe ${d.foe.move} → ${d.round.winner} | score me ${d.me.wins} : foe ${d.foe.wins}`);
    }
  }
  if (d.status === 'FINISHED') {
    log('FINISHED winner=', d.winner, 'my role=', d.role, d.winner === (d.role === 'host' ? 'HOST' : 'GUEST') ? 'Я ВЫИГРАЛ' : 'я проиграл', 'score', d.me.wins, ':', d.foe.wins, '| серия', JSON.stringify(d.series), '| rematch', JSON.stringify(d.rematch));
    // Реванш: ждём предложение соперника до 90 с (или предлагаем сами, если REMATCH_FIRST) и играем дальше.
    const tF = Date.now(); let next = null;
    if (process.env.REMATCH_FIRST) { const r = await api('POST', `/games/duel/${duelId}/rematch`); log('предложил реванш →', r.status, r.body?.status ?? r.body?.message); if (r.status === 200) next = r.body.id; }
    while (!next && Date.now() - tF < 90_000) {
      const s2 = await api('GET', `/games/duel/${duelId}`);
      if (s2.body?.rematch && !s2.body.rematch.mine) { log('соперник предложил реванш → принимаю'); const r = await api('POST', `/games/duel/${duelId}/rematch`); log('rematch →', r.status, r.body?.status ?? r.body?.message, '| серия', JSON.stringify(r.body?.series)); if (r.status === 200) next = r.body.id; break; }
      await sleep(1000);
    }
    if (!next) { log('реванша не было — выхожу'); break; }
    // новый матч: сбрасываем состояние цикла
    duelId = next; readyPressed = false; lastRound = -1; lastStatus = ''; lastRevealIdx = -1; revealSeenAt = 0; maxIdxSeen = -1;
    continue;
  }
  if (d.status === 'CANCELLED') { log('CANCELLED reason=', d.cancelReason); break; }
  await sleep(450);
}
const after = await api('GET', '/games/duel/lobbies');
log('tickets after:', after.body?.tickets);
