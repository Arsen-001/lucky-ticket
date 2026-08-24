import { useRouter } from 'next/navigation';
import { Crown, Sparkles, Star, User } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { VerifiedSparkleIcon } from '@/components/shared/icons/VerifiedSparkleIcon';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { VipIcon } from '@/components/shared/icons/VipIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';
import { routes } from '@/constants/routes';
import type { QuickCardPlayer } from '@/components/shared/user-elements/PlayerQuickCard';
import type { CSSProperties, ReactNode } from 'react';
import '@/styles/components/leaderboard-podium.css';
import { PlayerPhoto } from '@/components/shared/user-elements/PlayerPhoto';

export type PodiumRank = 1 | 2 | 3 | 4 | 5;

export interface PodiumPlayer {
  rank: PodiumRank;
  username: string;
  points: number;
  avatarUrl?: string;
  fallbackInitial?: string;
  isVerified?: boolean;
  isLuckyPlayer?: boolean;
  isVIP?: boolean;
  /** Optional element rendered next to the points badge (e.g., a tier-specific reward chip). */
  extra?: ReactNode;
  /** Identity fields — when set, the avatar opens the shared player quick-card. */
  id?: string;
  liked?: boolean;
  likesReceived?: number;
}

export interface LeaderboardPodiumProps {
  players?: PodiumPlayer[];
  loading?: boolean;
  className?: string;
  /** Render only top-N slots (3 = top-3 only, hides ranks 4 and 5). Defaults to 5. */
  maxRank?: 3 | 5;
  /** Falling background animation variant. */
  confettiVariant?: 'pieces' | 'stars';
  /** When set, overrides per-piece random colors with a single color (used for star variant). */
  confettiColor?: string;
  /** Tapping a podium avatar opens the shared player quick-card. */
  onOpenCard?: (player: QuickCardPlayer) => void;
  /** The viewer's own id — their podium avatar stays non-interactive. */
  meId?: string;
}

interface RankTheme {
  outerGradient: string;
  ringGradient: string;
  haloColor: string;
  glow: string;
  pulseColor: string;
  badgeBg: string;
  badgeText: string;
  pointsGradient: string;
  accentTextClass: string;
}

const RANK_THEME: Record<PodiumRank, RankTheme> = {
  1: {
    outerGradient: 'conic-gradient(from 0deg, #FFE08A, #F8BD3E, #FFFFFF, #B47B0A, #FFE08A)',
    ringGradient: 'linear-gradient(180deg, #FFE08A 0%, #F8BD3E 50%, #B47B0A 100%)',
    haloColor: 'rgba(248,189,62,0.55)',
    glow: '0 0 40px rgba(248,189,62,0.6), 0 0 12px rgba(255,224,138,0.7) inset',
    pulseColor: 'rgba(248,189,62,0.45)',
    badgeBg: '#F8BD3E',
    badgeText: '#1B192A',
    pointsGradient: 'linear-gradient(180deg, #FFE08A 0%, #F8BD3E 60%, #B47B0A 100%)',
    accentTextClass: 'text-gold',
  },
  2: {
    outerGradient: 'conic-gradient(from 0deg, #E6E6E6, #C0C0C0, #FFFFFF, #6F6F6F, #E6E6E6)',
    ringGradient: 'linear-gradient(180deg, #E6E6E6 0%, #C0C0C0 50%, #6F6F6F 100%)',
    haloColor: 'rgba(216,216,216,0.4)',
    glow: '0 0 24px rgba(216,216,216,0.4)',
    pulseColor: 'rgba(216,216,216,0.35)',
    badgeBg: '#A8AAA4',
    badgeText: '#1B192A',
    pointsGradient: 'linear-gradient(180deg, #F4F4F4 0%, #C0C0C0 60%, #6F6F6F 100%)',
    accentTextClass: 'text-white-secondary',
  },
  3: {
    outerGradient: 'conic-gradient(from 0deg, #E08A3A, #AC6122, #FFD2A0, #6B3A11, #E08A3A)',
    ringGradient: 'linear-gradient(180deg, #E08A3A 0%, #AC6122 50%, #6B3A11 100%)',
    haloColor: 'rgba(172,97,34,0.55)',
    glow: '0 0 24px rgba(172,97,34,0.5)',
    pulseColor: 'rgba(172,97,34,0.4)',
    badgeBg: '#AC6122',
    badgeText: '#FFE8C9',
    pointsGradient: 'linear-gradient(180deg, #FFD2A0 0%, #E08A3A 60%, #6B3A11 100%)',
    accentTextClass: 'text-bronze',
  },
  4: {
    outerGradient: 'conic-gradient(from 0deg, #FF7BD7, #DE009B, #FFFFFF, #6E0150, #FF7BD7)',
    ringGradient: 'linear-gradient(180deg, #FF7BD7 0%, #DE009B 50%, #6E0150 100%)',
    haloColor: 'rgba(222,0,155,0.5)',
    glow: '0 0 18px rgba(222,0,155,0.4)',
    pulseColor: 'rgba(222,0,155,0.35)',
    badgeBg: '#DE009B',
    badgeText: '#FFFFFF',
    pointsGradient: 'linear-gradient(180deg, #FF7BD7 0%, #DE009B 60%, #6E0150 100%)',
    accentTextClass: 'text-electric-pink',
  },
  5: {
    outerGradient: 'conic-gradient(from 0deg, #B49AF8, #743DF5, #FFFFFF, #2E0F86, #B49AF8)',
    ringGradient: 'linear-gradient(180deg, #B49AF8 0%, #743DF5 50%, #2E0F86 100%)',
    haloColor: 'rgba(116,61,245,0.5)',
    glow: '0 0 18px rgba(116,61,245,0.4)',
    pulseColor: 'rgba(116,61,245,0.35)',
    badgeBg: '#743DF5',
    badgeText: '#FFFFFF',
    pointsGradient: 'linear-gradient(180deg, #B49AF8 0%, #743DF5 60%, #2E0F86 100%)',
    accentTextClass: 'text-electric-purple',
  },
};

