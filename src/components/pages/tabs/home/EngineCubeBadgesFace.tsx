import { Award, type LucideIcon, Package, Sparkles, Trophy, Zap } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import '@/styles/components/engine-cube-faces.css';

export interface EngineCubeBadgeDef {
  Icon: LucideIcon;
  earned: boolean;
  accent: string;
}

export interface EngineCubeBadgesFaceProps {
  badges: EngineCubeBadgeDef[];
  accent?: string;
}

export function EngineCubeBadgesFace({
  badges,
  accent = 'var(--color-gold)',
}: EngineCubeBadgesFaceProps) {
  const t = useAppTranslations();
  const earnedCount = badges.filter(b => b.earned).length;
  const totalCount = badges.length;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-5">
      <div
        className="cube-medal cube-medal--small"
        style={{ '--medal-accent': accent } as React.CSSProperties}
      >
        <Trophy
          size={28}
          stroke="white"
          strokeWidth={2.6}
          fill="rgba(255,255,255,0.18)"
          style={{
            filter: `drop-shadow(0 0 4px color-mix(in srgb, ${accent} 70%, transparent))`,
          }}
        />
      </div>

      <div className="mt-2.5 flex flex-col items-center gap-0.5">
        <span
          className="text-[32px] font-extrabold leading-none tabular-nums text-white"
          style={{
            textShadow: `0 0 18px color-mix(in srgb, ${accent} 60%, transparent)`,
          }}
        >
          {earnedCount}
          <span className="text-white/45"> / {totalCount}</span>
        </span>
        <span
          className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white"
          style={{
            textShadow: `0 0 12px color-mix(in srgb, ${accent} 70%, transparent)`,
          }}
        >
          {t('badges earned')}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        {badges.map((badge, i) => {
          const Icon = badge.Icon;
          return (
            <div
              key={i}
              className={`cube-hex cube-hex--bright ${
                badge.earned ? 'cube-hex--earned' : 'cube-hex--locked'
              }`}
              style={{ '--hex-accent': badge.accent } as React.CSSProperties}
            >
              <span className="cube-hex-inner">
                <Icon
                  size={20}
                  stroke={
                    badge.earned ? 'white' : `color-mix(in srgb, ${badge.accent} 60%, transparent)`
                  }
                  strokeWidth={2.6}
                  style={
                    badge.earned
                      ? {
                          filter: `drop-shadow(0 0 4px color-mix(in srgb, ${badge.accent} 80%, transparent))`,
                        }
                      : undefined
                  }
                />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const DEFAULT_BADGE_DEFS = (earnedFlags: {
  spark: boolean;
  speed: boolean;
  capacity: boolean;
  veteran: boolean;
}): EngineCubeBadgeDef[] => [
  { Icon: Sparkles, earned: earnedFlags.spark, accent: 'var(--color-bronze)' },
  { Icon: Zap, earned: earnedFlags.speed, accent: 'var(--color-electric-pink)' },
  { Icon: Package, earned: earnedFlags.capacity, accent: 'var(--color-gold)' },
  { Icon: Award, earned: earnedFlags.veteran, accent: 'var(--color-diamond)' },
];
