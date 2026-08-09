// AVATARS OFF (2026-08-09) — the avatar cosmetics feature is switched off for
// ~2 months, not removed. `TasksAvatarRewardCard` is the collect point for the
// equipped avatar's daily reward (DOCS §16.1); with the picker and the Market
// listing gone there is nothing to earn it with, so the card would only ever
// render for the handful of players who already own a paying avatar.
// Uncomment to bring it back — grep `AVATARS OFF` for the other sites.
// import { TasksAvatarRewardCard } from '@/components/pages/tabs/tasks/TasksAvatarRewardCard';
import { TasksContent } from '@/components/pages/tabs/tasks/TasksContent';

export default function TasksPage() {
  return (
    <>
      {/* AVATARS OFF — <TasksAvatarRewardCard className="pt-3" /> */}
      <TasksContent />
    </>
  );
}
