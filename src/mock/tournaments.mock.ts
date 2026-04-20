import type {
  PersonalTournament,
  Tournament,
  TournamentPlacesResponse,
} from '@/types/interfaces/tournaments.interfaces';
import { getRandomNumber } from '@/utils/global/number.utils';
import { getRandomUpcomingDate } from '@/utils/global/date.utils';

const getNum = () => getRandomNumber(1, 1000);
const getTicketsCount = () => getRandomNumber(1, 20);
const getStartTime = () => getRandomUpcomingDate(60, 10000);

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
    id: '123e4567-e89b-12d3-a456-426655440006',
    name: 'Golden Clash',
    startTime: getStartTime(),
    teamSize: getNum(),
    prizePool: getNum(),
    type: 'gold',

    places: getMockPlacements(),
    participated: true,
    participatedTicketsCount: getTicketsCount(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440007',
    name: 'Silver Solo Cup',
    startTime: getStartTime(),
    teamSize: getNum(),
    prizePool: getNum(),
    type: 'silver',

    places: getMockPlacements(),
    participated: false,
  },
  {
    id: '123e4567-e89b-12d3-a456-42665544000a',
    name: 'Diamond Blitz',
    startTime: getStartTime(),
    teamSize: getNum(),
    prizePool: getNum(),
    type: 'diamond',

    places: getMockPlacements(),
    participated: false,
  },
  {
    id: '123e4567-e89b-12d3-a456-42665544000b',
    name: 'Everyday Sprint',
    startTime: getStartTime(),
    teamSize: getNum(),
    prizePool: getNum(),
    type: 'bronze',

    places: getMockPlacements(),
    participated: false,
  },
  {
    id: '123e4567-e89b-12d3-a456-42665544000c',
    name: 'Golden Marathon',
    startTime: getStartTime(),
    teamSize: getNum(),
    prizePool: getNum(),
    type: 'gold',

    places: getMockPlacements(),
    participated: false,
  },
  {
    id: '123e4567-e89b-12d3-a456-42665544000d',
    name: 'Silver Showdown',
    startTime: getStartTime(),
    teamSize: getNum(),
    prizePool: getNum(),
    type: 'silver',

    places: getMockPlacements(),
    participated: true,
    participatedTicketsCount: getTicketsCount(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440008',
    name: 'Bronze Rush',
    startTime: getStartTime(),
    teamSize: getNum(),
    prizePool: getNum(),
    type: 'bronze',

    places: getMockPlacements(),
    participated: false,
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440009',
    name: 'Platinum Peaks',
    startTime: getStartTime(),
    teamSize: getNum(),
    prizePool: getNum(),
    type: 'platinum',

    places: getMockPlacements(),
    participated: false,
  },
];

export const topTournaments: Tournament[] = tournaments.filter(
  tournament => !tournament.participated
);

export const tournamentsMock = { topTournaments, tournaments };
