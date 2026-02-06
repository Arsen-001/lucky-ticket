# Lucky Ticket

## Official Product Documentation

---

## 1. Introduction

### 1.1 Product Name

**Lucky Ticket**

### 1.2 Product Type

Lucky Ticket is a multilingual, gamified reward platform with a built-in virtual economy and crypto exchange layer.

### 1.3 Purpose of the Document

This document describes Lucky Ticket as a complete product. It explains **what** each system is, **why** it exists, **how** users interact with it, and **how** it connects to other parts of the platform. The document is intended for product managers, developers, designers, QA engineers, and business stakeholders.

---

## 2. Product Overview

Lucky Ticket is designed to convert user activity into measurable value. By interacting with the app daily, users collect tickets, participate in tournaments, complete tasks, and earn Lucky Ticket Coins (LTC). These coins can be spent inside the ecosystem or exchanged for cryptocurrency.

The product combines:

- **Engagement mechanics:** Daily usage, streaks, decay
- **Progression systems:** Tickets, statuses, boosts
- **Competitive mechanics:** Tournaments, leaderboards
- **Monetization:** Market, status purchases, exchange offers

All systems are interconnected to encourage long-term retention and consistent activity.

---

## 3. Supported Platforms & Localization

### Purpose

Localization ensures global accessibility and higher user adoption across regions.

### Description

- Lucky Ticket is a web application.
- All user-facing content supports multiple languages.

### Usage

Users can change their language at any time via settings. Language choice affects UI text, tasks, support articles, and notifications.

---

## 4. User Account & Profile

### Purpose

The user account system uniquely identifies users, stores progress, and enables personalization, security, and monetization.

### 4.1 User Account

Each account includes:

- Unique username
- Optional email address or phone number
- Verification state

The account is required to participate in all platform activities.

### 4.2 User Profile

The profile represents the user publicly and internally. It contains:

- **Avatar:** Visual identity, which will be customizable via the Market in the future.
- **Activity Points:** Earned through engagement and used for rankings and VIP eligibility.
- **Lucky Ticket Coins (LTC):** The primary internal currency.
- **Current Status:** Verified, Prime, or VIP.
- **Personal Statistics:** Tracking performance across the platform.

The profile connects to the leaderboard, tournaments, Market, and social features.

---

## 5. Activity Points System

### Purpose

Activity Points measure engagement and consistency. They are used to rank users and to gate access to high-level features such as VIP status.

### Description

Activity Points increase when users perform meaningful actions and decrease during inactivity.

### 5.1 How Activity Points Are Earned

Users gain points through every action, including:

- Claiming tickets
- Completing tasks
- Participating in tournaments
- Changing or upgrading status
- Daily app usage

### 5.2 Activity Decay

If the user does not open the app, their activity status decreases:

- A fixed number of Activity Points is deducted for each day the app is not opened.
- This creates pressure for consistent engagement.

### Connections

- Leaderboard ranking
- VIP eligibility
- Overall user progression

---

## 6. Currency System

### Purpose

The currency system enables value exchange, monetization, and rewards.

### 6.1 Lucky Ticket Coins (LTC)

LTC is the internal currency earned through activity and rewards.

### Usage

LTC can be used to:

- Buy tickets
- Purchase boosts
- Upgrade statuses
- Exchange to cryptocurrency

### Connections

LTC connects all core systems: market, tournaments, exchange, tasks, and progression.

---

## 7. Status System

### Purpose

Statuses reward trust, loyalty, and engagement while enabling monetization and progression control.

### 7.1 Status Levels

| Status       | Description                                      | Duration     |
| :----------- | :----------------------------------------------- | :----------- |
| **Verified** | Identity confirmed via email or phone            | Permanent    |
| **Prime**    | Paid mid-tier status with benefits               | Time-limited |
| **VIP**      | High-tier status requiring activity and purchase | Time-limited |

### 7.2 Status Acquisition

