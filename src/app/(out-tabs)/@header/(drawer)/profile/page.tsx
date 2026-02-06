'use client';
import { PageHeader } from '@/components/layout-elements/PageHeader';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { UserRoundPen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { routes } from '@/constants/routes';

export default function ProfileHeader() {
  const router = useRouter();
  const t = useAppTranslations();
  const handleEditClick = () => {
    router.push(routes.settings.index);
  };
  return (
    <PageHeader
      title={t('profile')}
      extraButtonProps={{ icon: <UserRoundPen />, onClick: handleEditClick }}
    />
  );
}
