/** Which barrel the app draws. The panel owns this — all three are built. */
export type RouletteStyle = 'WHEEL' | 'TAPE' | 'GRID';

/** How the prize is painted. Nothing about its value rides on this. */
export type RouletteRarity = 'COMMON' | 'RARE' | 'EPIC';

export type RouletteSlotKind =
  | 'LC'
  | 'AP'
  | 'STARS'
  | 'TICKET'
  | 'LUCKY_PLAYER'
  | 'TELEGRAM_GIFT'
  | 'EXTRA_SPIN'
  | 'AD_VIEWS'
  | 'ITEM';

/**
 * Where a won prize stands. Everything except a Telegram gift arrives
 * `GRANTED` — it was credited in the same transaction that recorded the spin.
 * A gift is `PENDING` until an admin sends it from the panel.
 */
export type RouletteSpinStatus = 'GRANTED' | 'PENDING' | 'SENT' | 'REJECTED' | 'FAILED';

/** One prize as the wheel shows it. Never carries a weight or a cost. */
export interface RouletteSlot {
  key: string;
  kind: RouletteSlotKind;
  title: string;
  emoji: string;
  rarity: RouletteRarity;
  amount: number;
  tier: string | null;
  /**
   * Percent, one decimal — or `null` when the operator has the odds hidden.
   * Read from the same table the server draws from, so what the screen promises
   * and what it pays cannot disagree.
   */
  chance: number | null;
}

/** A prize this player has already won. */
export interface RoulettePrize {
  id: string;
  slotKey: string;
  kind: RouletteSlotKind;
  title: string;
  emoji: string;
  rarity: RouletteRarity;
  amount: number;
  status: RouletteSpinStatus;
  createdAt: string;
}

/**
 * `GET /games/roulette` — everything the invite screen needs to draw the game,
 * or `available: false`, which means draw nothing at all.
 *
 * `available` is false for three different reasons and deliberately does not
 * say which: the game is off, or this player already took the pre-launch gift,
 * or there is no session. All three end the same way for the screen.
 */
export interface RouletteState {
  available: boolean;
  style: RouletteStyle;
  friendsPerSpin: number;
  /** Qualifying friends right now — in the channel, bot not blocked. */
  friends: number;
  spinsAvailable: number;
  spinsUsed: number;
  /** Friends still to bring for the next spin. Zero when one is waiting. */
  friendsToNextSpin: number;
  slots: RouletteSlot[];
  /** The server's own answer to "would pressing this work right now". */
  canSpin: boolean;
  /** Why not, when it is not simply «не набрал». @see RouletteBlockedBy */
  blockedBy: RouletteBlockedBy;
  history: RoulettePrize[];
}

export type RouletteBlockedBy = 'budget' | 'limit' | 'cap' | null;

/**
 * `POST /games/roulette/spin` — the prize is ALREADY decided and granted when
 * this arrives. The barrel animates toward it; it does not choose it.
 */
export interface RouletteSpinResult {
  prize: RoulettePrize;
  state: RouletteState;
}
