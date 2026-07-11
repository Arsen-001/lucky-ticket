'use client';

import { ClientPortal } from '@/components/shared/ClientPortal';
import { appConfig } from '@/config/app.config';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useAppSelector } from '@/lib/rtk/hooks';
import { selectServerMaintenance } from '@/lib/rtk/features/maintenance.slice';
import { MaintenanceOverlay } from './MaintenanceOverlay';
import { OfflineOverlay } from './OfflineOverlay';

/**
 * Mounts the blocking status overlays once in the root layout. Maintenance
 * (the backend's 503 MaintenanceGuard, or the local config override) takes
 * priority over offline (`navigator.onLine`) — if the platform is down,
 * that's the more relevant message.
 */
export function AppStatusOverlay() {
  const online = useOnlineStatus();
  const serverDown = useAppSelector(selectServerMaintenance);
  const maintenance = appConfig.maintenance.enabled || serverDown;

  if (!maintenance && online) return null;

  return <ClientPortal>{maintenance ? <MaintenanceOverlay /> : <OfflineOverlay />}</ClientPortal>;
}
