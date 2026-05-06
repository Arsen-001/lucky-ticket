'use client';
import { use } from 'react';
import { ProfilePage } from '@/components/pages/out-tabs/drawer/profile/ProfilePage';

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  return <ProfilePage userId={userId} />;
}
