'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Medal, Send, Swords, UserRound } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { VerifiedSparkleIcon } from '@/components/shared/icons/VerifiedSparkleIcon';
import { VipIcon } from '@/components/shared/icons/VipIcon';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { UserAvatar, type AvatarStatusColor } from '@/components/shared/user-elements/UserAvatar';
import { ProfileSendTicketModal } from '@/components/pages/out-tabs/drawer/profile/ProfileSendTicketModal';
import { useLikeProfileMutation } from '@/api/profile.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useFeature } from '@/hooks/useFeature';
import { routes } from '@/constants/routes';
import { formatNumber } from '@/utils/global/number.utils';

export interface QuickCardPlayer {
  userId: string;
  username: string;
  avatar: string;
  liked: boolean;
  likesReceived: number;
  points?: number;
  place?: number;
  isVerified?: boolean;
  isLuckyPlayer?: boolean;
  isVIP?: boolean;
}

export interface PlayerQuickCardProps extends QuickCardPlayer {
  open: boolean;
  onClose: () => void;
}

/** Eases a number from 0 to `target` while `run` is true. */
function useCountUp(target: number, run: boolean, durationMs = 650): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) {
      setValue(0);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const ratio = Math.min(1, (ts - start) / durationMs);
      setValue(Math.round(target * (1 - Math.pow(1 - ratio, 3))));
      if (ratio < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, durationMs]);
  return value;
}

export function PlayerQuickCard({
  open,
  onClose,
  userId,
  username,
  avatar,
  liked,
  likesReceived,
  points,
  place,
  isVerified,
  isLuckyPlayer,
  isVIP,
}: PlayerQuickCardProps) {
  const t = useAppTranslations();
  const duelOpen = useFeature('duel');
  const router = useRouter();
  const [likeProfile, { isLoading }] = useLikeProfileMutation();
  const [sendOpen, setSendOpen] = useState(false);
  const [likeState, setLikeState] = useState({ liked, likesReceived });
  const pointsCount = useCountUp(points ?? 0, open);

  const ringColor: AvatarStatusColor = isVIP
    ? 'vip'
    : isLuckyPlayer
      ? 'lucky-player'
      : isVerified
        ? 'verified'
        : 'plain';
  const shineColors = [
    isVIP && 'rgba(248, 189, 62, 1)',
    isLuckyPlayer && 'rgba(139, 92, 246, 1)',
    isVerified && 'rgba(56, 189, 248, 1)',
  ].filter((c): c is string => Boolean(c));

  const handleLike = () => {
    if (likeState.liked || isLoading) return;
    setLikeState(s => ({ liked: true, likesReceived: s.likesReceived + 1 }));
    likeProfile(userId);
  };

  const handleViewProfile = () => {
    onClose();
    router.push(routes.profile.getByUserId(userId));
  };

  return (
    <>
      <Modal open={open} onClose={onClose} hideCloseButton label={username}>
        <div className="bg-purple-gradient mx-auto w-full max-w-[330px] overflow-hidden rounded-3xl">
          <div className="relative flex flex-col items-center gap-2.5 px-5 pb-4 pt-7">
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-2 h-28 w-28 -translate-x-1/2 rounded-full opacity-45 blur-2xl"
              style={{ background: shineColors[0] ?? 'rgba(116, 61, 245, 0.6)' }}
            />

            <UserAvatar
              src={avatar}
              size={92}
              shadow
              withRing
              ringColor={ringColor}
              ringProgress={100}
              shineColors={shineColors.length > 0 ? shineColors : undefined}
              className="animate-slide-in-bottom relative"
            />

            <div
              className="animate-slide-in-bottom mt-2.5 flex items-center gap-1.5"
              style={{ animationDelay: '60ms' }}
            >
              <h2 className="text-lg font-extrabold leading-tight text-white">{username}</h2>
              {isVerified && <VerifiedSparkleIcon size={18} className="shrink-0" />}
              {isLuckyPlayer && <LuckyPlayerIcon size={18} className="shrink-0" />}
              {isVIP && <VipIcon size={18} className="shrink-0" />}
            </div>

            <div className="mt-1 flex w-full gap-2">
              {place != null && (
                <StatPill
                  icon={<Medal size={15} strokeWidth={2.4} />}
                  accent="text-gold"
                  label={t('rank')}
                  value={`#${place}`}
                  delay={120}
                />
              )}
              {points != null && (
                <StatPill
                  icon={<BoltIcon size={18} />}
                  accent="text-gold"
                  label="AP"
                  value={formatNumber(pointsCount)}
                  delay={160}
                />
              )}
              <StatPill
                icon={<Heart size={14} fill="currentColor" strokeWidth={0} />}
                accent="text-electric-pink"
                label={t('likes')}
                value={formatNumber(likeState.likesReceived)}
                delay={200}
              />
            </div>
          </div>

          <div
            className="animate-slide-in-bottom flex flex-col gap-2 px-5 pb-5"
            style={{ animationDelay: '240ms' }}
          >
            {/* Вызов на дуэль — первым действием: это единственная кнопка
                карточки, которая начинает игру, а не жест вежливости. Ведёт на
                выбор ставки, потому что позвать без ставки нельзя. */}
            {duelOpen && (
              <Button
                className="flex w-full items-center justify-center gap-1.5"
                onClick={() => {
                  // Карточка — модалка в портале: без закрытия она осталась бы
                  // поверх экрана дуэли, и «позвать» выглядело бы как «ничего
                  // не произошло».
                  onClose();
                  router.push(routes.games.getDuelInvite(userId));
                }}
              >
                <Swords size={15} strokeWidth={2.6} />
                {t('duel call to duel')}
              </Button>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSendOpen(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/12 bg-white/5 py-2.5 text-[12px] font-bold text-white/85 transition-all hover:bg-white/10 active:scale-95"
              >
                <Send size={14} strokeWidth={2.6} />
                {t('send ticket')}
              </button>
              <button
                type="button"
                onClick={handleLike}
                disabled={likeState.liked || isLoading}
                className={twMerge(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[12px] font-bold transition-all active:scale-95',
                  likeState.liked
                    ? 'border-electric-pink/45 bg-electric-pink/15 text-electric-pink'
                    : 'border-white/12 bg-white/5 text-white/85 hover:bg-white/10'
                )}
              >
                <Heart
                  size={14}
                  strokeWidth={2.6}
                  fill={likeState.liked ? 'currentColor' : 'none'}
                />
                {likeState.liked ? t('profile liked') : t('like profile')}
              </button>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={handleViewProfile}
              icon={<UserRound size={15} strokeWidth={2.6} />}
              iconSize={15}
            >
              {t('view profile')}
            </Button>
          </div>
        </div>
      </Modal>

      <ProfileSendTicketModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        userId={userId}
        username={username}
      />
    </>
  );
}

interface StatPillProps {
  icon: ReactNode;
  accent: string;
  label: string;
  value: string | number;
  delay: number;
}

function StatPill({ icon, accent, label, value, delay }: StatPillProps) {
  return (
    <div
      className="animate-slide-in-bottom flex flex-1 flex-col items-center gap-0.5 rounded-xl border border-white/8 bg-white/5 px-2 py-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className={twMerge('flex items-center', accent)}>{icon}</span>
      <span className="text-[13px] font-extrabold tabular-nums text-white">{value}</span>
      <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">{label}</span>
    </div>
  );
}
