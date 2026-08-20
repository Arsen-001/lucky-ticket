export type DuelMove = 'ROCK' | 'TICKET' | 'SCISSORS';

export type DuelStatus = 'WAITING' | 'READY' | 'PLAYING' | 'FINISHED' | 'CANCELLED';

export type DuelSide = 'HOST' | 'GUEST' | 'DRAW';

/** Почему матч закончился ничем — на это опирается текст модалки. */
export type DuelCancelReason =
  | 'host_cancelled'
  | 'host_not_ready'
  | 'guest_not_ready'
  | 'not_enough_tickets'
  | 'expired';

export interface DuelOpponent {
  readonly name: string;
  readonly avatarUrl: string;
}

export interface DuelLobby {
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
  readonly winner: DuelSide | null;
  readonly winsNeeded: number;
}

/**
 * Кандидат в соперники: друг, которого можно позвать в лобби.
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
}

/** Вызов на дуэль, ждущий ответа: его показывает модалка внутри игры. */
export interface DuelInvite {
  readonly id: string;
  readonly duelId: string;
  readonly stake: number;
  readonly fromName: string;
  readonly fromAvatarUrl: string;
}
