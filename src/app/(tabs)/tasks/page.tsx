import { TasksAvatarRewardCard } from '@/components/pages/tabs/tasks/TasksAvatarRewardCard';
import { TasksContent } from '@/components/pages/tabs/tasks/TasksContent';

export default function TasksPage() {
  return (
    <>
      <TasksAvatarRewardCard className="pt-3" />
      <TasksContent />
    </>
  );
}
