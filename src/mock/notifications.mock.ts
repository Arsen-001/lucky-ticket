import { Notification } from '@/types/interfaces/notifications.interfaces';

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

const notifications: Notification[] = [
  {
    id: '1',
    title: 'Welcome to Lucky Ticket!',
    content:
      'Welcome to Lucky Ticket! We are glad to have you on board. Let us know if you have any questions or need assistance.',
    read: false,
    date: today.toISOString(),
  },
  {
    id: '2',
    title: 'New Tournament Available',
    content: 'The Diamond Solo Cup is now open for registration. Join now!',
    read: false,
    date: yesterday.toISOString(),
  },
  {
    id: '3',
    title: 'Weekly Leaderboard Result',
    content: 'You have reached the 3rd place in the weekly leaderboard.',
    read: true,
    date: yesterday.toISOString(),
  },
  {
    id: '4',
    title: 'System Maintenance',
    content: 'The system will be down for maintenance tomorrow from 2 AM to 4 AM UTC.',
    read: false,
    date: yesterday.toISOString(),
  },
  {
    id: '5',
    title: 'Friend Request',
    content: 'User "ProGamer" wants to be your friend.',
    read: true,
    date: older.toISOString(),
  },
  {
    id: '6',
    title: 'Tournament Participation',
    content: 'You have successfully registered for the Golden Solo Cup.',
    read: false,
    date: older2.toISOString(),
  },
  {
    id: '7',
    title: 'Tournament Result',
    content: 'You have won the Silver Solo Cup. Congratulations!',
    read: true,
    date: older2.toISOString(),
  },
  {
    id: '8',
    title: 'Tournament Invitation',
    content: 'You have been invited to join the Platinum Solo Cup.',
    read: true,
    date: older3.toISOString(),
  },
  {
    id: '9',
    title: 'Weekly Task Completion',
    content: 'You have completed the weekly task "Join 5 Tournaments".',
    read: false,
    date: older3.toISOString(),
  },
  {
    id: '10',
    title: 'Monthly Task Completion',
    content: 'You have completed the monthly task "Refer 10 Friends".',
    read: true,
    date: older3.toISOString(),
  },
  {
    id: '11',
    title: 'Monthly Task Completion',
    content: 'You have completed the monthly task "Visit the App for 20 Days".',
    read: false,
    date: older4.toISOString(),
  },
  {
    id: '12',
    title: 'Tournament Participation Reminder',
    content: 'Reminder: You have an upcoming tournament. Do not miss it!',
    read: true,
    date: older5.toISOString(),
  },
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const notificationsMock = { notifications };
