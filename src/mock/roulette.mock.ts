import type {
  RoulettePrize,
  RouletteSlot,
  RouletteSpinResult,
  RouletteState,
} from '@/types/interfaces/roulette.interfaces';

/**
 * The prize table, as the server would publish it — weights already turned
 * into percentages, costs stripped out.
 *
 * Deliberately the shipped default table, not a prettier one: a fixture
 * authored to look good validates nothing about how 28 rows behave in a
 * barrel 340px wide.
 */
const slots: RouletteSlot[] = [
  {
    key: 'lucky-player-7d',
    kind: 'LUCKY_PLAYER',
    title: 'Lucky Player · 7 дней',
    emoji: '👑',
    rarity: 'EPIC',
    amount: 7,
    tier: null,
    chance: 1.1,
  },
  {
    key: 'stars-100',
    kind: 'STARS',
    title: '100 звёзд',
    emoji: '⭐',
    rarity: 'EPIC',
    amount: 100,
    tier: null,
    chance: 1.1,
  },
  {
    key: 'gift-bear',
    kind: 'TELEGRAM_GIFT',
    title: 'Подарок Telegram · 50 ⭐',
    emoji: '🧸',
    rarity: 'EPIC',
    amount: 0,
    tier: null,
    chance: 1.1,
  },
  {
    key: 'gift-cake',
    kind: 'TELEGRAM_GIFT',
    title: 'Подарок Telegram · 50 ⭐',
    emoji: '🎂',
    rarity: 'EPIC',
    amount: 0,
    tier: null,
    chance: 1.1,
  },
  {
    key: 'gift-rose',
    kind: 'TELEGRAM_GIFT',
    title: 'Подарок Telegram · 25 ⭐',
    emoji: '🌹',
    rarity: 'EPIC',
    amount: 0,
    tier: null,
    chance: 2.2,
  },
  {
    key: 'gift-heart',
    kind: 'TELEGRAM_GIFT',
    title: 'Подарок Telegram · 15 ⭐',
    emoji: '💝',
    rarity: 'EPIC',
    amount: 0,
    tier: null,
    chance: 3.2,
  },
  {
    key: 'ticket-diamond',
    kind: 'TICKET',
    title: 'Алмазный билет',
    emoji: '💎',
    rarity: 'EPIC',
    amount: 1,
    tier: 'DIAMOND',
    chance: 0.5,
  },
  {
    key: 'stars-50',
    kind: 'STARS',
    title: '50 звёзд',
    emoji: '⭐',
    rarity: 'RARE',
    amount: 50,
    tier: null,
    chance: 2.2,
  },
  {
    key: 'stars-25',
    kind: 'STARS',
    title: '25 звёзд',
    emoji: '⭐',
    rarity: 'RARE',
    amount: 25,
    tier: null,
    chance: 3.2,
  },
  {
    key: 'ticket-platinum',
    kind: 'TICKET',
    title: 'Платиновый билет',
    emoji: '🎟️',
    rarity: 'RARE',
    amount: 1,
    tier: 'PLATINUM',
    chance: 1.6,
  },
  {
    key: 'ticket-gold',
    kind: 'TICKET',
    title: 'Золотой билет',
    emoji: '🎫',
    rarity: 'RARE',
    amount: 1,
    tier: 'GOLD',
    chance: 2.7,
  },
  {
    key: 'lc-1m',
    kind: 'LC',
    title: '1 000 000 LC',
    emoji: '💰',
    rarity: 'RARE',
    amount: 1_000_000,
    tier: null,
    chance: 1.6,
  },
  {
    key: 'lc-250k',
    kind: 'LC',
    title: '250 000 LC',
    emoji: '💰',
    rarity: 'RARE',
    amount: 250_000,
    tier: null,
    chance: 3.2,
  },
  {
    key: 'stars-15',
    kind: 'STARS',
    title: '15 звёзд',
    emoji: '⭐',
    rarity: 'COMMON',
    amount: 15,
    tier: null,
    chance: 5.4,
  },
  {
    key: 'ticket-silver',
    kind: 'TICKET',
    title: 'Серебряный билет',
    emoji: '🎟️',
    rarity: 'COMMON',
    amount: 1,
    tier: 'SILVER',
    chance: 4.3,
  },
  {
    key: 'ticket-bronze-3',
    kind: 'TICKET',
    title: '3 бронзовых билета',
    emoji: '🎟️',
    rarity: 'COMMON',
    amount: 3,
    tier: 'BRONZE',
    chance: 6.5,
  },
  {
    key: 'lc-100k',
    kind: 'LC',
    title: '100 000 LC',
    emoji: '💰',
    rarity: 'COMMON',
    amount: 100_000,
    tier: null,
    chance: 5.4,
  },
  {
    key: 'lc-50k',
    kind: 'LC',
    title: '50 000 LC',
    emoji: '💰',
    rarity: 'COMMON',
    amount: 50_000,
    tier: null,
    chance: 6.5,
  },
  {
    key: 'lc-10k',
    kind: 'LC',
    title: '10 000 LC',
    emoji: '💰',
    rarity: 'COMMON',
    amount: 10_000,
    tier: null,
    chance: 8.1,
  },
  {
    key: 'ap-1000',
    kind: 'AP',
    title: '1000 AP',
    emoji: '⚡',
    rarity: 'COMMON',
    amount: 1000,
    tier: null,
    chance: 4.3,
  },
  {
    key: 'ap-500',
    kind: 'AP',
    title: '500 AP',
    emoji: '⚡',
    rarity: 'COMMON',
    amount: 500,
    tier: null,
    chance: 6.5,
  },
  {
    key: 'ap-250',
    kind: 'AP',
    title: '250 AP',
    emoji: '⚡',
    rarity: 'COMMON',
    amount: 250,
    tier: null,
    chance: 7.5,
  },
  {
    key: 'extra-spin',
    kind: 'EXTRA_SPIN',
    title: 'Ещё один спин',
    emoji: '🎰',
    rarity: 'COMMON',
    amount: 1,
    tier: null,
    chance: 3.2,
  },
];

