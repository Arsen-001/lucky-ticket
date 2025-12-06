'use client';
import { Button, type ButtonProps } from '@/components/shared/buttons/Button';
import { images } from '@/constants/images';
import Image from 'next/image';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface GoogleSignInButtonProps extends Omit<
  ButtonProps,
  'children'
> {}

export function GoogleSignInButton({ ...rest }: GoogleSignInButtonProps) {
  const t = useAppTranslations();
  return (
    <Button variant="secondary" {...rest}>
      <div className="flex items-start justify-center gap-2">
        <Image className="h-6 w-6" src={images.googleIcon} alt="Google logo" />
        <span>{t('sign in with google')}</span>
      </div>
    </Button>
  );
}
