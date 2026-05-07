import type {
  PersonalTournament,
  Tournament,
  TournamentPlacesResponse,
} from '@/types/interfaces/tournaments.interfaces';
import { getRandomNumber } from '@/utils/global/number.utils';

const getTicketsCount = () => getRandomNumber(1, 20);

const getNextOccurrenceAt = (hour: number): string => {
  const next = new Date();
  next.setHours(hour, 0, 0, 0);
  if (next <= new Date()) next.setDate(next.getDate() + 1);
  return next.toISOString();
};

const getMockPlacements = (): TournamentPlacesResponse => ({
  places: [
    { from: 1, percentage: 25 },
    { from: 2, percentage: 18 },
    { from: 3, percentage: 15 },
    { from: 4, to: 5, percentage: 12 },
    { from: 6, to: 10, percentage: 10 },
    { from: 11, to: 20, percentage: 8 },
    { from: 21, to: 50, percentage: 5 },
    { from: 51, to: 100, percentage: 3 },
    { from: 101, to: 200, percentage: 2 },
    { from: 201, to: 500, percentage: 2 },
  ],
});

export const tournaments: PersonalTournament[] = [
  {
    id: '123e4567-e89b-12d3-a456-426655440010',
    name: 'Morning Bronze · 06:00',
    startTime: getNextOccurrenceAt(6),
    teamSize: 64,
    prizePool: 150,
    type: 'bronze',
    places: getMockPlacements(),
    participated: false,
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440011',
    name: 'Afternoon Bronze · 12:00',
    startTime: getNextOccurrenceAt(12),
    teamSize: 128,
    prizePool: 220,
    type: 'bronze',
    places: getMockPlacements(),
    participated: true,
    participatedTicketsCount: getTicketsCount(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440012',
    name: 'Afternoon Silver · 12:00',
    startTime: getNextOccurrenceAt(12),
    teamSize: 96,
    prizePool: 480,
    type: 'silver',
    places: getMockPlacements(),
    participated: false,
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440013',
    name: 'Evening Bronze · 18:00',
    startTime: getNextOccurrenceAt(18),
    teamSize: 256,
    prizePool: 320,
    type: 'bronze',
    places: getMockPlacements(),
    participated: false,
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440014',
    name: 'Evening Gold · 18:00',
    startTime: getNextOccurrenceAt(18),
    teamSize: 64,
    prizePool: 1200,
    type: 'gold',
    places: getMockPlacements(),
    participated: false,
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440015',
    name: 'Evening Platinum · 18:00',
    startTime: getNextOccurrenceAt(18),
    teamSize: 32,
    prizePool: 2400,
    type: 'platinum',
    places: getMockPlacements(),
    participated: false,
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440016',
    name: 'Night Silver · 00:00',
    startTime: getNextOccurrenceAt(0),
    teamSize: 96,
    prizePool: 560,
    type: 'silver',
    places: getMockPlacements(),
    participated: true,
    participatedTicketsCount: getTicketsCount(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440017',
    name: 'Night Diamond · 00:00',
    startTime: getNextOccurrenceAt(0),
    teamSize: 16,
    prizePool: 5000,
    type: 'diamond',
    places: getMockPlacements(),
    participated: false,
  },
];

export const topTournaments: Tournament[] = tournaments.filter(
  tournament => !tournament.participated
);

export const tournamentsMock = { topTournaments, tournaments };
