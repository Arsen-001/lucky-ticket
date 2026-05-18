'use client';
import { Check, Lock, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { CloverIcon } from '@/components/shared/icons/CloverIcon';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  cloverLevels,
  computeCloverLevel,
  getCloverBlockers,
  type CloverEvalProfile,
  type CloverLevelDef,
} from '@/constants/global.constants';
import '@/styles/components/profile.css';

export interface CloverProgressionModalProps {
  open: boolean;
  onClose: () => void;
  profile: CloverEvalProfile;
}

export function CloverProgressionModal({ open, onClose, profile }: CloverProgressionModalProps) {
  const t = useAppTranslations();
  const currentLevel = computeCloverLevel(profile);
  const nextDef = cloverLevels.find(l => l.level === currentLevel + 1);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient flex flex-col gap-5 rounded-2xl p-6">
        <div className="flex flex-col gap-1 text-center">
          <h3 className="text-xl font-bold text-white">{t('clover progression')}</h3>
          <p className="text-xs text-white/60">{t('clover progression description')}</p>
        </div>

        {nextDef && (
          <NextLevelHighlight currentLevel={currentLevel} nextDef={nextDef} profile={profile} />
        )}

        <div className="flex flex-col gap-2">
          {cloverLevels.map(def => (
            <CloverLevelRow
              key={def.level}
              def={def}
              currentLevel={currentLevel}
              profile={profile}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}

interface NextLevelHighlightProps {
  currentLevel: number;
  nextDef: CloverLevelDef;
  profile: CloverEvalProfile;
}

function NextLevelHighlight({ currentLevel, nextDef, profile }: NextLevelHighlightProps) {
  const t = useAppTranslations();
  const blockers = getCloverBlockers(nextDef, profile);
  const ticketsBlocker = blockers.find(b => b.type === 'tickets');
  const ticketsCurrent = (ticketsBlocker?.current as number | undefined) ?? profile.ticketsEarned;
  const ticketsRequired =
    (ticketsBlocker?.required as number | undefined) ?? nextDef.ticketsRequired;
  const pct = Math.min(100, Math.round((ticketsCurrent / ticketsRequired) * 100));

  return (
    <div className="rounded-xl border border-electric-pink/30 bg-electric-pink/10 px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-electric-pink text-[10px] font-bold uppercase tracking-wider">
          {t('clover next level', { level: nextDef.level, name: nextDef.name })}
        </span>
        <span className="text-electric-pink text-[10px] font-bold tabular-nums">
          {t('clover tickets count', {
            current: ticketsCurrent.toLocaleString(),
            required: ticketsRequired.toLocaleString(),
          })}
        </span>
      </div>
      <div className="bg-background-overlay h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="bg-electric-pink h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      {blockers.length > 1 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {blockers
            .filter(b => b.type !== 'tickets')
            .map((b, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[10px] font-bold text-white/80"
              >
                <Lock size={9} />
                <BlockerText blocker={b} />
              </span>
            ))}
        </div>
      )}
      {currentLevel === 0 && (
        <p className="mt-2 text-[10px] text-white/55">
          {t('clover earn first', { count: nextDef.ticketsRequired })}
        </p>
      )}
    </div>
  );
}

interface BlockerTextProps {
  blocker: ReturnType<typeof getCloverBlockers>[number];
}

function BlockerText({ blocker }: BlockerTextProps) {
  const t = useAppTranslations();
  switch (blocker.type) {
    case 'verified':
      return <span>{t('blocker verify email')}</span>;
    case 'lucky-player':
      return <span>{t('blocker lucky player required')}</span>;
    case 'vip':
      return (
        <span>
          {t('blocker vip level', {
            current: blocker.current ?? 0,
            required: blocker.required as number,
          })}
        </span>
      );
    case 'tier':
      return (
        <span>{t('blocker tier required', { tier: t(String(blocker.required) as 'bronze') })}</span>
      );
    default:
      return null;
  }
}

interface CloverLevelRowProps {
  def: CloverLevelDef;
  currentLevel: number;
  profile: CloverEvalProfile;
}

function CloverLevelRow({ def, currentLevel, profile }: CloverLevelRowProps) {
  const t = useAppTranslations();
  const isReached = currentLevel >= def.level;
  const isCurrent = currentLevel === def.level;
  const isNext = currentLevel + 1 === def.level;
  const blockers = getCloverBlockers(def, profile);

  return (
    <div
      className={twMerge(
        'flex items-center gap-3 rounded-xl border p-3 transition-all',
        isCurrent
          ? 'border-electric-pink/55 bg-electric-pink/12'
          : isNext
            ? 'border-white/15 bg-white/4'
            : 'border-white/8 bg-white/2',
        !isReached && !isNext && 'opacity-65'
      )}
    >
      <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center">
        <CloverIcon variant={def.variant} size={40} />
        {!isReached && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 backdrop-blur-[1px]">
            <Lock size={14} className="text-white/85" />
          </span>
        )}
        {isReached && (
          <span className="bg-success absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-background)]">
            <Check size={10} strokeWidth={3} className="text-white" />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-extrabold text-white">
            {t('clover level row', { level: def.level, name: def.name })}
          </span>
          <span className="text-[10px] font-bold text-white/55 tabular-nums">
            {t('clover tickets short', { count: def.ticketsRequired.toLocaleString() })}
          </span>
        </div>
        <span className="line-clamp-2 text-[11px] text-white/75">{def.description}</span>
        <span className="text-electric-pink line-clamp-1 text-[10px] font-bold uppercase tracking-wider">
          {def.unlock}
        </span>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <RewardChip ls={def.rewardLs} />
          {def.statusGate && !isReached && (
            <GateChips blockers={blockers.filter(b => b.type !== 'tickets')} />
          )}
        </div>
      </div>
    </div>
  );
}

function RewardChip({ ls }: { ls: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-electric-pink/30 bg-electric-pink/10 px-2 py-0.5 text-[10px] font-extrabold tabular-nums">
      <Sparkles size={9} className="text-electric-pink" />
      <span className="text-electric-pink">+{ls.toLocaleString()} LS</span>
    </span>
  );
}

function GateChips({ blockers }: { blockers: ReturnType<typeof getCloverBlockers> }) {
  if (blockers.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {blockers.map((b, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[9px] font-bold text-white/75"
        >
          {b.type === 'verified' && <ShieldCheck size={9} />}
          {b.type === 'lucky-player' && <Star size={9} />}
          <BlockerText blocker={b} />
        </span>
      ))}
    </span>
  );
}
