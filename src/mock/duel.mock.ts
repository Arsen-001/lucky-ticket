import type { FetchArgs } from '@reduxjs/toolkit/query';
import type {
  DuelLobby,
  DuelLobbyList,
  DuelMove,
  DuelState,
} from '@/types/interfaces/duel.interfaces';

/**
 * Мок дуэли: полноценный автомат состояний, а не заготовленный ответ.
 *
 * Экран опрашивает состояние каждые полсекунды, и всё интересное здесь —
 * во времени: соперник заходит, подтверждает готовность, ходит с задержкой.
 * Фикстура, отдающая один и тот же кадр, не показала бы ни одного из этих
 * переходов.
 */

const MOVES: DuelMove[] = ['ROCK', 'TICKET', 'SCISSORS'];
const rnd = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const WINS_NEEDED = 2;
const READY_MS = 10_000;
const MOVE_MS = 5_000;
/** В моке массовка подсаживается быстрее прода — иначе dev-проверка тянется полминуты. */
const CROWD_MS = 8_000;

interface MockDuel {
  id: string;
  stake: number;
  tier: DuelState['tier'];
  role: 'host' | 'guest';
  status: DuelState['status'];
  opponent: { name: string; avatarUrl: string } | null;
  createdAt: number;
  readyAt: number | null;
  meReady: boolean;
  foeReady: boolean;
  myWins: number;
  foeWins: number;
  roundIndex: number;
  roundDeadline: number;
  myMove: DuelMove | null;
  foeMove: DuelMove | null;
  foeMovedAt: number | null;
  revealed: boolean;
  roundWinner: 'HOST' | 'GUEST' | 'DRAW' | null;
  winner: 'HOST' | 'GUEST' | null;
  cancelReason: DuelState['cancelReason'];
  /** Итог уже учтён в серии (после «играть ещё»). */
  counted?: boolean;
}

const NAMES = ['Ani', 'Grig', 'Milena', 'Davit', 'Sona', 'Tigran', 'Vahe'];

const balances = { bronze: 17, silver: 6, gold: 4, platinum: 0, diamond: 1 };
let tickets = 5;
let current: MockDuel | null = null;
/** Счёт серии реваншей в моке: считается при каждом «играть ещё». */
const series = { mine: 0, theirs: 0, matches: 0 };

const lobbies: DuelLobby[] = [
  {
    id: 'lobby-grig',
    stake: 1,
    tier: 'bronze',
    waitingSeconds: 42,
    host: { id: 'u1', name: 'Grig', avatarUrl: '' },
  },
  {
    id: 'lobby-milena',
    stake: 3,
    tier: 'gold',
    waitingSeconds: 78,
    host: { id: 'u2', name: 'Milena', avatarUrl: '' },
  },
  {
    id: 'lobby-tigran',
    stake: 2,
    tier: 'silver',
    waitingSeconds: 125,
    host: { id: 'u3', name: 'Tigran', avatarUrl: '' },
  },
];

function openRound(duel: MockDuel) {
  duel.roundIndex += 1;
  duel.roundDeadline = Date.now() + MOVE_MS;
  duel.myMove = null;
  duel.foeMove = rnd(MOVES); // загадан заранее, как на сервере
  duel.foeMovedAt = Date.now() + 800 + Math.random() * 3000;
  duel.revealed = false;
  duel.roundWinner = null;
}

function beats(a: DuelMove, b: DuelMove): 1 | 0 | -1 {
  if (a === b) return 0;
  const table: Record<DuelMove, DuelMove> = {
    ROCK: 'SCISSORS',
    TICKET: 'ROCK',
    SCISSORS: 'TICKET',
  };
  return table[a] === b ? 1 : -1;
}

