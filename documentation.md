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

- Avatar (visual identity, customizable in future)
- Activity Points
- Lucky Ticket Coins (LTC)
- Current status (Verified, Prime, VIP)
- Personal statistics

The profile connects to the leaderboard, tournaments, Market, and social features.

---

## 5. Activity Points System

### Purpose

Activity Points measure engagement and consistency. They are used to rank users and to gate access to high-level features such as VIP status.

### Description

Activity Points increase when users perform meaningful actions and decrease during inactivity.

### 5.1 How Activity Points Are Earned

Users gain points through:

- Claiming tickets
- Completing tasks
- Participating in tournaments
- Changing or upgrading status
- Daily app usage

### 5.2 Activity Decay

If the user does not open the app:

- A fixed number of Activity Points is deducted per inactive day.
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

- **Verified:** Email or phone confirmation.
- **Prime:** Purchased via market (LTC or real money).
- **VIP:** Available only if required Activity Points are met, then purchased.

### 7.3 Status Benefits

Statuses may grant:

- Badge next to username
- Ticket claim boosts
- Market discounts
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

Higher-tier tickets are unlocked by:

- Claiming a required number of lower-tier tickets
- Completing specific tasks
- Inviting friends
- Participating in tournaments
- Maintaining daily activity

### Connections

Tickets connect claiming, tournaments, tasks, boosts, and market systems.

---

## 9. Ticket Claim Mechanics

### Purpose

Claim mechanics regulate pacing, fairness, and monetization opportunities.

### Description

Each ticket has two configurable parameters:

1.  **Claim Duration:** Defines the period during which you cannot claim, allowing you to claim collected tickets at once after it expires.
2.  **Claim Speed:** Defines how quickly tickets are generated.

### Usage

Users can claim after every single ticket is generated. Claim Duration just defines how much time they must wait before claiming the accumulated tickets. Boosts and statuses modify both parameters.

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

- Name
- Required ticket
- Prize pool
- Guaranteed prize
- Start time
- Team size

### 11.3 Participation & Winning Logic

- Users join by submitting tickets.
- Winners are selected randomly at start time.
- Adding more tickets increases winning probability.
- Verified users receive guaranteed rewards.

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

- Title
- Description
- Reward

### 12.3 Task Rewards

Rewards may include:

- Tickets
- LTC coins
- Boosts

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

The market is the primary monetization hub.

### Sections

- **Boosts:** Claim speed boosts, Claim duration boosts.
- **Tickets:** Purchase tickets using LTC.
- **Statuses:** Purchase Prime, Purchase VIP (eligibility required).

### Connections

The market integrates with LTC, boosts, tickets, and statuses.

---

## 15. Exchange System

### Purpose

The exchange system bridges virtual rewards and real-world value.

### Exchange Types

- LTC to cryptocurrency and back

### Offer-Based Logic

- Only predefined exchange offers are allowed.
- Partial conversions are not permitted unless explicitly offered.

### Exchange History

All exchanges are logged with:

- Type
- Amount
- Date
- Status

---

## 16. Settings & Security

### Purpose

Settings provide control, security, and personalization.

### Available Options

- Two-factor authentication
- Email confirmation
- Phone confirmation
- Username change
- Sign out

---

## 17. Additional Features

### 17.1 Support

Provides help and guidance through articles and FAQs.

### 17.2 Notifications

Informs users about system events, rewards, and updates.

### 17.3 Invite Friends

### 17.4 Invite Friends

You can see your invited friend count, their statuses, activity points, username, and avatar. Encourages growth through referral rewards.

### 17.4 Profile Statistics

Displays performance, history, and progression metrics on the profile page.

---

## 18. Conclusion

Lucky Ticket is a modular, scalable product built around engagement, fairness, and real value creation. Each system reinforces the others, creating a cohesive ecosystem that rewards consistent participation and long-term loyalty.
