'use client';

import { useState } from 'react';
import { Modal } from '@/components/shared/modals/Modal';
import { Input } from '@/components/shared/form-elements/inputs/Input';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useGetMeQuery, useUpdateMeMutation } from '@/api/me.api';
import { Wallet } from 'lucide-react';

interface ConnectWalletModalProps {
  open: boolean;
  onClose: () => void;
}

export const ConnectWalletModal = ({ open, onClose }: ConnectWalletModalProps) => {
  const t = useAppTranslations();
  const [walletId, setWalletId] = useState('');
  const { data: me } = useGetMeQuery();
  const [updateMe, { isLoading }] = useUpdateMeMutation();

  const handleConnect = async () => {
    if (!walletId.trim()) return;

    try {
      // Connect wallet and give some bonus coins to demonstrate UI update
      await updateMe({ walletId, coins: (me?.coins || 0) + 100 }).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-6 p-6 bg-purple-gradient rounded-2xl">
        <div className="flex flex-col gap-2 items-center text-center">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <Wallet size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-bold">{t('connect wallet')}</h2>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-400 px-1">{t('wallet id')}</label>
            <Input
              value={walletId}
              onChange={e => setWalletId(e.target.value)}
              placeholder={t('enter wallet id')}
              className="bg-white/5 border border-white/10 focus-within:border-white/20 transition-colors"
            />
          </div>

          <Button
            onClick={handleConnect}
            loading={isLoading}
            disabled={!walletId.trim()}
            className="w-full py-3 rounded-xl"
          >
            {t('connect')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