const AVATAR_SIZE: Record<PodiumRank, number> = { 1: 124, 2: 70, 3: 70, 4: 56, 5: 56 };
const REVEAL_DELAY_MS: Record<PodiumRank, number> = {
  1: 320,
  2: 240,
  3: 160,
  4: 80,
  5: 0,
};

const SPARKLE_POSITIONS: { x: string; y: string; delay: number; size: number }[] = [
  { x: '8%', y: '14%', delay: 0, size: 12 },
  { x: '92%', y: '20%', delay: 0.4, size: 10 },
  { x: '14%', y: '70%', delay: 0.8, size: 14 },
  { x: '88%', y: '74%', delay: 1.2, size: 12 },
  { x: '50%', y: '6%', delay: 0.2, size: 10 },
  { x: '50%', y: '92%', delay: 1.0, size: 16 },
];

const CONFETTI_PIECES = Array.from({ length: 12 }).map((_, i) => {
  const left = `${(i * 8.4 + 4) % 100}%`;
  const colors = ['#F8BD3E', '#DE009B', '#743DF5', '#3FD9CF', '#E08A3A'];
  const color = colors[i % colors.length];
  const size = 6 + (i % 3) * 2;
  const duration = 5 + ((i * 7) % 4);
  const delay = (i * 0.6) % 4.5;
  const drift = (i % 2 === 0 ? 1 : -1) * (12 + (i % 3) * 6);
  return { id: i, left, color, size, duration, delay, drift };
});

export function LeaderboardPodium({
  players,
  loading,
  className,
  maxRank = 5,
  confettiVariant = 'pieces',
  confettiColor,
  onOpenCard,
  meId,
}: LeaderboardPodiumProps) {
  const t = useAppTranslations();
  const playersByRank = new Map<PodiumRank, PodiumPlayer>();
  players?.forEach(player => playersByRank.set(player.rank, player));
  const isTop3Only = maxRank === 3;

  return (
    <section
      aria-label={t('top {n}', { n: maxRank })}
      className={twMerge(
        'relative overflow-hidden',
        isTop3Only ? 'h-[300px]' : 'h-[360px]',
        className
      )}
    >
      <ConfettiLayer variant={confettiVariant} uniformColor={confettiColor} />

      <div className="absolute inset-0 px-4 pt-2">
        {!isTop3Only && (
          <>
            <PodiumSlot
              rank={4}
              player={playersByRank.get(4)}
              loading={loading}
              onOpenCard={onOpenCard}
              meId={meId}
              className="absolute bottom-3 start-2"
            />
            <PodiumSlot
              rank={5}
              player={playersByRank.get(5)}
              loading={loading}
              onOpenCard={onOpenCard}
              meId={meId}
              className="absolute bottom-3 end-2"
            />
          </>
        )}
        <PodiumSlot
          rank={2}
          player={playersByRank.get(2)}
          loading={loading}
          onOpenCard={onOpenCard}
          meId={meId}
          className={twMerge('absolute', isTop3Only ? 'start-3 bottom-6' : 'start-1 top-6')}
        />
        <PodiumSlot
          rank={3}
          player={playersByRank.get(3)}
          loading={loading}
          onOpenCard={onOpenCard}
          meId={meId}
          className={twMerge('absolute', isTop3Only ? 'end-3 bottom-6' : 'end-1 top-6')}
        />
        <PodiumSlot
          rank={1}
          player={playersByRank.get(1)}
          loading={loading}
          onOpenCard={onOpenCard}
          meId={meId}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    </section>
  );
}

