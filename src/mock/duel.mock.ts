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
}

const NAMES = ['Ani', 'Grig', 'Milena', 'Davit', 'Sona', 'Tigran', 'Vahe'];

let tickets = 5;
let current: MockDuel | null = null;

const lobbies: DuelLobby[] = [
  {
    id: 'lobby-grig',
    stake: 1,
    waitingSeconds: 42,
    host: { id: 'u1', name: 'Grig', avatarUrl: '' },
  },
  {
    id: 'lobby-milena',
    stake: 3,
    waitingSeconds: 78,
    host: { id: 'u2', name: 'Milena', avatarUrl: '' },
  },
  {
    id: 'lobby-tigran',
    stake: 2,
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
      duel.status = duel.meReady ? 'WAITING' : 'CANCELLED';
      duel.cancelReason = duel.meReady ? 'guest_not_ready' : 'host_not_ready';
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
    winner: duel.winner,
    winsNeeded: WINS_NEEDED,
  };
}

function fresh(id: string, stake: number, role: 'host' | 'guest'): MockDuel {
  return {
    id,
    stake,
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
  own:
    current && current.status === 'WAITING'
      ? {
          id: current.id,
          stake: current.stake,
          waitingSeconds: Math.floor((Date.now() - current.createdAt) / 1000),
          host: { id: 'me', name: 'Вы', avatarUrl: '' },
        }
      : null,
  lobbies,
});

export const duelMock = {
  'games/duel/lobbies': () => list(),

  'POST games/duel/lobbies': (args: FetchArgs) => {
    const stake = Number((args.body as { stake?: number })?.stake ?? 1);
    current = fresh(`duel-${Date.now()}`, stake, 'host');
    return view(current);
  },

  'POST games/duel/:id/join': (args: FetchArgs) => {
    const id = String(args.url).split('/')[2];
    const lobby = lobbies.find(l => l.id === id);
    current = fresh(id, lobby?.stake ?? 1, 'guest');
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
      fromName: 'Aram',
      fromAvatarUrl: '',
    },
  ],

  'POST games/duel/invites/:id/decline': () => ({ ok: true }),

  'games/duel/invite-candidates': () => [
    { id: 'friend-1', name: 'Aram', avatarUrl: '', reachable: true },
    { id: 'friend-2', name: 'Nare', avatarUrl: '', reachable: true },
    { id: 'friend-3', name: 'Davit', avatarUrl: '', reachable: false },
    { id: 'friend-4', name: 'Lilit', avatarUrl: '', reachable: false },
  ],

  /** Отправка: доходит только до достижимых — «отправлено» ≠ «доставлено». */
  'POST games/duel/:id/invite': (args: FetchArgs) => {
    const ids = ((args.body as { userIds?: string[] })?.userIds ?? []).length;
    const sent = Math.min(ids, 2);
    return { invited: ids, sent, skipped: 0 };
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

  'DELETE games/duel/:id': () => {
    if (current) current.status = 'CANCELLED';
    return { ok: true };
  },

  'games/duel/:id': () => {
    if (!current) throw new Error('no duel');
    return view(advance(current));
  },
};
