'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs } from '@/components/shared/Tabs';
import { Task } from '@/types/interfaces/tasks.interfaces';
import { TaskCategoryType, TaskType } from '@/types/enums/tasks.enums';
import { useGetTasksQuery } from '@/api/tasks.api';
import { TaskList } from './TaskList';
import { TaskModal } from './TaskModal';
import { ShareModal } from './ShareModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';

export function TasksContainer() {
  const t = useAppTranslations();
  const router = useRouter();
  const { data: tasks, isLoading } = useGetTasksQuery();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleTaskAction = (task: Task) => {
    switch (task.type) {
      case TaskType.SHARE:
        setIsShareModalOpen(true);
        setIsTaskModalOpen(false);
        break;
      case TaskType.JOIN_TOURNAMENT:
        if (task.tournamentId) {
          router.push(routes.tournaments.tournamentById(task.tournamentId));
          setIsTaskModalOpen(false);
        }
        break;
      case TaskType.VISIT:
        if (task.visitLink) {
          window.open(task.visitLink, '_blank');
        }
        break;
      case TaskType.INVITE:
        router.push(routes.inviteFriends);
        setIsTaskModalOpen(false);
        break;
      default:
        console.log('Completing task:', task.title);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const tabItems = [
    {
      key: 'daily',
      title: t('daily'),
      children: (
        <TaskList
          tasks={tasks?.daily.items || []}
          progress={tasks?.daily.progress || 0}
          category={TaskCategoryType.DAILY}
          isLoading={isLoading}
          onAction={handleTaskAction}
          onClick={handleTaskClick}
        />
      ),
    },
    {
      key: 'weekly',
      title: t('weekly'),
      children: (
        <TaskList
          tasks={tasks?.weekly.items || []}
          progress={tasks?.weekly.progress || 0}
          category={TaskCategoryType.WEEKLY}
          isLoading={isLoading}
          onAction={handleTaskAction}
          onClick={handleTaskClick}
        />
      ),
    },
    {
      key: 'monthly',
      title: t('monthly'),
      children: (
        <TaskList
          tasks={tasks?.monthly.items || []}
          progress={tasks?.monthly.progress || 0}
          category={TaskCategoryType.MONTHLY}
          isLoading={isLoading}
          onAction={handleTaskAction}
          onClick={handleTaskClick}
        />
      ),
    },
  ];

  return (
    <div className="bg-purple-gradient rounded-2xl p-5 mt-5">
      <Tabs items={tabItems} />

      <TaskModal
        task={selectedTask}
        open={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onAction={handleTaskAction}
      />

      <ShareModal open={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
    </div>
  );
}
