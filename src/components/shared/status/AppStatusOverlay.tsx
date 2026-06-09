'use client';

import { ClientPortal } from '@/components/shared/ClientPortal';
import { appConfig } from '@/config/app.config';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { MaintenanceOverlay } from './MaintenanceOverlay';
import { OfflineOverlay } from './OfflineOverlay';

/**
 * Mounts the blocking status overlays once in the root layout. Maintenance (the
 * config flag) takes priority over offline (`navigator.onLine`) — if the
 * platform is down, that's the more relevant message.
 */
export function AppStatusOverlay() {
  const online = useOnlineStatus();
  const maintenance = appConfig.maintenance.enabled;

  if (!maintenance && online) return null;

  return <ClientPortal>{maintenance ? <MaintenanceOverlay /> : <OfflineOverlay />}</ClientPortal>;
}