/** Время двигается здесь же, на чтении — ровно как на бэкенде. */
function advance(duel: MockDuel): MockDuel {
  const now = Date.now();

  if (duel.status === 'WAITING' && now - duel.createdAt >= CROWD_MS) {
    duel.status = 'READY';
    duel.opponent = { name: rnd(NAMES), avatarUrl: '' };
    duel.foeReady = true;
    duel.readyAt = now + READY_MS;
  }

  if (duel.status === 'READY') {
    if (duel.meReady && duel.foeReady) {
      duel.status = 'PLAYING';
      tickets = Math.max(0, tickets - duel.stake);
      duel.readyAt = null;
      openRound(duel);
    } else if (duel.readyAt && now >= duel.readyAt) {
      // Хозяин подтвердил, гость нет — лобби ждёт дальше. Не подтвердил сам
      // игрок: хозяин — лобби закрыто, гость — его место освободили.
      duel.status = duel.meReady ? 'WAITING' : 'CANCELLED';
      duel.cancelReason = duel.meReady
        ? 'guest_not_ready'
        : duel.role === 'guest'
          ? 'guest_dropped'
          : 'host_not_ready';
      duel.meReady = false;
      duel.foeReady = false;
      duel.opponent = null;
      duel.createdAt = now;
      duel.readyAt = null;
    }
  }

  if (duel.status === 'PLAYING' && !duel.revealed) {
    const foeMoved = duel.foeMovedAt !== null && now >= duel.foeMovedAt;
    const expired = now >= duel.roundDeadline;
    if ((duel.myMove && foeMoved) || expired) {
      if (!duel.myMove) duel.myMove = rnd(MOVES);
      const cmp = beats(duel.myMove, duel.foeMove!);
      duel.roundWinner = cmp === 1 ? 'HOST' : cmp === -1 ? 'GUEST' : 'DRAW';
      duel.revealed = true;
      if (cmp === 1) duel.myWins += 1;
      if (cmp === -1) duel.foeWins += 1;

      if (duel.myWins >= WINS_NEEDED || duel.foeWins >= WINS_NEEDED) {
        duel.status = 'FINISHED';
        duel.winner = duel.myWins >= WINS_NEEDED ? 'HOST' : 'GUEST';
        if (duel.winner === 'HOST') tickets += duel.stake * 2;
      } else {
        setTimeout(() => {
          if (current === duel && duel.status === 'PLAYING') openRound(duel);
        }, 1400);
      }
    }
  }

  return duel;
}

function view(duel: MockDuel): DuelState {
  return {
    id: duel.id,
    status: duel.status,
    stake: duel.stake,
    tier: duel.tier,
    role: duel.role,
    cancelReason: duel.cancelReason,
    opponent: duel.opponent,
    me: { ready: duel.meReady, wins: duel.myWins, move: duel.myMove },
    foe: {
      ready: duel.foeReady,
      wins: duel.foeWins,
      moved: duel.foeMovedAt !== null && Date.now() >= duel.foeMovedAt,
      move: duel.revealed ? duel.foeMove : null, // до вскрытия — молчим
    },
    round: {
      index: duel.roundIndex,
      deadline: new Date(duel.roundDeadline).toISOString(),
      revealed: duel.revealed,
      winner: duel.roundWinner,
    },
    readyDeadline: duel.readyAt ? new Date(duel.readyAt).toISOString() : null,
    waitingSeconds: Math.floor((Date.now() - duel.createdAt) / 1000),
    awaitingInvite: false,
    invitedName: null,
    winner: duel.winner,
    winsNeeded: WINS_NEEDED,
    // Итог ТЕКУЩЕГО финала входит в счёт сразу, как на сервере, — иначе после
    // первого матча экран показывал «серия 0 : 0».
    series:
      duel.status === 'FINISHED' || series.matches > 0
        ? (() => {
            const pending = duel.status === 'FINISHED' && !duel.counted;
            return {
              mine: series.mine + (pending && duel.winner === 'HOST' ? 1 : 0),
              theirs: series.theirs + (pending && duel.winner !== 'HOST' ? 1 : 0),
              matches: series.matches + (pending ? 1 : 0),
            };
          })()
        : null,
    rematch: null,
  };
}

function fresh(
  id: string,
  stake: number,
  role: 'host' | 'guest',
  tier: DuelState['tier'] = 'bronze'
): MockDuel {
  return {
    id,
    stake,
    tier,
    role,
    status: role === 'host' ? 'WAITING' : 'READY',
    opponent: role === 'guest' ? { name: rnd(NAMES), avatarUrl: '' } : null,
    createdAt: Date.now(),
    readyAt: role === 'guest' ? Date.now() + READY_MS : null,
    meReady: false,
    foeReady: role === 'guest',
    myWins: 0,
    foeWins: 0,
    roundIndex: -1,
    roundDeadline: 0,
    myMove: null,
    foeMove: null,
    foeMovedAt: null,
    revealed: false,
    roundWinner: null,
    winner: null,
    cancelReason: null,
  };
}

const list = (): DuelLobbyList => ({
  active:
    current && current.status !== 'FINISHED' && current.status !== 'CANCELLED'
      ? { id: current.id, status: current.status }
      : null,
  stakeMin: 1,
  stakeMax: 5,
  winsNeeded: 2,
  moveSeconds: 5,
  readySeconds: 10,
  tickets,
  balances: { ...balances, bronze: tickets },
  own:
    current && current.status === 'WAITING'
      ? {
          id: current.id,
          stake: current.stake,
          waitingSeconds: Math.floor((Date.now() - current.createdAt) / 1000),
          tier: current.tier,
          host: { id: 'me', name: 'Вы', avatarUrl: '' },
        }
      : null,
  lobbies,
});

