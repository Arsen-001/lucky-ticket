'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, Gift, Lock, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetAvatarInventoryQuery } from '@/api/avatars.api';
import { useUpdateMeMutation } from '@/api/me.api';
import { Button } from '@/components/shared/buttons/Button';
import { Modal } from '@/components/shared/modals/Modal';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { Ticket } from '@/components/shared/icons/Ticket';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';
import type {
  AvatarBoostType,
  AvatarDailyReward,
  UserAvatar as UserAvatarItem,
} from '@/types/interfaces/avatars.interfaces';
import '@/styles/components/avatar-tile.css';

const BOOST_LABEL: Record<AvatarBoostType, MessageIds> = {
  engineSpeed: 'boost engine speed',
  marketDiscount: 'boost market discount',
  claimMultiplier: 'boost claim multiplier',
  apEarn: 'boost ap earn',
  tournamentReward: 'boost tournament reward',
};

type LevelAccent = {
  ring: string;
  badge: string;
  glow?: string;
};

const LEVEL_ACCENT: Record<number, LevelAccent> = {
  1: { ring: 'border-white/15', badge: 'bg-white/15 text-white/70' },
  2: { ring: 'border-white/20', badge: 'bg-white/15 text-white/70' },
  3: { ring: 'border-bronze/60', badge: 'bg-bronze/25 text-bronze' },
  4: { ring: 'border-bronze/80', badge: 'bg-bronze/30 text-bronze' },
  5: { ring: 'border-silver/60', badge: 'bg-silver/25 text-silver' },
  6: { ring: 'border-silver/80', badge: 'bg-silver/30 text-silver' },
  7: { ring: 'border-gold/65', badge: 'bg-gold/25 text-gold' },
  8: { ring: 'border-gold/85', badge: 'bg-gold/30 text-gold' },
  9: { ring: 'border-diamond/80', badge: 'bg-diamond/25 text-diamond' },
  10: { ring: 'border-transparent', badge: 'text-white', glow: 'avatar-tile--rainbow' },
};

export interface SettingsAvatarModalProps {
  open: boolean;
  onClose: () => void;
  currentAvatarId?: string;
}

