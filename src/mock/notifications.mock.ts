import { Notification } from '@/types/interfaces/notifications.interfaces';
import { routes } from '@/constants/routes';

const now = new Date();
const today = new Date(now);
const yesterday = new Date(now);
yesterday.setDate(now.getDate() - 1);
const older = new Date(now);
older.setDate(now.getDate() - 3);
const older2 = new Date(now);
older2.setDate(now.getDate() - 5);
const older3 = new Date(now);
older3.setDate(now.getDate() - 10);
const older4 = new Date(now);
older4.setDate(now.getDate() - 15);
const older5 = new Date(now);
older5.setDate(now.getDate() - 20);

const notifications = (
  [
    {
      id: '1',
      type: 'system',
      title: 'Welcome to LuckyTicket365!',
      content:
        'Welcome to LuckyTicket365! We are glad to have you on board. Let us know if you have any questions or need assistance.',
      read: false,
      date: today.toISOString(),
    },
    {
      id: '2',
      type: 'tournament',
      title: 'New Tournament Available',
      content: 'The Diamond Solo Cup is now open for registration. Join now!',
      read: false,
      date: yesterday.toISOString(),
      actionRoute: routes.tournaments.index,
    },
    {
      id: '3',
      type: 'leaderboard',
      title: 'Weekly Leaderboard Result',
      content: 'You have reached the 3rd place in the weekly leaderboard.',
      read: true,
      date: yesterday.toISOString(),
      actionRoute: routes.leaderboard,
    },
    {
      id: '4',
      type: 'system',
      title: 'System Maintenance',
      content: 'The system will be down for maintenance tomorrow from 2 AM to 4 AM UTC.',
      read: false,
      date: yesterday.toISOString(),
    },
    {
      id: '5',
      type: 'friend',
      title: 'Friend reward ready',
      content: 'You have new claimable tickets from a friend. Tap to collect.',
      read: true,
      date: older.toISOString(),
      actionRoute: routes.inviteFriends,
    },
    {
      id: '6',
      type: 'tournament',
      title: 'Tournament Participation',
      content: 'You have successfully registered for the Golden Solo Cup.',
      read: false,
      date: older2.toISOString(),
      actionRoute: routes.tournaments.index,
    },
    {
      id: '7',
      type: 'reward',
      title: 'Tournament Result',
      content: 'You have won the Silver Solo Cup. Congratulations!',
      read: true,
      date: older2.toISOString(),
      actionRoute: routes.wallet,
    },
    {
      id: '8',
      type: 'tournament',
      title: 'Tournament Invitation',
      content: 'You have been invited to join the Platinum Solo Cup.',
      read: true,
      date: older3.toISOString(),
      actionRoute: routes.tournaments.index,
    },
    {
      id: '9',
      type: 'task',
      title: 'Weekly Task Completion',
      content: 'You have completed the weekly task "Join 5 Tournaments".',
      read: false,
      date: older3.toISOString(),
      actionRoute: routes.tasks,
    },
    {
      id: '10',
      type: 'task',
      title: 'Monthly Task Completion',
      content: 'You have completed the monthly task "Refer 10 Friends".',
      read: true,
      date: older3.toISOString(),
      actionRoute: routes.tasks,
    },
    {
      id: '11',
      type: 'stake',
      title: 'Stake Ready to Claim',
      content: 'Your Level 2 stake is ready. Claim your rewards now.',
      read: false,
      date: older4.toISOString(),
      actionRoute: routes.stakes.index,
    },
    {
      id: '12',
      type: 'tournament',
      title: 'Tournament Participation Reminder',
      content: 'Reminder: You have an upcoming tournament. Do not miss it!',
      read: true,
      date: older5.toISOString(),
      actionRoute: routes.tournaments.index,
    },
  ] satisfies Notification[]
).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const notificationsMock = { notifications };
