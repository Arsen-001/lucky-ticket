import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { TournamentStatus, TournamentType } from '@/types/types/tournaments.types';

export interface TournamentWinner {
  rank: 1 | 2 | 3;
  userId: string;
  username: string;
  avatar?: string;
}

export interface TournamentUserResult {
  /** Final placement; absent means user participated but didn't place. */
  place?: number;
  /** LC awarded to the user. */
  lc: number;
  /** Shards awarded — only for top-3 placements. */
  shards?: number;
}

export interface Tournament {
  id: string;
  name: string;
  startTime: string;
  teamSize: number;
  prizePool: number;
  type: TournamentType;
  shardType: InventoryChipType;
  status: TournamentStatus;
  winners?: TournamentWinner[];
  places?: TournamentPlacesResponse;
}

export interface PersonalTournament extends Tournament {
  participated: boolean;
  participatedTicketsCount?: number;
  /** Present only when status='finished' AND user participated. */
  userResult?: TournamentUserResult;
  /** Whether user has dismissed the result popup. */
  resultSeen?: boolean;
}

export interface TournamentPlace {
  from: number;
  to?: number;
  percentage: number;
}

export interface TournamentPlacesResponse {
  places: TournamentPlace[];
}
