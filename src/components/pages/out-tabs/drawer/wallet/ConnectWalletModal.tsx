'use client';

import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useConnectWalletMutation, useGetSupportedWalletsQuery } from '@/api/wallet.api';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { WalletProvider } from '@/types/enums/wallet.enums';

interface ConnectWalletModalProps {
  open: boolean;
  onClose: () => void;
}

export function ConnectWalletModal({ open, onClose }: ConnectWalletModalProps) {
  const t = useAppTranslations();
  const { data: wallets = [], isLoading } = useGetSupportedWalletsQuery();
  const [connect, { isLoading: isConnecting }] = useConnectWalletMutation();
  const [selected, setSelected] = useState<WalletProvider | null>(null);

  const handleConnect = async (provider: WalletProvider) => {
    setSelected(provider);
    try {
      await connect({ provider }).unwrap();
      onClose();
    } catch {
      /* surface via toast in v2 */
    } finally {
      setSelected(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient flex flex-col gap-4 rounded-2xl p-6">
        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-white text-xl font-extrabold">{t('connect wallet')}</h2>
          <p className="text-pink-secondary text-[12px]">{t('choose a wallet provider')}</p>
        </div>

        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="text-pink-secondary text-center text-[12px]">{t('loading')}</div>
          ) : (
            wallets.map(w => {
              const isThisLoading = isConnecting && selected === w.provider;
              return (
                <button
                  key={w.provider}
                  type="button"
                  onClick={() => handleConnect(w.provider)}
                  disabled={isConnecting}
                  className={twMerge(
                    'flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-colors',
                    'hover:bg-white/10 disabled:opacity-50'
                  )}
                >
                  <span
                    className="flex-center h-9 w-9 flex-shrink-0 rounded-lg text-[12px] font-extrabold text-white"
                    style={{ background: w.iconBg }}
                  >
                    {w.emoji}
                  </span>
                  <span className="flex-1 text-sm font-bold text-white">{w.name}</span>
                  {isThisLoading ? (
                    <span className="text-pink-secondary text-[10px] font-bold uppercase">
                      {t('connecting')}
                    </span>
                  ) : (
                    <ChevronRight size={14} className="text-pink-secondary" />
                  )}
                </button>
              );
            })
          )}
        </div>

        <p className="text-pink-secondary text-center text-[10px]">
          {t('connect wallet disclaimer')}
        </p>

        <Button variant="secondary" onClick={onClose} className="rounded-full px-4 py-2">
          {t('cancel')}
        </Button>
      </div>
    </Modal>
  );
}