- **Verified:** Identity confirmed via email or phone confirmation.
- **Prime:** Purchased via the Market (LTC or cryptocurrency).
- **VIP:** High-tier status available for purchase only if the required Activity Points threshold is met.

### 7.3 Status Benefits

Statuses grant various privileges, such as:

- Badge displayed aside the user's nickname
- Ticket claim boosts (speed and duration)
- Market/Shop discounts
- Tournament advantages
- Early or priority access to features

### Connections

Statuses influence market prices, claim efficiency, tournaments, and social visibility.

---

## 8. Ticket System

### Purpose

Tickets are the core progression and participation resource in Lucky Ticket.

### 8.1 Ticket Categories

- **Project Tickets:** Bronze, Silver, Gold, Diamond, Platinum.
- **Partner Tickets:** Required to participate in tournaments from partners (e.g., A-partner tournament can only be joined via having an A-ticket).

### 8.2 Ticket Rarities

- Bronze (Only Bronze tickets are available initially)
- Silver
- Gold
- Diamond
- Platinum

### 8.3 Ticket Unlocking

At first, only Bronze tickets are available. Higher-tier tickets are unlocked by meeting specific requirements:

- Claiming a required number of lower-tier tickets (e.g., Bronze)
- Inviting a certain number of friends
- Participating in a specific number of tournaments
- Maintaining daily activity (visiting every day during X consecutive days)
- Completing specific tasks

### Connections

Tickets connect claiming, tournaments, tasks, boosts, and market systems.

---

## 9. Ticket Claim Mechanics

### Purpose

Claim mechanics regulate pacing, fairness, and monetization opportunities.

### Description

Each ticket has two configurable claim parameters:

1.  **Claim Duration:** Defines the total time tickets can be collected before they can be claimed.
2.  **Claim Speed:** Defines the rate at which one ticket is generated.

### Usage & Examples

Users can boost both claim speed and duration to maximize efficiency.

- **Claim Speed Boost:** For example, if a Bronze ticket is normally claimed every 1 hour, a 200% speed boost reduces this to 30 minutes, allowing the user to claim two tickets in 1 hour.
- **Claim Duration Boost:** For example, increasing the collecting duration to 200% allows a user to wait longer (e.g., 2 hours instead of 1 hour) and claim more accumulated tickets (e.g., two tickets) at once.

Boosts and statuses modify both parameters. Users can claim as soon as a single ticket is generated, but the duration parameter defines the maximum accumulation limit.

### Connections

Claim mechanics directly interact with boosts, market purchases, and statuses.

---

## 10. Boost System

### Purpose

Boosts allow users to speed up progression and personalize their experience.

### Description

Boosts enhance ticket efficiency without breaking balance.

### Boost Types

- Claim speed boost
- Claim duration boost

### Acquisition

Boosts are obtained via:

- Market purchases
- Status-based privileges

Boosts are time-limited and may stack within defined constraints.

---

## 11. Tournament System

### Purpose

Tournaments introduce competition, excitement, and high-value rewards.

### 11.1 Tournament Categories

- Main Project Tournaments
- Partner Tournaments

Each tournament requires a specific ticket type.

### 11.2 Tournament Properties

Each tournament includes:

- **Name:** The title of the tournament.
- **Required Ticket:** The specific ticket type needed to join (Project or Partner).
- **Prize Pool:** The summary of all coins that will be distributed among winners.
- **Guaranteed:** An number of coins awarded to any Verified user who participates in the tournament.
- **Start Time:** The date and time when the tournament begins and winners are decided.
- **Team Size:** The total number of users participating in the tournament.

### 11.3 Participation & Winning Logic

- Users join by submitting one or more tickets.
- Winners are selected randomly from the pool of participants at the designated Start Time.
- **Probability:** Joining with more tickets increases the chance of winning.
- Verified users receive guaranteed rewards upon participation.

### Connections

