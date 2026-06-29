'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button, type ButtonProps } from '@/components/shared/buttons/Button';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface PartnerReleaseButtonProps {
  className?: string;
  variant?: ButtonProps['variant'];
}

export function PartnerReleaseButton({ className, variant }: PartnerReleaseButtonProps) {
  const t = useAppTranslations();
  const router = useRouter();

  return (
    <Button
      variant={variant}
      icon={<Plus />}
      iconSize={18}
      onClick={() => router.push(routes.partners.new)}
      className={className}
    >
      {t('create tournament')}
    </Button>
  );
}
