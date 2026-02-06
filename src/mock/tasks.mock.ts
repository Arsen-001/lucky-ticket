import { TaskCategoryType, TaskType } from '@/types/enums/tasks.enums';
import { Task, type TasksResponse } from '@/types/interfaces/tasks.interfaces';
import { tournamentsMock } from '@/mock/tournaments.mock';

const DAILY_TASKS: Task[] = [
  {
    id: 'd1',
    type: TaskType.JOIN_TOURNAMENT,
    title: 'Join Daily Tournament',
    description: 'Participate in at least one daily tournament to earn your reward.',
    reward: '500 Coins',
    claimed: false,
    tournamentId: tournamentsMock.tournaments[1].id,
  },
  {
    id: 'd2',
    type: TaskType.VISIT,
    title: 'Visit Daily Market',
    description: 'Check out the new items in the Market today.',
    reward: '100 Coins',
    claimed: true,
    visitLink: 'https://lucky-ticket.com/market',
  },
  {
    id: 'd3',
    type: TaskType.SHARE,
    title: 'Share with friends',
    description: 'Share your progress with your friends on social media.',
    reward: '200 Coins',
    claimed: false,
    shareLink: 'https://lucky-ticket.com/share/progress',
  },
  {
    id: 'd4',
    type: TaskType.VISIT,
    title: 'Visit Discord',
    description: 'Join our community on Discord for latest updates.',
    reward: '300 Coins',
    claimed: false,
    visitLink: 'https://discord.gg/luckyticket',
  },
  {
    id: 'd5',
    type: TaskType.INVITE,
    title: 'Invite a Friend',
    description: 'Bring a friend to the game.',
    reward: '150 Coins',
    claimed: true,
  },
  {
    id: 'd6',
    type: TaskType.JOIN_TOURNAMENT,
    title: 'Play Silver Solo Cup',
    description: 'Join the Silver Solo Cup tournament.',
    reward: '400 Coins',
    claimed: false,
    tournamentId: tournamentsMock.tournaments[1].id,
  },
];

const WEEKLY_TASKS: Task[] = [
  {
    id: 'w1',
    type: TaskType.INVITE,
    title: 'Invite 3 Friends',
    description: 'Invite 3 new friends to join the platform this week.',
    reward: '2000 Coins',
    claimed: true,
  },
  {
    id: 'w2',
    type: TaskType.JOIN_TOURNAMENT,
    title: 'Win 5 Tournaments',
    description: 'Win at least 5 tournaments during this week.',
    reward: '5000 Coins',
    claimed: false,
    tournamentId: tournamentsMock.tournaments[0].id,
  },
  {
    id: 'w3',
    type: TaskType.SHARE,
    title: 'Share Weekly Result',
    description: 'Share your weekly leaderboard result with friends.',
    reward: '1000 Coins',
    claimed: false,
    shareLink: 'https://lucky-ticket.com/share/weekly',
  },
  {
    id: 'w4',
    type: TaskType.VISIT,
    title: 'Visit Weekly Special',
    description: 'Check out the weekly special offer.',
    reward: '800 Coins',
    claimed: true,
    visitLink: 'https://lucky-ticket.com/weekly-special',
  },
  {
    id: 'w5',
    type: TaskType.JOIN_TOURNAMENT,
    title: 'Participate in 3 Tournaments',
    description: 'Join 3 tournaments of any type.',
    reward: '1200 Coins',
    claimed: false,
    tournamentId: tournamentsMock.tournaments[2].id,
  },
];

const MONTHLY_TASKS: Task[] = [
  {
    id: 'm1',
    type: TaskType.INVITE,
    title: 'Invite 10 Friends',
    description: 'Invite 10 new friends to join the platform this month.',
    reward: '10000 Coins',
    claimed: true,
  },
  {
    id: 'm2',
    type: TaskType.VISIT,
    title: 'Monthly Check-in',
    description: 'Visit the app for 20 days this month.',
    reward: '1500 Coins',
    claimed: false,
    visitLink: 'https://lucky-ticket.com/check-in',
  },
  {
    id: 'm3',
    type: TaskType.JOIN_TOURNAMENT,
    title: 'Join Diamond Tournament',
    description: 'Participate in the elite Diamond Tournament.',
    reward: '20000 Coins',
    claimed: false,
    tournamentId: tournamentsMock.tournaments[5].id,
  },
  {
    id: 'm4',
    type: TaskType.SHARE,
    title: 'Monthly Achievement',
    description: 'Share your monthly achievement on Twitter.',
    reward: '2500 Coins',
    claimed: false,
    shareLink: 'https://twitter.com/intent/tweet?text=I%20hit%20my%20monthly%20goal!',
  },
  {
    id: 'm5',
    type: TaskType.INVITE,
    title: 'Refer a Pro',
    description: 'Invite a professional player.',
    reward: '5000 Coins',
    claimed: false,
  },
];

const calculateProgress = (tasks: Task[]) => {
  if (!tasks.length) return 0;
  const completedTasks = tasks.filter(task => task.claimed).length;
  return Math.round((completedTasks / tasks.length) * 100);
};

export const tasksMock: { tasks: TasksResponse } = {
  tasks: {
    [TaskCategoryType.DAILY]: {
      items: DAILY_TASKS,
      progress: calculateProgress(DAILY_TASKS),
    },
    [TaskCategoryType.WEEKLY]: {
      items: WEEKLY_TASKS,
      progress: calculateProgress(WEEKLY_TASKS),
    },
    [TaskCategoryType.MONTHLY]: {
      items: MONTHLY_TASKS,
      progress: calculateProgress(MONTHLY_TASKS),
    },
  },
};