Tournaments connect tickets, LTC rewards, tasks, and leaderboard positioning.

---

## 12. Task System

### Purpose

Tasks guide user behavior and introduce structured goals.

### 12.1 Task Categories

- Daily tasks
- Weekly tasks
- Monthly tasks

### 12.2 Task Structure

Each task contains:

- **Title:** A clear name for the task.
- **Description:** A detailed explanation of what the user needs to do.
- **Reward:** The prize awarded upon completion (tickets, coins, boosts).

### 12.3 Task Examples

Tasks guide user behavior and include actions such as:

- Inviting a certain amount of friends.
- Visiting specified websites or partner links.
- Joining a tournament.
- Sharing content on social media.
- Daily/Weekly/Monthly check-ins.

### Connections

Tasks drive activity, ticket acquisition, and retention.

---

## 13. Leaderboard

### Purpose

The leaderboard provides social comparison and competitive motivation.

### Description

- Global ranking based on Activity Points.
- Displays top users.

### Connections

Leaderboard ranking depends on activity, tasks, and tournaments.

---

## 14. Market System

### Purpose

The market is a central hub for purchasing improvements, resources, and statuses using internal or external currency.

### Sections

- **Boosts:** Purchase upgrades for each available ticket parameter (Claim Speed, Claim Duration).
- **Tickets:** Purchase project or partner tickets using LTC.
- **Statuses:** Purchase Prime or VIP status (VIP requires eligibility via Activity Points).

### Connections

The Market integrates with LTC, boosts, tickets, and statuses.

---

## 15. Exchange System

### Purpose

The Exchange system bridges virtual rewards and real-world value, allowing users to convert LTC to cryptocurrency and vice versa.

### Offer-Based Logic

- **Fixed Offers:** Only predefined exchange offers are allowed. For example, 100 LTC can be exchanged for 1 USDT.
- **No Partial Conversions:** Users cannot exchange amounts that do not match an active offer (e.g., if no offer exists for 50 LTC, a user cannot exchange 50 LTC for 0.5 USDT).

### Exchange History

After each exchange, the transaction details are recorded in the history log:

- **Type:** (e.g., LTC to USDT)
- **Amount:** The quantity exchanged.
- **Date:** Timestamp of the transaction.
- **Status:** (e.g., Completed, Pending, Failed).

---

## 16. Settings & Security

### Purpose

Settings provide control, security, and personalization for the user's account.

### Available Options

- **Two-Factor Authentication (2FA):** Enable extra security for the account.
- **Email Confirmation:** Confirm or change the linked email address.
- **Phone Confirmation:** Confirm or change the linked phone number.
- **Change Username:** Update the public display name.
- **Sign Out:** Securely log out of the application.

---

## 17. Additional Features

### 17.1 Support Section

Provides assistance through:

- **Articles:** Detailed guides on how to use the platform.
- **Language Selection:** Switch between supported languages.
- **Notifications:** Manage alerts for system events and rewards.

### 17.2 Invite Friends

Encourages growth through referral rewards. Users can track their invited friends and view details such as:

- Invited friend count.
- Friend's status (Verified, Prime, VIP).
- Friend's Activity Points.
- Friend's username and avatar.

**Referral Benefits:**

Users receive passive rewards based on the activity and earnings of their invited friends:

- **Earnings Commission:** The inviter receives a percentage of the LTC (coins) and tickets earned by their referrals (e.g., a base of 1% from their earnings).
- **Scaling with Status:** The percentage of the benefit increases if the invited friend has a higher status. Inviting users who upgrade to Prime or VIP results in a higher commission percentage compared to Verified friends.

### 17.3 Profile Page (Statistics)

A dedicated section where users can view their performance, transaction history, and detailed progression metrics.

---

## 18. Conclusion

Lucky Ticket is a modular, scalable product built around engagement, fairness, and real value creation. Each system reinforces the others, creating a cohesive ecosystem that rewards consistent participation and long-term loyalty.
