'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/rtk/hooks';
import {
  releaseAutoSurface,
  requestAutoSurface,
  selectAutoSurface,
  type AutoSurfaceId,
} from '@/lib/rtk/features/layout.slice';

/**
 * Take a turn at the one screen the app-open popups share.
 *
 * Without it, two watchers mounted in different layouts each opened their own
 * `aria-modal` dialog on top of the other — measured on the tabs layout with a
 * `modal` notification waiting and an unseen tournament result: two dialogs in
 * the DOM at once, the lower one unreachable.
 *
 * Pass whether this popup has something to show; the return value is whether it
 * may show it now. A popup that yields is not cancelled — it opens as soon as
 * the one ahead of it closes.
 */
export function useAutoSurfaceSlot(id: AutoSurfaceId, wants: boolean): boolean {
  const dispatch = useAppDispatch();
  const active = useAppSelector(selectAutoSurface);

  useEffect(() => {
    dispatch(wants ? requestAutoSurface(id) : releaseAutoSurface(id));
  }, [dispatch, id, wants]);

  // Leaving the screen must free the slot, or the next popup waits forever.
  useEffect(() => () => void dispatch(releaseAutoSurface(id)), [dispatch, id]);

  return wants && active === id;
}