interface PodiumSlotProps {
  rank: PodiumRank;
  player?: PodiumPlayer;
  loading?: boolean;
  className?: string;
  onOpenCard?: (player: QuickCardPlayer) => void;
  meId?: string;
}

function PodiumSlot({ rank, player, loading, className, onOpenCard, meId }: PodiumSlotProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const theme = RANK_THEME[rank];
  const size = AVATAR_SIZE[rank];
  const isFirst = rank === 1;
  const isEmpty = !loading && !player;
  const floatClass =
    rank === 1 ? 'lt-podium-1' : rank === 2 || rank === 4 ? 'lt-podium-2' : 'lt-podium-3';

  const isMe = !!player?.id && player.id === meId;
  const interactive = !!player?.id && (isMe || !!onOpenCard);
  const RingTag = interactive ? 'button' : 'div';
  const handleTap = () => {
    if (!player?.id) return;
    if (isMe) {
      router.push(routes.profile.index);
      return;
    }
    onOpenCard?.({
      userId: player.id,
      username: player.username,
      avatar: player.avatarUrl ?? '',
      liked: player.liked ?? false,
      likesReceived: player.likesReceived ?? 0,
      points: player.points,
      place: player.rank,
      isVerified: player.isVerified,
      isLuckyPlayer: player.isLuckyPlayer,
      isVIP: player.isVIP,
    });
  };

  return (
    <div
      style={{ animationDelay: `${REVEAL_DELAY_MS[rank]}ms` }}
      className={twMerge(
        'animate-slide-in-bottom flex flex-col items-center',
        isEmpty && 'opacity-40 grayscale',
        className
      )}
    >
      {isFirst && (
        <Crown
          aria-hidden
          size={32}
          strokeWidth={2.4}
          className="lt-podium-crown text-gold pointer-events-none absolute -top-9 left-1/2 z-20 drop-shadow-[0_0_10px_rgba(248,189,62,0.9)]"
          style={{ fill: 'rgba(248,189,62,0.6)' }}
        />
      )}

      <div className={twMerge('relative', floatClass)}>
        {isFirst && <SparkleField parentSize={size} />}

        <span
          aria-hidden
          className="lt-podium-pulse pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size + 16,
            height: size + 16,
            background: theme.pulseColor,
            filter: 'blur(2px)',
          }}
        />

        <span
          aria-hidden
          className={twMerge(
            'pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
            isFirst ? 'lt-podium-rotor' : 'lt-podium-rotor-rev'
          )}
          style={{
            width: size + 14,
            height: size + 14,
            background: theme.outerGradient,
            filter: 'blur(0.4px)',
          }}
        />

        <span
          aria-hidden
          className="bg-background-overlay pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size + 6,
            height: size + 6,
          }}
        />

        <RingTag
          type={interactive ? 'button' : undefined}
          onClick={interactive ? handleTap : undefined}
          aria-label={
            !interactive
              ? undefined
              : isMe
                ? t('view profile')
                : t('open player card', { name: player?.username ?? '' })
          }
          className={twMerge(
            'relative rounded-full p-[3px]',
            interactive && 'cursor-pointer transition-transform active:scale-95'
          )}
          style={{
            width: size + 6,
            height: size + 6,
            background: theme.ringGradient,
            boxShadow: theme.glow,
          }}
        >
          <SkeletonSuspense
            loading={loading || !player}
            skeleton={<Skeleton variant="round" className="bg-background-overlay h-full w-full" />}
          >
            <div className="bg-background-overlay flex-center relative h-full w-full overflow-hidden rounded-full">
              {player?.avatarUrl ? (
                <PlayerPhoto
                  src={player.avatarUrl}
                  alt={player.username}
                  size={size}
                  eager
                  className="h-full w-full rounded-full"
                />
              ) : player?.fallbackInitial ? (
                <span
                  aria-hidden
                  className={twMerge(
                    'font-extrabold',
                    isFirst ? 'text-3xl' : 'text-xl',
                    theme.accentTextClass
                  )}
                >
                  {player.fallbackInitial}
                </span>
              ) : (
                <User
                  aria-hidden
                  size={Math.round(size * 0.55)}
                  strokeWidth={2}
                  className={twMerge('opacity-70', theme.accentTextClass)}
                />
              )}
            </div>
          </SkeletonSuspense>

          <span
            aria-label={`#${rank}`}
            className="absolute -bottom-1 left-1/2 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full text-xs font-extrabold tabular-nums shadow-[0_2px_8px_rgba(0,0,0,0.55)]"
            style={{
              background: theme.badgeBg,
              color: theme.badgeText,
              border: '2px solid rgba(27,25,42,0.95)',
            }}
          >
            {rank}
          </span>
        </RingTag>
      </div>

      <div
        className={twMerge(
          'relative z-10 mt-4 flex flex-col items-center',
          isFirst ? 'max-w-[160px]' : 'max-w-[100px]'
        )}
      >
        <SkeletonSuspense
          loading={loading || !player}
          skeleton={<Skeleton variant="line" textSize="sm" className="h-4 w-16" />}
        >
          <div className="flex w-full items-center justify-center gap-1">
            <span
              title={player?.username}
              className={twMerge(
                'min-w-0 truncate text-center font-bold',
                isFirst ? 'text-[14px] text-white' : 'text-[12px] text-white/90'
              )}
            >
              {player?.username ?? '—'}
            </span>
          </div>
        </SkeletonSuspense>
        {player && (
          <div className="mt-0.5 flex items-center gap-0.5">
            {player.isVerified && (
              <VerifiedSparkleIcon size={isFirst ? 18 : 14} className="shrink-0" />
            )}
            {player.isLuckyPlayer && (
              <LuckyPlayerIcon size={isFirst ? 18 : 14} className="shrink-0" />
            )}
            {player.isVIP && <VipIcon size={isFirst ? 18 : 14} className="shrink-0" />}
          </div>
        )}
        <SkeletonSuspense
          loading={loading || !player}
          skeleton={<Skeleton variant="line" textSize="xs" className="mt-1 h-3 w-12" />}
        >
          <div className="inline-flex items-center gap-1">
            <PointsBadge points={player?.points ?? 0} gradient={theme.pointsGradient} />
            {player?.extra}
          </div>
        </SkeletonSuspense>
      </div>
    </div>
  );
}

