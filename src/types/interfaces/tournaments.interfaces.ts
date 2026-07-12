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
  /**
   * LC from the jackpot drop when this tournament was the secretly-charged
   * one (DOCS §20.3) — shown as a distinct JACKPOT block, separate from `lc`.
   */
  jackpotLc?: number;
}

/**
 * Branding for a sponsored tournament — a real (joinable) tournament funded by
 * an advertiser via the partner portal (DOCS §21). Distinct from a CPC ad
 * campaign: this one shows in the public catalog and players actually join it.
 */
export interface TournamentSponsor {
  /** Advertiser brand name shown on the card. */
  name: string;
  /** Optional brand logo/icon URL — replaces the tier medal on the card. */
  logoUrl?: string;
  /** Optional custom banner image URL — used as the card background when set. */
  bannerUrl?: string;
  /** Optional sponsor destination link. */
  url?: string;
  /** True when the current (demo) user is the advertiser who created it. */
  createdByMe?: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  startTime: string;
  /** Total seats; null = unlimited (∞). */
  teamSize: number | null;
  /** Players joined (real + cosmetic ramp); shown as "joined / capacity". */
  participantsCount?: number;
  prizePool: number;
  type: TournamentType;
  shardType: InventoryChipType;
  /** Per-tournament top-3 shard rewards; null/absent = global default (3/2/1). */
  shardsFirst?: number | null;
  shardsSecond?: number | null;
  shardsThird?: number | null;
  status: TournamentStatus;
  winners?: TournamentWinner[];
  places?: TournamentPlacesResponse;
  /** Present when this tournament is sponsored (created via the partner portal). */
  sponsor?: TournamentSponsor;
}

export interface PersonalTournament extends Tournament {
  participated: boolean;
  participatedTicketsCount?: number;
  /** When the viewer joined — History is ordered by this (newest first). */
  participatedAt?: string;
  /** Present only when status='finished' AND user participated. */
  userResult?: TournamentUserResult;
  /** Whether user has dismissed the result popup. */
  resultSeen?: boolean;
}

/** Payload sent when an advertiser creates a sponsored tournament (DOCS §11.8). */
export interface CreateSponsoredTournamentPayload {
  name: string;
  type: TournamentType;
  /** Prize pool, in LC. */
  prizePool: number;
  /** Total seats. */
  teamSize: number;
  shardType: InventoryChipType;
  /** Day the tournament starts, "YYYY-MM-DD". */
  startDate: string;
  /** Start time of day, "HH:mm" — minutes are :00 or :30. */
  startTime: string;
  /** Advertiser brand shown on the card. */
  sponsorName: string;
  /** Optional brand logo/icon — replaces the tier medal. */
  logoUrl?: string;
  /** Optional custom banner — card background. */
  bannerUrl?: string;
  /** Optional sponsor destination link. */
  sponsorUrl?: string;
}

export interface CreateSponsoredTournamentResponse {
  success: boolean;
  tournament: PersonalTournament;
}

export interface TournamentPlace {
  from: number;
  to?: number;
  percentage: number;
}

export interface TournamentPlacesResponse {
  places: TournamentPlace[];
}
