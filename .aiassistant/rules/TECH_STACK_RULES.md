---
apply: by model decision
---

type: always on
pattern: package.json

–

# Tech Stack & Dependency Management

## Core Stack

- Next.js 16 (React 19)
- TypeScript 5
- Tailwind CSS 4
- Redux Toolkit (@reduxjs/toolkit)
- next-intl for internationalization
- lucide-react for icons
- react-hook-form with yup and @hookform/resolvers
- swiper for carousels
- tailwind-merge for class name manipulation

## Dependency Policy

- LLM must always ask for user permission before adding any new dependency to `package.json`
- Prefer built-in solutions or existing stack over adding new libraries
- Use `--save-exact` or equivalent if possible when instructed to add (after permission)
- Check for compatibility with React 19 and Next.js 16 before proposing a new package

## Tooling

- ESLint for linting
- Prettier for formatting
- Husky and lint-staged for pre-commit hooks
- TypeScript for static type checking
