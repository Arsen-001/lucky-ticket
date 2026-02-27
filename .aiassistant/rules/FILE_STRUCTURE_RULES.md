---
apply: by model decision
instructions: Play rule when
---

–

# File Structure Rules

## Naming

- Use existing folder names and known typos exactly as they appear in the codebase.
- Keep file names in kebab-case with appropriate suffixes.
- Keep component files in PascalCase.

## Style

- Keep each module focused and co-locate related files within the same feature folder.
- Avoid deep relative imports by using the established aliases.

## Structure

- Place App Router routes and layouts only under `src/app`.
- Keep route-level UI thin and delegate feature UI to `src/components/pages`.
- Put reusable UI primitives in `src/components/shared`.
- Keep layout-specific UI in `src/components/layout-elements`.
- Organize feature UI under `src/components/pages/*` and tab-specific UI under `pages/tabs/*`.
- Define RTK Query slices and endpoints under `src/api`.
- Keep application providers in `src/providers`.
- Put reusable hooks in `src/hooks` and typed RTK hooks in `src/lib/rtk`.
- Keep schemas in `src/lib/yup`.
- Store static assets in `public/assets/*` and fonts in `src/fonts`.
- Place constants in `src/constants`.
- Keep shared types in `src/types` organized by `enums`, `interfaces`, and `types`.
- Put utilities in `src/utils`, grouped under `global` or `pages`.
- Keep mock data and handlers in `src/mock`.
- Keep i18n setup in `src/i18n` and messages in `messages`.
- Keep styles in `src/styles` with component-level CSS under `styles/components`.

## Best Practices

- Prefer existing folders over creating new top-level directories.
- Add new files to the closest matching folder instead of creating ad-hoc locations.
- Avoid mixing page-specific code into shared directories.

## Documentation

- Update project documentation when adding new top-level folders or patterns.

## Tools

- Use `rg --files` to locate appropriate placement before creating new files.
