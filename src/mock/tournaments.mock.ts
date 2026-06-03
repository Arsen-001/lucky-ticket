import type {
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

const getMockPlacements = (): TournamentPlacesResponse => ({
  places: [
    { from: 1, percentage: 12 },
    { from: 2, percentage: 8 },
    { from: 3, percentage: 5 },
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

export const tournamentsMock = {
  // `GET tournaments` (gated list) wins over the raw `tournaments` array,
  // which is kept for `tournaments/{id}` + `/places` path traversal.
  'GET tournaments': () => gateByActivation(tournaments),
  topTournaments: () => gateByActivation(topTournaments),
  tournaments,
  'POST tournaments/join': joinTournament,
  'POST tournaments/result-seen': markTournamentResultSeen,
};
