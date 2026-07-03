import type {
  CreateSponsoredTournamentPayload,
  CreateSponsoredTournamentResponse,
  PersonalTournament,
  Tournament,
  TournamentPlacesResponse,
  TournamentWinner,
} from '@/types/interfaces/tournaments.interfaces';
import { images } from '@/constants/images';
import { getRandomNumber } from '@/utils/global/number.utils';
import { mockDb } from '@/mock/backend/db';
import { GlobalConstants, isTournamentTierActivated } from '@/constants/global.constants';
import { applyStatusTournamentJoinApBoost } from '@/utils/global/tournament.utils';
import { computeSponsoredTournamentCost, roundTon } from '@/utils/global/partners.utils';
import { appConfig } from '@/config/app.config';

const fresh = appConfig.account.fresh;

const getTicketsCount = () => getRandomNumber(1, 20);

const getNextOccurrenceAt = (hour: number): string => {
  const next = new Date();
  next.setHours(hour, 0, 0, 0);
  if (next <= new Date()) next.setDate(next.getDate() + 1);
  return next.toISOString();
};

const getHoursAgo = (hours: number): string => {
  const past = new Date();
  past.setTime(past.getTime() - hours * 60 * 60 * 1000);
  return past.toISOString();
};

// Mirrors the real backend contract: exact places come back as `to === from`
// (not an omitted `to`) — keep the mock on the same encoding so divergence
// can't hide UI bugs again.
const getMockPlacements = (): TournamentPlacesResponse => ({
  places: [
    { from: 1, to: 1, percentage: 12 },
    { from: 2, to: 2, percentage: 8 },
    { from: 3, to: 3, percentage: 5 },
    { from: 4, to: 5, percentage: 4 },
    { from: 6, to: 10, percentage: 2 },
    { from: 11, to: 25, percentage: 1 },
    { from: 26, to: 50, percentage: 0.4 },
    { from: 51, to: 100, percentage: 0.2 },
    { from: 101, to: 500, percentage: 0.05 },
  ],
});

const sampleWinners: TournamentWinner[] = [
  { rank: 1, userId: 'user-101', username: 'firetiger', avatar: images.avatar.src },
  { rank: 2, userId: 'user-102', username: 'midnightcat', avatar: images.avatar.src },
  { rank: 3, userId: 'user-103', username: 'sandwave', avatar: images.avatar.src },
];

