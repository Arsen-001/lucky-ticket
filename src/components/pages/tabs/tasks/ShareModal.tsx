'use client';

import { Modal } from '@/components/shared/modals/Modal';
import { ModalCloseButton } from '@/components/shared/modals/ModalCloseButton';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShareModal({ open, onClose }: ShareModalProps) {
  const t = useAppTranslations();

  const platforms = [
    { name: t('share on {place}', { place: 'tiktok' }), color: 'bg-tiktok' },
    { name: t('share on {place}', { place: 'instagram' }), color: 'bg-instagram' },
    { name: t('share on {place}', { place: 'facebook' }), color: 'bg-facebook' },
    { name: t('share on {place}', { place: 'telegram' }), color: 'bg-telegram' },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient p-5 rounded-xl">
        <ModalCloseButton onClick={onClose} className="right-4 top-4 text-white/50" />

        <h3 className="text-xl font-semibold mb-5">{t('share')}</h3>
        <p className="text-sm text-pink-secondary mb-4">{t('share task description')}</p>

        <div className="flex-col-stretch gap-2">
          {platforms.map(platform => (
            <Button
              key={platform.name}
              className={`w-full flex justify-center rounded-xl p-3 ${platform.color} border-none`}
              onClick={() => {
                console.log(`Sharing on ${platform.name}`);
                onClose();
              }}
            >
              {platform.name}
            </Button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
