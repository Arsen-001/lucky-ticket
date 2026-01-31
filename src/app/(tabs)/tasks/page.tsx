'use client';
import { PremiumBonusInfo } from '@/components/pages/tabs/tasks/PremiumBonusInfo';
import { TasksContainer } from '@/components/pages/tabs/tasks/TasksContainer';

export default function TasksPage() {
  return (
    <div className="p-5">
      <PremiumBonusInfo className="animate-slide-in-bottom" style={{ animationDelay: '0ms' }} />
      <TasksContainer className="animate-slide-in-bottom" style={{ animationDelay: '100ms' }} />
    </div>
  );
}
