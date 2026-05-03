'use client';

import { useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { Input } from '@/components/shared/form-elements/inputs/Input';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useNotifyLcLaunchMutation } from '@/api/wallet.api';

interface LcNotifyMeModalProps {
  open: boolean;
  onClose: () => void;
}

export function LcNotifyMeModal({ open, onClose }: LcNotifyMeModalProps) {
  const t = useAppTranslations();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [notify, { isLoading }] = useNotifyLcLaunchMutation();

  const handleClose = () => {
    setEmail('');
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = async () => {
    try {
      await notify({ email: email.trim() || undefined }).unwrap();
      setSubmitted(true);
    } catch {
      /* surface via toast */
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="bg-purple-gradient flex flex-col gap-4 rounded-2xl p-6">
        {!submitted ? (
          <>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="bg-gold/15 flex-center h-12 w-12 rounded-2xl ring-1 ring-gold/30">
                <Bell size={22} className="text-gold" strokeWidth={2.2} />
              </div>
              <h2 className="text-white text-xl font-extrabold">{t('lc launching soon')}</h2>
              <p className="text-pink-secondary text-[12px]">{t('lc notify subtitle')}</p>
            </div>

            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('email optional')}
            />

            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isLoading}
              className="rounded-xl"
            >
              {t('notify me')}
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 size={42} className="text-success" strokeWidth={2.2} />
            <h2 className="text-white text-xl font-extrabold">{t('you are on the list')}</h2>
            <p className="text-pink-secondary text-[12px]">{t('we will notify you')}</p>
            <Button variant="primary" onClick={handleClose} className="w-full rounded-xl">
              {t('done')}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