export const tournaments: PersonalTournament[] = [
  // A sponsored tournament the demo advertiser created via the partner cabinet
  // (DOCS §11.8) — a real joinable tournament that carries advertiser branding.
  // Surfaced first so the example reads.
  {
    id: '123e4567-e89b-12d3-a456-426655440018',
    name: 'Aurora Bet — Player Cup',
    startTime: getNextOccurrenceAt(20),
    teamSize: 128,
    prizePool: 12_000_000,
    type: 'gold',
    shardType: 'speed',
    status: 'upcoming',
    places: getMockPlacements(),
    participated: false,
    sponsor: {
      name: 'Aurora Bet',
      url: 'https://aurorabet.example.com/launch',
      // Brand logo stand-in (local asset) → renders in the medal slot. No
      // bannerUrl, so the card shows the default spiderweb background.
      logoUrl: images.avatar2.src,
      createdByMe: true,
    },
  },
  // A sponsored tournament the demo user created that is still under review
  // (DOCS §11.8) — visible only to its creator (Sponsored tab), not the public.
  {
    id: '123e4567-e89b-12d3-a456-426655440019',
    name: 'Neon Spins — Launch Cup',
    startTime: getNextOccurrenceAt(16),
    teamSize: 64,
    prizePool: 8_000_000,
    type: 'silver',
    shardType: 'capacity',
    status: 'moderation',
    places: getMockPlacements(),
    participated: false,
    sponsor: {
      name: 'Neon Spins',
      url: 'https://neonspins.example.com/launch',
      createdByMe: true,
    },
  },
  // Finished sponsored tournaments the demo advertiser ran — the cabinet's
  // "History" view (DOCS §11.8). Past start times + winners.
  {
    id: '123e4567-e89b-12d3-a456-426655440020',
    name: 'Aurora Bet — Winter Cup',
    startTime: getHoursAgo(48),
    teamSize: 128,
    prizePool: 6_000_000,
    type: 'gold',
    shardType: 'speed',
    status: 'finished',
    winners: sampleWinners,
    places: getMockPlacements(),
    participated: false,
    sponsor: { name: 'Aurora Bet', logoUrl: images.avatar2.src, createdByMe: true },
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440021',
    name: 'Neon Spins — Season 1',
    startTime: getHoursAgo(120),
    teamSize: 64,
    prizePool: 3_000_000,
    type: 'silver',
    shardType: 'capacity',
    status: 'finished',
    winners: sampleWinners,
    places: getMockPlacements(),
    participated: false,
    sponsor: { name: 'Neon Spins', createdByMe: true },
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440022',
    name: 'Aurora Bet — Launch Cup',
    startTime: getHoursAgo(240),
    teamSize: 256,
    prizePool: 9_000_000,
    type: 'platinum',
    shardType: 'speed',
    status: 'finished',
    winners: sampleWinners,
    places: getMockPlacements(),
    participated: false,
    sponsor: { name: 'Aurora Bet', logoUrl: images.avatar2.src, createdByMe: true },
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440023',
    name: 'Spin Palace — Grand Final',
    startTime: getHoursAgo(360),
    teamSize: 96,
    prizePool: 4_500_000,
    type: 'gold',
    shardType: 'capacity',
    status: 'finished',
    winners: sampleWinners,
    places: getMockPlacements(),
    participated: false,
    sponsor: { name: 'Spin Palace', createdByMe: true },
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440024',
    name: 'Neon Spins — Kickoff',
    startTime: getHoursAgo(480),
    teamSize: 64,
    prizePool: 2_000_000,
    type: 'bronze',
    shardType: 'speed',
    status: 'finished',
    winners: sampleWinners,
    places: getMockPlacements(),
    participated: false,
    sponsor: { name: 'Neon Spins', createdByMe: true },
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440025',
    name: 'Aurora Bet — Diamond Cup',
    startTime: getHoursAgo(600),
    teamSize: 32,
    prizePool: 12_000_000,
    type: 'diamond',
    shardType: 'capacity',
    status: 'finished',
    winners: sampleWinners,
    places: getMockPlacements(),
    participated: false,
    sponsor: { name: 'Aurora Bet', logoUrl: images.avatar2.src, createdByMe: true },
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440010',
    name: 'Morning Bronze',
    startTime: getNextOccurrenceAt(6),
    teamSize: 64,
    prizePool: 2_560_000,
    type: 'bronze',
    shardType: 'speed',
    status: 'upcoming',
    places: getMockPlacements(),
    participated: false,
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440011',
    name: 'Afternoon Bronze',
    startTime: getNextOccurrenceAt(12),
    teamSize: 128,
    prizePool: 5_120_000,
    type: 'bronze',
    shardType: 'capacity',
    status: 'upcoming',
    places: getMockPlacements(),
    participated: true,
    participatedTicketsCount: getTicketsCount(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440012',
    name: 'Afternoon Silver',
    startTime: getNextOccurrenceAt(12),
    teamSize: 96,
    prizePool: 9_600_000,
    type: 'silver',
    shardType: 'speed',
    status: 'upcoming',
    places: getMockPlacements(),
    participated: false,
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440013',
    name: 'Evening Bronze',
    startTime: getNextOccurrenceAt(18),
    teamSize: 256,
    prizePool: 10_240_000,
    type: 'bronze',
    shardType: 'speed',
    status: 'upcoming',
    places: getMockPlacements(),
    participated: false,
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440014',
    name: 'Evening Gold',
    startTime: getNextOccurrenceAt(18),
    teamSize: 64,
    prizePool: 16_000_000,
    type: 'gold',
    shardType: 'capacity',
    status: 'upcoming',
    places: getMockPlacements(),
    participated: false,
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440015',
    name: 'Evening Platinum',
    startTime: getNextOccurrenceAt(18),
    teamSize: 32,
    prizePool: 19_200_000,
    type: 'platinum',
    shardType: 'speed',
    status: 'upcoming',
    places: getMockPlacements(),
    participated: false,
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440016',
    name: 'Night Silver',
    startTime: getNextOccurrenceAt(0),
    teamSize: 96,
    prizePool: 9_600_000,
    type: 'silver',
    shardType: 'capacity',
    status: 'upcoming',
    places: getMockPlacements(),
    participated: true,
    participatedTicketsCount: getTicketsCount(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440017',
    name: 'Night Diamond',
    startTime: getNextOccurrenceAt(0),
    teamSize: 16,
    prizePool: 24_000_000,
    type: 'diamond',
    shardType: 'capacity',
    status: 'upcoming',
    places: getMockPlacements(),
    participated: false,
  },

  /* ─── Finished tournaments ─── */
  {
    id: '123e4567-e89b-12d3-a456-426655440030',
    name: 'Morning Gold',
    startTime: getHoursAgo(2),
    teamSize: 64,
    prizePool: 16_000_000,
    type: 'gold',
    shardType: 'speed',
    status: 'finished',
    winners: sampleWinners,
    places: getMockPlacements(),
    participated: true,
    participatedTicketsCount: 12,
    // user took 1st place — top reward (LC + shards)
    userResult: { place: 1, lc: 200_000, shards: 3 },
    resultSeen: false,
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440031',
    name: 'Yesterday Silver',
    startTime: getHoursAgo(20),
    teamSize: 96,
    prizePool: 9_600_000,
    type: 'silver',
    shardType: 'capacity',
    status: 'finished',
    winners: [
      { rank: 1, userId: 'user-201', username: 'shadowfox', avatar: images.avatar.src },
      { rank: 2, userId: 'user-202', username: 'rivermoon', avatar: images.avatar.src },
      { rank: 3, userId: 'user-203', username: 'pixelhawk', avatar: images.avatar.src },
    ],
    places: getMockPlacements(),
    participated: true,
    participatedTicketsCount: 5,
    // user placed 47 — only LC, no shards
    userResult: { place: 47, lc: 24_000 },
    resultSeen: false,
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440032',
    name: 'Yesterday Bronze',
    startTime: getHoursAgo(36),
    teamSize: 128,
    prizePool: 5_120_000,
    type: 'bronze',
    shardType: 'speed',
    status: 'finished',
    winners: [
      { rank: 1, userId: 'user-301', username: 'cloudpilot', avatar: images.avatar.src },
      { rank: 2, userId: 'user-302', username: 'ironleaf', avatar: images.avatar.src },
      { rank: 3, userId: 'user-303', username: 'starlight', avatar: images.avatar.src },
    ],
    places: getMockPlacements(),
    participated: true,
    participatedTicketsCount: 3,
    // user didn't place — got nothing
    userResult: { place: undefined, lc: 0 },
    resultSeen: false,
  },
];

export const topTournaments: Tournament[] = tournaments.filter(
  tournament => tournament.status === 'upcoming' && !tournament.participated
);

/**
 * Tournament-tier activation gate (DOCS §11.2.2): a tier's tournaments are
 * only listed once the platform's active-player count crosses its threshold.
 * The detail endpoint (`tournaments/{id}`) is intentionally NOT gated — a
 * tournament stays reachable by direct link (§11.6); only joining is blocked.
 */
const gateByActivation = <T extends Tournament>(list: T[]): T[] =>
  list.filter(tour => isTournamentTierActivated(tour.type, mockDb.platform.activePlayers));

/* ─── Mutation handlers ─── */

const joinTournament = (args: { body?: unknown }) => {
  const body = (args.body ?? {}) as { tournamentId?: string; ticketsCount?: number };
  const ticketsCount = Math.max(1, body.ticketsCount ?? 1);
  const tournament = tournaments.find(tour => tour.id === body.tournamentId);

  // Entry condition #3 (DOCS §11.3): the tournament tier must be platform-activated.
  if (tournament && !isTournamentTierActivated(tournament.type, mockDb.platform.activePlayers)) {
    return { error: { status: 403, data: 'Tournament tier not yet available' } };
  }

  const participated = (tournament?.participatedTicketsCount ?? 0) + ticketsCount;

  // Joining a tournament grants AP scaled by the tournament's tier — per join,
  // not per ticket (DOCS §5.3 / §11.3). Lucky Player holders get a flat % boost
  // on top of the base value (DOCS §7.3, `luckyPlayerTournamentJoinApBoostPct`).
  // The `me` tag is invalidated after.
  const baseJoinAp = GlobalConstants.apRewards.tournamentJoinByTier[tournament?.type ?? 'bronze'];
  mockDb.user.activityPoints += applyStatusTournamentJoinApBoost(
    baseJoinAp,
    mockDb.user.isLuckyPlayer ?? false,
    mockDb.user.isVIP ?? false
  );

  return {
    participatedTicketsCount: participated,
    remainingTickets: 15 - ticketsCount,
  };
};

const markTournamentResultSeen = () => undefined;

/** Combine a "YYYY-MM-DD" day and "HH:mm" time into the tournament start Date. */
const sponsoredStartFrom = (date?: string, time?: string): Date => {
  const t = time && /^([01]\d|2[0-3]):(00|30)$/.test(time) ? time : '12:00';
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const combined = new Date(`${date}T${t}:00`);
    if (Number.isFinite(combined.getTime())) return combined;
  }
  const [h, m] = t.split(':').map(Number);
  const fallback = new Date();
  fallback.setHours(h, m, 0, 0);
  return fallback;
};

/**
 * Advertiser launches a sponsored tournament (DOCS §11.8). The advertiser TON
 * balance (shared `mockDb.advertiser`) is debited the launch fee + the LC prize
 * pool priced into TON, and the new tournament is unshifted into the catalog so
 * it shows immediately (upcoming) on the tournaments tab + home slider.
 */
const createSponsoredTournament = (args: { body?: unknown }) => {
  const body = (args.body ?? {}) as Partial<CreateSponsoredTournamentPayload>;

  // Recompute the price server-side — the client total is never trusted.
  const cost = computeSponsoredTournamentCost(body.prizePool ?? 0);
  if (mockDb.advertiser.balanceTon < cost.totalTon) {
    return { error: { status: 402, data: 'INSUFFICIENT_FUNDS' } };
  }
  mockDb.advertiser.balanceTon = roundTon(mockDb.advertiser.balanceTon - cost.totalTon);

  const start = sponsoredStartFrom(body.startDate, body.startTime);
  const tournament: PersonalTournament = {
    id: `spt-${Date.now().toString(16)}`,
    name: body.name?.trim() || 'Sponsored tournament',
    startTime: start.toISOString(),
    teamSize: body.teamSize ?? appConfig.partners.sponsoredTournament.defaultTeamSize,
    prizePool: body.prizePool ?? 0,
    type: body.type ?? 'gold',
    shardType: body.shardType === 'capacity' ? 'capacity' : 'speed',
    // Mandatory moderation: a freshly-created sponsored tournament is reviewed
    // before it goes live — hidden from the public catalog/home until approved.
    status: 'moderation',
    places: getMockPlacements(),
    participated: false,
    sponsor: {
      name: body.sponsorName?.trim() || 'Sponsor',
      logoUrl: body.logoUrl?.trim() || undefined,
      bannerUrl: body.bannerUrl?.trim() || undefined,
      url: body.sponsorUrl?.trim() || undefined,
      createdByMe: true,
    },
  };

  tournaments.unshift(tournament);
  const response: CreateSponsoredTournamentResponse = { success: true, tournament };
  return response;
};

/**
 * Approve a sponsored tournament out of moderation (DOCS §11.8). Stands in for
 * the admin review step — flips `moderation` → `upcoming` so it goes public.
 */
const approveSponsoredTournament = (args: { body?: unknown }) => {
  const body = (args.body ?? {}) as { tournamentId?: string };
  const tournament = tournaments.find(
    tour => tour.id === body.tournamentId && tour.status === 'moderation'
  );
  if (tournament) tournament.status = 'upcoming';
  return { success: Boolean(tournament) };
};

// Level-zero view: same upcoming catalog, but the player hasn't joined anything
// and has no results/history. The rich demo (`tournaments`) is untouched.
const freshTournaments: PersonalTournament[] = tournaments.map(tournament => ({
  ...tournament,
  participated: false,
  participatedTicketsCount: 0,
  userResult: undefined,
  resultSeen: undefined,
}));

const servedTournaments = fresh ? freshTournaments : tournaments;

// Sponsored tournaments (DOCS §11.8) are real joinable tournaments that carry
// advertiser branding via a `sponsor` field; the demo seeds several above
// (createdByMe). The partner cabinet only owns the advertiser balance now.

export const tournamentsMock = {
  // `GET tournaments` (gated list) wins over the raw `tournaments` array,
  // which is kept for `tournaments/{id}` + `/places` path traversal.
  'GET tournaments': () => gateByActivation(servedTournaments),
  topTournaments: () =>
    gateByActivation(
      servedTournaments.filter(
        tournament => tournament.status === 'upcoming' && !tournament.participated
      )
    ),
  tournaments: servedTournaments,
  'POST tournaments/join': joinTournament,
  'POST tournaments/result-seen': markTournamentResultSeen,
  'POST tournaments/sponsored': createSponsoredTournament,
  'POST tournaments/approve': approveSponsoredTournament,
};
