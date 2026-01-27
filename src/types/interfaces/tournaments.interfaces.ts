import type { TournamentType } from '@/types/types/tournaments.types';

export interface Tournament {
  id: string;
  name: string;
  startTime: string;
  teamSize: number;
  prizePool: number;
  type: TournamentType;
  guaranteedPool: number;
}

export interface PersonalTournament extends Tournament {
  participated: boolean;
  participatedTicketsCount?: number;
}
