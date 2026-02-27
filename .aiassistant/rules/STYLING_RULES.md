---
apply: by model decision
---

: src/\*_/_.{ts,tsx,scss,css}

Rules:

- type must remain unchanged unless explicitly specified
- pattern must target the intended file scope
- Do not add extra metadata fields unless requested

–

# Styling Rules

## Project Styles

- Project-wide styles and global CSS definitions are located in `/src/styles`.
- Directory structure:
  - `/src/styles/global/`: Contains base layers, theme variables, custom utilities, and animations.
    - `theme.css`: Defines CSS variables for colors, gradients, and other theme tokens using Tailwind's `@theme`.
    - `utilities.css`: Custom utility classes (e.g., `flex-center`, `scrollbar-hidden`, `card-outlined`) defined with `@utility`.
    - `animations.css`: Keyframes and animation utilities (e.g., `fade-in`, `slide-in-bottom`) using `@theme`.
    - `base-layer.css`: Base styles and overrides.
  - `/src/styles/components/`: Component-specific styles (e.g., `avatar.css`, `skeleton.css`).
  - `index.css`: Main entry point importing all style files.

## Utilities

- Prefer using custom utility classes defined in `src/styles/global/utilities.css` for common layout patterns.
- Key utilities available:
  - `flex-center`: Combines `flex`, `items-center`, and `justify-center`.
  - `scrollbar-hidden`: Hides scrollbars while maintaining scroll functionality.
  - `card-outlined`: Adds a custom gradient border effect.
  - `bg-pink-gradient`, `bg-purple-gradient`: Pre-defined background gradients.

## Animations

- Use predefined animations from `src/styles/global/animations.css`.
- Standard animations include:
  - `animate-fade-in`: Smooth opacity transition.
  - `animate-slide-in-bottom`: Slide up with fade-in effect.
  - `animate-fill`: Used for loading states.
- Animations are configured within the Tailwind theme and can be used as standard Tailwind classes.

## Naming

- Use descriptive names for Tailwind classes or custom CSS variables.
- Custom utilities should follow Tailwind-like naming conventions (e.g., `flex-center`).

## Style

- Use Tailwind CSS v4 utility classes for styling by default.
- Utilize the `@theme` and `@utility` directives for defining custom design tokens and helpers.
- Use `tailwind-merge` (`twMerge`) or `clsx` when combining conditional classes.
- Prefer inline Tailwind classes for simple components.
- Use `classNames` prop for passing nested style overrides to shared components.
- Follow a consistent order for Tailwind classes: layout -> spacing -> typography -> visual -> interactive.
- Use project-specific design tokens (e.g., `text-gold`, `bg-white/5`).

## Tools

- Use Prettier for automatic code formatting.
- Use ESLint for static code analysis.
