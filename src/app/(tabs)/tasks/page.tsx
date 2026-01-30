'use client';
import { PremiumBonusInfo } from '@/components/pages/tabs/tasks/PremiumBonusInfo';
import { TasksContainer } from '@/components/pages/tabs/tasks/TasksContainer';

export default function TasksPage() {
  return (
    <div className="p-5">
      <PremiumBonusInfo />
      <TasksContainer />
    </div>
  );
}
