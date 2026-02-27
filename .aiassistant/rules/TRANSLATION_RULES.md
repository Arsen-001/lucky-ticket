---
apply: by model decision
---

–

# Translation and Internationalization Rules

## Structure

- Localization files must be stored in the `messages/` directory.
- Use flat JSON structure for keys unless namespaces are explicitly required for organization.
- Keys should be descriptive, lowercase, and use spaces or hyphens as delimiters.

## Naming

- Translation keys should reflect the English content or the semantic purpose (e.g., "sign in", "error-invalid-email").
- Avoid using camelCase or PascalCase for translation keys in JSON files.

## Style

- Use `useAppTranslations` hook for accessing translations in React components.
- Prefer `useAppTranslations` over the base `useTranslations` from `next-intl`.
- Use ICU message format for pluralization and variables (e.g., "Min length is {num}").

## Best Practices

- Ensure all user-facing strings are externalized to localization files.
- Keep all supported language files located in `messages/*` synchronized with the same set of keys.
- Do not hardcode strings in components; use translation keys even for short labels.
- For dynamic content with placeholders, use descriptive variable names within curly braces.

## Tools

- Use `next-intl` as the primary internationalization framework.
- Type safety for translations should be maintained via `Dictionary` type in `src/hooks/useAppTranslations.ts`.
