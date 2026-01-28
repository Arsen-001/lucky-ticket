import type { TournamentType } from '@/types/types/tournaments.types';

export interface Tournament {
  id: string;
  name: string;
  startTime: string;
  teamSize: number;
  prizePool: number;
  type: TournamentType;
  guaranteedPool: number;
  places?: TournamentPlacesResponse;
}

export interface PersonalTournament extends Tournament {
  participated: boolean;
  participatedTicketsCount?: number;
}

export interface TournamentPlace {
  from: number;
  to?: number;
  percentage: number;
}

export interface TournamentPlacesResponse {
  places: TournamentPlace[];
  guaranteed: TournamentPlace[];
}