export function SettingsAvatarModal({ open, onClose, currentAvatarId }: SettingsAvatarModalProps) {
  const t = useAppTranslations();
  const { data: avatars, isLoading } = useGetAvatarInventoryQuery();
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();
  const [selectedId, setSelectedId] = useState<string | undefined>(currentAvatarId);

  useEffect(() => {
    if (open) setSelectedId(currentAvatarId);
  }, [open, currentAvatarId]);

  const sortedAvatars = (avatars ?? []).slice().sort((a, b) => a.level - b.level);
  const selected = sortedAvatars.find(a => a.id === selectedId);
  const isUnchanged = !selected || selected.id === currentAvatarId;
  const isLocked = selected ? !selected.owned : false;

  const handleSelect = (id: string) => {
    const target = sortedAvatars.find(a => a.id === id);
    if (!target) return;
    setSelectedId(id);
  };

  const handleSave = async () => {
    if (!selected || isUnchanged || isLocked) {
      onClose();
      return;
    }
    try {
      await updateMe({ avatar: selected.src, avatarId: selected.id }).unwrap();
      onClose();
    } catch {
      // mock backend never rejects; the optimistic update already applied
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient flex max-h-[80vh] flex-col gap-5 rounded-2xl p-6">
        <div className="flex flex-col gap-1 text-center">
          <h3 className="text-xl font-bold text-white">{t('change avatar')}</h3>
          <p className="text-sm text-white/65 leading-relaxed">
            {t('change avatar picker description')}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hidden">
          <div className="grid grid-cols-3 gap-3 p-1.5">
            {isLoading
              ? Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
                ))
              : sortedAvatars.map(avatar => (
                  <AvatarTile
                    key={avatar.id}
                    avatar={avatar}
                    selected={avatar.id === selectedId}
                    onSelect={() => handleSelect(avatar.id)}
                  />
                ))}
          </div>
        </div>

        {selected && (
          <SelectedAvatarInfo
            avatar={selected}
            labelKey={selected.boost ? BOOST_LABEL[selected.boost.type] : undefined}
          />
        )}

        <Link
          href={routes.market('cosmetics')}
          className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-white/65 underline-offset-2 hover:text-white hover:underline"
        >
          <ShoppingBag size={12} strokeWidth={2.4} />
          {t('get more avatars in market')}
        </Link>

        <div className="flex-center gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="rounded-full px-4 py-2"
            disabled={isSaving}
          >
            {t('cancel')}
          </Button>
          {isLocked ? (
            <Link
              href={routes.market('cosmetics')}
              onClick={onClose}
              className="bg-pink-gradient inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white"
            >
              <ShoppingBag size={14} strokeWidth={2.4} />
              {t('buy in market')}
            </Link>
          ) : (
            <Button
              variant="primary"
              onClick={handleSave}
              className="rounded-full px-4 py-1.5"
              loading={isSaving}
              disabled={isUnchanged}
            >
              {t('save')}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

interface AvatarTileProps {
  avatar: UserAvatarItem;
  selected: boolean;
  onSelect: () => void;
}

function AvatarTile({ avatar, selected, onSelect }: AvatarTileProps) {
  const accent = LEVEL_ACCENT[avatar.level] ?? LEVEL_ACCENT[1];
  const locked = !avatar.owned;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={twMerge(
        'avatar-tile relative flex aspect-square w-full items-center justify-center rounded-2xl border-2 bg-white/5 p-1.5 transition-all active:scale-95',
        accent.ring,
        accent.glow,
        selected && 'ring-2 ring-electric-pink ring-offset-2 ring-offset-background'
      )}
    >
      <Image
        src={avatar.src}
        alt={avatar.name}
        width={96}
        height={96}
        className={twMerge(
          'h-full w-full rounded-xl object-cover',
          locked && 'opacity-40 grayscale'
        )}
      />
      <span
        className={twMerge(
          'absolute -top-1 -right-1 flex-center min-w-6 h-5 px-1 rounded-full text-[10px] font-extrabold tabular-nums shadow-md',
          accent.badge,
          avatar.level === 10 && 'avatar-tile-badge--rainbow'
        )}
      >
        L{avatar.level}
      </span>
      {locked && !selected && (
        <span className="absolute inset-0 flex-center rounded-2xl bg-black/35">
          <Lock size={18} className="text-white/80" strokeWidth={2.6} />
        </span>
      )}
      {selected && (
        <span
          className={twMerge(
            'absolute bottom-1 right-1 flex-center h-5 w-5 rounded-full text-white shadow-md',
            locked ? 'bg-error' : 'bg-electric-pink'
          )}
        >
          {locked ? <Lock size={11} strokeWidth={3} /> : <Check size={11} strokeWidth={3} />}
        </span>
      )}
    </button>
  );
}

interface SelectedAvatarInfoProps {
  avatar: UserAvatarItem;
  labelKey?: MessageIds;
}

function SelectedAvatarInfo({ avatar, labelKey }: SelectedAvatarInfoProps) {
  const t = useAppTranslations();
  const locked = !avatar.owned;
  return (
    <div
      className={twMerge(
        'flex flex-col gap-1 rounded-xl border px-3.5 py-3',
        locked ? 'border-error/30 bg-error/8' : 'border-white/10 bg-white/[0.04]'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-white">{avatar.name}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/45">
          {avatar.tier === 'paid' ? t('paid') : t('free')} · L{avatar.level}
        </span>
      </div>
      {locked ? (
        <div className="flex items-center gap-1.5 text-[12px] text-error">
          <Lock size={12} strokeWidth={2.6} />
          {t('avatar locked buy in market')}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {labelKey && avatar.boost && (
            <div className="flex items-center gap-1.5 text-[12px] text-emerald-300">
              <Sparkles size={12} strokeWidth={2.6} />
              {t(labelKey, { percentage: avatar.boost.pct })}
            </div>
          )}
          {avatar.dailyReward && (
            <div className="flex items-center gap-1.5 text-[12px] text-white/80">
              <Gift size={12} strokeWidth={2.6} className="text-gold" />
              <span>{t('avatar daily reward')}:</span>
              {renderAvatarDailyReward(avatar.dailyReward)}
            </div>
          )}
          {!avatar.boost && !avatar.dailyReward && (
            <span className="text-[12px] text-white/45">{t('no boost free avatar')}</span>
          )}
        </div>
      )}
    </div>
  );
}

function renderAvatarDailyReward(reward: AvatarDailyReward) {
  if (reward.kind === 'ltc') {
    return (
      <span className="text-gold inline-flex items-center gap-1 font-bold tabular-nums">
        +{reward.amount}
        <LcLabel size={12} />
      </span>
    );
  }
  if (reward.kind === 'stars') {
    return (
      <span className="text-gold inline-flex items-center gap-0.5 font-bold tabular-nums">
        +{reward.amount}
        <Star size={11} className="fill-gold" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 font-bold tabular-nums text-white">
      +{reward.amount}
      <Ticket type={reward.tier ?? 'bronze'} width={14} height={14} />
    </span>
  );
}