export const duelMock = {
  'games/duel/lobbies': () => list(),

  'POST games/duel/lobbies': (args: FetchArgs) => {
    const body = args.body as { stake?: number; tier?: DuelState['tier'] };
    const stake = Number(body?.stake ?? 1);
    current = fresh(`duel-${Date.now()}`, stake, 'host', body?.tier ?? 'bronze');
    return view(current);
  },

  'POST games/duel/:id/join': (args: FetchArgs) => {
    const id = String(args.url).split('/')[2];
    const lobby = lobbies.find(l => l.id === id);
    current = fresh(id, lobby?.stake ?? 1, 'guest', lobby?.tier ?? 'bronze');
    if (lobby) current.opponent = { name: lobby.host.name, avatarUrl: '' };
    return view(current);
  },

  /** Кого можно позвать: половина списка «достижима» — как в жизни. */
  /** Входящий вызов: в моке он есть всегда, чтобы модалку было видно. */
  'games/duel/invites': () => [
    {
      id: 'invite-1',
      duelId: lobbies[0]?.id ?? 'duel-mock',
      stake: 2,
      tier: 'bronze' as const,
      fromName: 'Aram',
      fromAvatarUrl: '',
      rematch: false,
    },
  ],

  'POST games/duel/invites/:id/decline': () => ({
    ok: true,
    acceptedElsewhere: false,
    duelId: null,
  }),

  'games/duel/invite-candidates': () => [
    { id: 'friend-1', name: 'Aram', avatarUrl: '', reachable: true, tickets: 9 },
    { id: 'friend-2', name: 'Nare', avatarUrl: '', reachable: true, tickets: 4 },
    { id: 'friend-3', name: 'Davit', avatarUrl: '', reachable: false, tickets: 12 },
    { id: 'friend-4', name: 'Lilit', avatarUrl: '', reachable: false, tickets: 0 },
    // Достижим, но без билетов: ставка любая — серый, «не хватает билетов».
    { id: 'friend-5', name: 'Karen', avatarUrl: '', reachable: true, tickets: 0 },
    // Игроки с доски: их зовут так же, как друзей, и отличить их в списке
    // нельзя — ни полем, ни подписью. Вызов до них доходит всегда.
    { id: 'seed-1', name: 'Narek', avatarUrl: '', reachable: true, tickets: 20 },
    { id: 'seed-2', name: 'Ayse', avatarUrl: '', reachable: true, tickets: 20 },
  ],

  /** Отправка: доходит только до достижимых — «отправлено» ≠ «доставлено». */
  'POST games/duel/:id/invite': (args: FetchArgs) => {
    const ids = ((args.body as { userIds?: string[] })?.userIds ?? []).length;
    const sent = Math.min(ids, 2);
    return { invited: ids, sent, refused: 0, unavailable: 0, unaffordable: 0 };
  },

  'POST games/duel/:id/ready': () => {
    if (!current) throw new Error('no duel');
    current.meReady = true;
    return view(advance(current));
  },

  'POST games/duel/:id/move': (args: FetchArgs) => {
    if (!current) throw new Error('no duel');
    const move = (args.body as { move?: DuelMove })?.move ?? 'ROCK';
    if (!current.myMove) current.myMove = move;
    return view(advance(current));
  },

  /** «Играть ещё»: итог прошлого матча — в серию, соперник садится сразу. */
  'POST games/duel/:id/rematch': () => {
    if (!current) throw new Error('no duel');
    if (current.status === 'FINISHED' && !current.counted) {
      current.counted = true;
      if (current.winner === 'HOST') series.mine += 1;
      else series.theirs += 1;
      series.matches += 1;
    }
    const stake = current.stake;
    const tier = current.tier;
    current = fresh(`duel-${Date.now()}`, stake, 'host', tier);
    current.status = 'READY';
    current.opponent = { name: rnd(NAMES), avatarUrl: '' };
    current.foeReady = true;
    current.readyAt = Date.now() + READY_MS;
    return view(current);
  },

  'DELETE games/duel/:id': () => {
    if (current) current.status = 'CANCELLED';
    return { ok: true };
  },

  'games/duel/:id': () => {
    if (!current) throw new Error('no duel');
    return view(advance(current));
  },
};
