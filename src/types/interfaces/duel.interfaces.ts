import type { TicketType } from '@/types/types/ticket.types';

export type DuelMove = 'ROCK' | 'TICKET' | 'SCISSORS';

/** Лига дуэли = тир билета, которым играют. */
export type DuelTier = TicketType;

export type DuelStatus = 'WAITING' | 'READY' | 'PLAYING' | 'FINISHED' | 'CANCELLED';

export type DuelSide = 'HOST' | 'GUEST' | 'DRAW';

/** Почему матч закончился ничем — на это опирается текст модалки. */
export type DuelCancelReason =
  | 'host_cancelled'
  | 'host_not_ready'
  | 'guest_not_ready'
  /** Гость не подтвердил готовность: его место освободили, лобби вернулось в список. */
  | 'guest_dropped'
  | 'not_enough_tickets'
  | 'expired';

export interface DuelOpponent {
  readonly name: string;
  readonly avatarUrl: string;
}

export interface DuelLobby {
  /** Лига стола: каким билетом играют. */
  readonly tier: DuelTier;
  readonly id: string;
  readonly stake: number;
  readonly waitingSeconds: number;
  readonly host: { id: string; name: string; avatarUrl: string };
}

export interface DuelLobbyList {
  /**
   * Незакрытый матч игрока: экран открывает его сразу.
   *
   * Без этого поля игрок, вышедший из приложения посреди матча, возвращался в
   * список, из которого ничего не создать — сервер справедливо отвечал «у вас
   * уже есть дуэль», а куда именно возвращаться, экран не знал.
   */
  readonly active: { readonly id: string; readonly status: DuelStatus } | null;
  readonly stakeMin: number;
  readonly stakeMax: number;
  /**
   * Правила матча — сервер называет их вместе со списком, потому что их правит
   * панель. Экран показывает их игроку до входа и обязан говорить то, что
   * стоит на сервере сейчас, а не то, что было вшито при сборке.
   */
  readonly winsNeeded: number;
  readonly moveSeconds: number;
  readonly readySeconds: number;
  readonly tickets: number;
  /** Билеты по всем лигам: экран ставки рисует их под тирами. */
  readonly balances: Readonly<Record<DuelTier, number>>;
  readonly own: DuelLobby | null;
  readonly lobbies: DuelLobby[];
}

export interface DuelRoundState {
  readonly index: number;
  readonly deadline: string;
  readonly revealed: boolean;
  readonly winner: DuelSide | null;
}

/**
 * Состояние матча глазами одного игрока.
 *
 * `foe.move` приходит только после вскрытия — до него сервер отдаёт лишь
 * `foe.moved`, факт без фигуры.
 */
export interface DuelState {
  readonly id: string;
  readonly status: DuelStatus;
  readonly stake: number;
  /** Лига матча. */
  readonly tier: DuelTier;
  readonly role: 'host' | 'guest';
  readonly cancelReason: DuelCancelReason | null;
  readonly opponent: DuelOpponent | null;
  readonly me: { ready: boolean; wins: number; move: DuelMove | null };
  readonly foe: {
    ready: boolean;
    wins: number;
    moved: boolean;
    move: DuelMove | null;
  };
  readonly round: DuelRoundState | null;
  readonly readyDeadline: string | null;
  /** Сколько лобби уже ждёт соперника. Считает сервер. */
  readonly waitingSeconds: number;
  /**
   * Лобби ждёт ответа на вызов.
   *
   * Пока это так, его нельзя закрывать по уходу с экрана: приглашённый как раз
   * идёт по ссылке, и закрытое лобби встретит его словами «уже занято».
   */
  readonly awaitingInvite: boolean;
  /** Кого именно ждёт приватное лобби. `null` — открытое для всех. */
  readonly invitedName: string | null;
  readonly winner: DuelSide | null;
  readonly winsNeeded: number;
  /** Счёт серии реваншей глазами игрока («вы : соперник»); есть после финала и внутри серии. */
  readonly series: {
    readonly mine: number;
    readonly theirs: number;
    readonly matches: number;
  } | null;
  /** Открытый реванш этой серии: `mine` — открыл я и жду, иначе — зовёт соперник. */
  readonly rematch: { readonly duelId: string; readonly mine: boolean } | null;
  /** Только в ответе на «реванш»: дошёл ли вызов сопернику и почему нет. */
  readonly rematchInvite?: {
    readonly invited: number;
    readonly sent: number;
    readonly refused: number;
    readonly unavailable: number;
    readonly unaffordable: number;
  } | null;
}

/**
 * Кандидат в соперники: тот, кого можно позвать в лобби.
 *
 * `reachable` — не про онлайн, а про доставку: телеграм-бот не может написать
 * первым, и пока человек не разрешил переписку, приглашение до него не дойдёт
 * вообще. Такие строки видны, но не выбираются.
 */
export interface DuelInviteCandidate {
  readonly id: string;
  readonly name: string;
  readonly avatarUrl: string;
  readonly reachable: boolean;
  /** Билетов ЛИГИ СТОЛА на руках: ставка выше — звать бессмысленно. */
  readonly tickets: number;
}

/** Вызов на дуэль, ждущий ответа: его показывает модалка внутри игры. */
export interface DuelInvite {
  readonly id: string;
  readonly duelId: string;
  readonly stake: number;
  /**
   * Лига стола, в который зовут.
   *
   * Без неё окно вызова рисовало бы бронзовый билет над золотой ставкой:
   * «2» за золотым столом и «2» за бронзовым — разные деньги.
   */
  readonly tier: DuelTier;
  readonly fromName: string;
  readonly fromAvatarUrl: string;
  /** Вызов — это реванш в серии: зовём словами «предлагает реванш». */
  readonly rematch?: boolean;
}
