import type { SupportArticle, SupportSection } from '@/types/interfaces/support.interfaces';

const articles: SupportArticle[] = [
  {
    id: '1',
    sectionId: '1',
    title: 'Getting Started',
    description: 'Learn how to start playing and buying tickets.',
    content:
      'To start playing, you need to buy a ticket. The ticket price depends on the game you want to play. Buy a ticket and you will be able to play the game. You can also buy a ticket to play a game directly from the game page.',
  },
  {
    id: '2',
    sectionId: '1',
    title: 'Playing Games',
    description: 'Learn how to play games.',
    content:
      'Once you have bought a ticket, you can play the game. The game will start automatically and you will be able to make your moves. After the game is finished, you will receive your reward.',
  },
  {
    id: '3',
    sectionId: '2',
    title: 'Buying Tickets',
    description: 'Learn how to buy tickets.',
    content:
      'You can buy tickets from the shop or directly from a game page. The ticket price depends on the game you want to play. Make sure you have enough coins in your wallet before buying a ticket.',
  },
  {
    id: '4',
    sectionId: '2',
    title: 'Winning Rewards',
    description: 'Learn how to get reward from winning games.',
    content:
      'If you win a game, you will receive a reward in the form of coins. The reward amount depends on the game you played. The reward amount is displayed on the game result page.',
  },
  {
    id: '5',
    sectionId: '3',
    title: 'Tournaments',
    description: 'Learn how to participate in tournaments.',
    content:
      'Tournaments are special events where you can earn more rewards. Join a tournament to increase your chances of winning.',
  },
  {
    id: '6',
    sectionId: '3',
    title: 'Tournament Rules',
    description: 'Learn the rules of tournaments.',
    content:
      'Tournaments have specific rules that you need to follow. Make sure you read the rules carefully before participating in a tournament.',
  },
  {
    id: '7',
    sectionId: '3',
    title: 'Tournament Prizes',
    description: 'Learn about the prizes in tournaments.',
    content:
      'Tournaments have different prizes that you can win. Make sure you aim for the higher prizes to increase your chances of winning.',
  },
  {
    id: '8',
    sectionId: '3',
    title: 'Joining Tournaments',
    description: 'Learn how to join tournaments.',
    content:
      'To join a tournament, you need to meet the requirements. Make sure you have enough tickets and coins before joining a tournament.',
  },
  {
    id: '9',
    sectionId: '3',
    title: 'Tournament Timeline',
    description: 'Learn about the timeline of tournaments.',
    content:
      'Tournaments have a specific timeline that you need to follow. Make sure you check the timeline carefully before participating in a tournament.',
  },
  {
    id: '10',
    sectionId: '4',
    title: 'FAQs',
    description: 'Get answers to frequently asked questions.',
    content:
      'Here are some frequently asked questions. If you have a question that is not answered here, you can contact our support team.',
  },
];

const sections: SupportSection[] = [
  {
    id: '1',
    title: 'General Information',
    articles: articles
      .filter(article => article.sectionId === '1')
      .map(article => ({
        id: article?.id,
        title: article?.title,
        description: article?.description,
      })),
  },
  {
    id: '2',
    title: 'Tickets & Rewards',
    articles: articles
      .filter(article => article.sectionId === '2')
      .map(article => ({
        id: article?.id,
        title: article?.title,
        description: article?.description,
      })),
  },
  {
    id: '3',
    title: 'Tournaments',
    articles: articles
      .filter(article => article.sectionId === '3')
      .map(article => ({
        id: article?.id,
        title: article?.title,
        description: article?.description,
      })),
  },
  {
    id: '4',
    title: 'Help & FAQ',
    articles: articles
      .filter(article => article.sectionId === '4')
      .map(article => ({
        id: article?.id,
        title: article?.title,
        description: article?.description,
      })),
  },
];

export const supportMock = { articles, sections };
