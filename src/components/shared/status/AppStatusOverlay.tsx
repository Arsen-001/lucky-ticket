'use client';

import { ClientPortal } from '@/components/shared/ClientPortal';
import { appConfig } from '@/config/app.config';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useAppSelector } from '@/lib/rtk/hooks';
import { selectBanned } from '@/lib/rtk/features/ban.slice';
import { selectServerMaintenance } from '@/lib/rtk/features/maintenance.slice';
import { BannedOverlay } from './BannedOverlay';
import { MaintenanceScreen } from './MaintenanceScreen';
import { OfflineOverlay } from './OfflineOverlay';

/**
 * Mounts the blocking status overlays once in the root layout. Banned (the
 * backend's 403 'BANNED') takes priority over everything — it's about this
 * account, not the platform. Maintenance (the backend's 503 MaintenanceGuard,
 * or the local config override) takes priority over offline
 * (`navigator.onLine`) — if the platform is down, that's the more relevant
 * message.
 *
 * This is the MID-SESSION half of maintenance only: a shutdown that was already
 * on when the app opened never gets here, because the app does not boot at all
 * (@see PreLaunchGate). Same screen either way.
 */
export function AppStatusOverlay() {
  const online = useOnlineStatus();
  const banned = useAppSelector(selectBanned);
  const serverDown = useAppSelector(selectServerMaintenance);
  const maintenance = appConfig.maintenance.enabled || serverDown;

  if (!banned && !maintenance && online) return null;

  return (
    <ClientPortal>
      {banned ? <BannedOverlay /> : maintenance ? <MaintenanceScreen /> : <OfflineOverlay />}
    </ClientPortal>
  );
}