interface PointsBadgeProps {
  points: number;
  gradient: string;
}

function PointsBadge({ points, gradient }: PointsBadgeProps) {
  return (
    <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[11px] font-extrabold tabular-nums text-white">
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: gradient }}
      />
      {formatNumber(points)}
    </span>
  );
}

interface SparkleFieldProps {
  parentSize: number;
}

function SparkleField({ parentSize }: SparkleFieldProps) {
  return (
    <>
      {SPARKLE_POSITIONS.map((sparkle, index) => (
        <Sparkles
          key={index}
          aria-hidden
          size={sparkle.size}
          className="lt-podium-sparkle text-gold pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_4px_rgba(248,189,62,0.85)]"
          style={
            {
              left: sparkle.x,
              top: sparkle.y,
              animationDelay: `${sparkle.delay}s`,
              width: sparkle.size,
              height: sparkle.size,
              fill: 'rgba(248,189,62,0.55)',
            } as CSSProperties
          }
        />
      ))}
      <Star
        aria-hidden
        size={10}
        className="lt-podium-sparkle text-electric-pink pointer-events-none absolute"
        style={
          {
            left: parentSize * 0.85,
            top: parentSize * 0.1,
            animationDelay: '0.6s',
            fill: 'rgba(222,0,155,0.7)',
          } as CSSProperties
        }
      />
    </>
  );
}

function ConfettiLayer({
  variant = 'pieces',
  uniformColor,
}: {
  variant?: 'pieces' | 'stars';
  uniformColor?: string;
}): ReactNode {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {CONFETTI_PIECES.map(piece => {
        const color = uniformColor ?? piece.color;
        const cssVars = {
          left: piece.left,
          ['--lt-confetti-duration' as never]: `${piece.duration}s`,
          ['--lt-confetti-delay' as never]: `${piece.delay}s`,
          ['--lt-confetti-x' as never]: `${piece.drift}px`,
        } as CSSProperties;

        if (variant === 'stars') {
          const starSize = 12 + (piece.id % 3) * 4;
          return (
            <span
              key={piece.id}
              className="lt-podium-confetti-piece absolute top-0 flex-center"
              style={{ ...cssVars, color, opacity: 0.75 }}
            >
              <Star
                size={starSize}
                strokeWidth={2.2}
                fill={color}
                fillOpacity={0.55}
                style={{ filter: `drop-shadow(0 0 4px ${color}aa)` }}
              />
            </span>
          );
        }

        return (
          <span
            key={piece.id}
            className="lt-podium-confetti-piece absolute top-0"
            style={
              {
                ...cssVars,
                width: piece.size,
                height: piece.size,
                background: color,
                borderRadius: piece.id % 2 === 0 ? '2px' : '50%',
                opacity: 0.85,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
