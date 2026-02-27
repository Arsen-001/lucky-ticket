# Lucky Ticket

Lucky Ticket is a multilingual, gamified reward platform with a built-in virtual economy and crypto exchange layer. Designed to convert user activity into measurable value, the platform allows users to collect tickets, participate in tournaments, complete tasks, and earn Lucky Ticket Coins (LTC), which can be spent within the ecosystem or exchanged for cryptocurrency.

## 🚀 Features

- **Gamified Rewards:** Daily ticket claims, activity points, and progression systems.
- **Tournament System:** Compete in project and partner tournaments with varied prize pools.
- **Virtual Economy:** Earn Lucky Ticket Coins (LTC) and use them in the Market or for crypto exchange.
- **Status Levels:** Progress through Verified, Prime, and VIP tiers, each offering unique benefits.
- **Referral System:** Invite friends and earn commissions based on their activity and status.
- **Multilingual Support:** Fully localized experience in English, Armenian (Հայերեն), and Russian (Русский).
- **Secure Account Management:** 2FA, email/phone verification, and personalized profile statistics.

## 🛠 Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) with [Yup](https://github.com/jquense/yup)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Components:** [Swiper](https://swiperjs.com/) for sliders, custom UI components.
- **Language:** [TypeScript](https://www.typescriptlang.org/)

## 📂 Project Structure

```text
├── messages/           # Localization JSON files (en, hy, ru)
├── public/             # Static assets
├── src/
│   ├── api/            # RTK Query API slices
│   ├── app/            # Next.js App Router (pages, layouts, groups)
│   ├── components/     # React components (pages, shared, layout)
│   ├── constants/      # App-wide constants and routes
│   ├── fonts/          # Local font configurations
│   ├── hooks/          # Custom React hooks
│   ├── i18n/           # Internationalization setup
│   ├── lib/            # Third-party library configurations (Redux store, etc.)
│   ├── mock/           # Mock data for development
│   ├── providers/      # React context providers
│   ├── services/       # Business logic and utility services
│   ├── styles/         # Global styles and Tailwind configuration
│   ├── types/          # TypeScript interfaces and types
│   └── utils/          # Helper functions
└── ... config files (next.config.ts, tsconfig.json, etc.)
```

## ⚙️ Requirements

- **Node.js:** 20.x or later
- **Package Manager:** npm (recommended), yarn, pnpm, or bun

## 🛠 Setup & Run

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd lucky-ticket
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Copy `.env.example` to `.env` and fill in the required values.

    ```bash
    cp .env.example .env
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

5.  **Build for production:**
    ```bash
    npm run build
    npm start
    ```

## 📜 Available Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the application for production.
- `npm run start` - Starts the production server.
- `npm run lint` - Runs ESLint to check for code quality issues.
- `npm run format` - Formats the codebase using Prettier.
- `npm run type-check` - Runs TypeScript compiler to check for type errors.
- `npm run clean` - Removes the `.next` build folder.
- `npm run rnm` - Removes the `node_modules` folder.
- `npm run prepare` - Sets up Husky git hooks.

## 🌐 Environment Variables

| Variable               | Description                                  | Default       |
| :--------------------- | :------------------------------------------- | :------------ |
| `NEXT_PUBLIC_ENV`      | Current environment (development/production) | `development` |
| `NEXT_PUBLIC_BASE_API` | Base URL for the backend API                 | -             |
| `NEXT_PUBLIC_APP_URL`  | Public URL of the application                | -             |

## 🧪 Testing

> [!IMPORTANT]
> TODO: Add automated tests (Unit, Integration, E2E). Playwright appears in dependencies but no tests are currently implemented.

## 🌍 Localization

The project uses `next-intl` for localization. Supported languages are:

- 🇺🇸 English (`en`) - Default
- 🇦🇲 Armenian (`hy`)
- 🇷🇺 Russian (`ru`)

Messages are stored in the `/messages` directory as JSON files.

## 📄 License

This project is private and proprietary.
_(TODO: Update with specific license if applicable)_
