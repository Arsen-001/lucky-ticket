'use client';
import { PremiumBonusInfo } from '@/components/pages/tabs/tasks/PremiumBonusInfo';
import { TasksContainer } from '@/components/pages/tabs/tasks/TasksContainer';

export default function TasksPage() {
  return (
    <div className="h-full overflow-hidden inset-container-background">
      <div className="h-full overflow-auto p-5 scrollbar-hidden">
        <PremiumBonusInfo />
        <TasksContainer />
      </div>
    </div>
  );
}
