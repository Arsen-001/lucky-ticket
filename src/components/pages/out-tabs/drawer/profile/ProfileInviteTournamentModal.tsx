'use client';
import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { useGetTournamentsQuery } from '@/api/tournaments.api';
import { useInviteToTournamentMutation } from '@/api/profile.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';

export interface ProfileInviteTournamentModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  username?: string;
}

export function ProfileInviteTournamentModal({
  open,
  onClose,
  userId,
  username,
}: ProfileInviteTournamentModalProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: tournaments } = useGetTournamentsQuery();
  const [inviteToTournament, { isLoading }] = useInviteToTournamentMutation();
  const [selected, setSelected] = useState<string | null>(null);

  const options = (tournaments ?? []).filter(x => x.status === 'upcoming');

  useEffect(() => {
    if (!open) setSelected(null);
  }, [open]);

  const handleInvite = async () => {
    if (!selected) return;
    try {
      await inviteToTournament({ userId, tournamentId: selected }).unwrap();
      toast.success(t('invitation sent'));
      onClose();
    } catch {
      toast.error(t('action failed'));
    }
  };

  return (
    <Modal open={open} onClose={onClose} hideCloseButton label={t('invite to tournament')}>
      <div className="bg-purple-gradient mx-auto flex w-full max-w-[360px] flex-col gap-4 rounded-3xl p-5">
        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-base font-extrabold text-white">{t('invite to tournament')}</h2>
          {username && <p className="text-[12px] text-white/55">{username}</p>}
        </div>

        {options.length === 0 ? (
          <p className="rounded-xl bg-white/5 px-4 py-6 text-center text-[12px] text-white/55">
            {t('no active tournaments')}
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            <span className="px-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
              {t('select tournament')}
            </span>
            <div className="scrollbar-hidden flex max-h-[280px] flex-col gap-1.5 overflow-y-auto">
              {options.map(x => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setSelected(x.id)}
                  className={twMerge(
                    'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all active:scale-99',
                    selected === x.id
                      ? 'border-electric-pink/50 bg-electric-pink/12'
                      : 'border-white/10 bg-white/5 hover:bg-white/8'
                  )}
                >
                  <Trophy size={16} className="text-electric-pink shrink-0" strokeWidth={2.4} />
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-[13px] font-bold text-white">{x.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/45">
                      {t(x.type)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            className="flex-1"
            onClick={handleInvite}
            loading={isLoading}
            disabled={!selected || isLoading}
          >
            {t('invite')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
