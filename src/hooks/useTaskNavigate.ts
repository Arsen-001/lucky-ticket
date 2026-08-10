'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Route } from '@/constants/routes';
import { openExternalUrl } from '@/lib/telegram/telegram';
import type { Task } from '@/types/interfaces/tasks.interfaces';
import { resolveTaskDestination } from '@/utils/pages/task-destination.utils';

/**
 * «Открой то, что задача просит сделать» — one navigation for every shape a task
 * card takes (full card, compact tile, row, milestone slide), so a tap behaves
 * the same wherever the task is drawn.
 *
 * Returns `false` when the task leads nowhere, which is the caller's cue to fall
 * back to its own behaviour (expand the row, toggle the accordion) instead of
 * swallowing the tap.
 */
export function useTaskNavigate() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (task: Task): boolean => {
    const destination = resolveTaskDestination(task);

    if (destination) {
      const query = searchParams?.toString();
      const current = `${pathname}${query ? `?${query}` : ''}`;
      if (destination === current) {
        // Pushing the URL the player is already on is a no-op: no navigation, no
        // re-render, no effect re-run — the tap reads as broken. `?task=` is the
        // param the tasks screen already understands (it shines that card), so
        // it makes the URL unique AND points at what was tapped.
        const separator = destination.includes('?') ? '&' : '?';
        const marked = `${destination}${separator}task=${encodeURIComponent(task.id)}` as Route;
        if (marked !== current) router.push(marked);
        return true;
      }
      router.push(destination);
      return true;
    }

    if (task.externalLink) {
      openExternalUrl(task.externalLink);
      return true;
    }

    return false;
  };
}
