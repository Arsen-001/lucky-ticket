export type TournamentType = 'bronze' | 'silver' | 'gold' | 'diamond' | 'platinum';

/**
 * `moderation` — a sponsored tournament (§11.8) awaiting review after creation;
 * hidden from the public catalog/home, visible only to its creator until
 * approved to `upcoming`.
 */
export type TournamentStatus = 'upcoming' | 'finished' | 'moderation';