/**
 * Mutable so the dev screen behaves like the real one: a spin here actually
 * spends a spin and lands in the history, instead of the button doing nothing
 * visible and the state snapping back on the next read.
 */
const state: RouletteState = {
  // On mocks the game is ON — the whole point of the fixture is being able to
  // look at it. The real default is off, and the panel is what opens it.
  available: true,
  style: 'TAPE',
  friendsPerSpin: 10,
  friends: 23,
  spinsAvailable: 2,
  spinsUsed: 0,
  friendsToNextSpin: 0,
  slots,
  canSpin: true,
  blockedBy: null,
  history: [],
};

/** Weighted the same way the server draws, so the demo's odds are the shown ones. */
function draw(): RouletteSlot {
  const total = slots.reduce((sum, slot) => sum + (slot.chance ?? 0), 0);
  let roll = Math.random() * total;
  for (const slot of slots) {
    roll -= slot.chance ?? 0;
    if (roll <= 0) return slot;
  }
  return slots[slots.length - 1];
}

function spin(): RouletteSpinResult {
  const slot = draw();
  const prize: RoulettePrize = {
    id: `spin-${state.spinsUsed + 1}`,
    slotKey: slot.key,
    kind: slot.kind,
    title: slot.title,
    emoji: slot.emoji,
    rarity: slot.rarity,
    amount: slot.amount,
    // Exactly the server's rule: a Telegram gift waits for a human, everything
    // else is already on the balance.
    status: slot.kind === 'TELEGRAM_GIFT' ? 'PENDING' : 'GRANTED',
    createdAt: new Date().toISOString(),
  };

  state.spinsUsed += 1;
  state.spinsAvailable = Math.max(
    0,
    state.spinsAvailable - 1 + (slot.kind === 'EXTRA_SPIN' ? 1 : 0)
  );
  state.canSpin = state.spinsAvailable > 0;
  state.friendsToNextSpin = state.spinsAvailable > 0 ? 0 : 4;
  // Newest first, and a fresh array each time: the fixture is served straight
  // into RTK Query, which freezes what it hands out.
  state.history = [prize, ...state.history];

  return { prize, state: { ...state, history: [...state.history] } };
}

export const rouletteMock = {
  'games/roulette': () => ({ ...state, history: [...state.history] }),
  'POST games/roulette/spin': () => spin(),
};
