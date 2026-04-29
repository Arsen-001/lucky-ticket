---
name: new-yup-schema
description: Scaffold a new Yup validation schema as a factory function that receives the t() translation dictionary, with all error messages localized. Use when adding a new form, splitting an existing schema, or migrating an unlocalized schema to follow project conventions.
---

# new-yup-schema

Add a Yup schema in `src/lib/yup/<name>.schemes.ts` following the project pattern.

## When to use

- "Create a schema for the X form"
- "Add validation for Y"
- New form is being introduced and `useForm({ resolver: yupResolver(...) })` is needed
- Existing schema has hardcoded English error messages

## The pattern

Schemas are **factory functions** that receive `t: Dictionary` and return a yup schema. This lets every validation message go through `next-intl`. Yup-resolved errors then surface on `FormItem` automatically.

```ts
import * as yup from 'yup';
import { GlobalConstants } from '@/constants/global.constants';
import type { Dictionary } from '@/types/types/i18n.types';

export const getProfileSchema = (t: Dictionary) =>
  yup.object({
    username: yup
      .string()
      .required(t('username required'))
      .min(3, t('min length is {num}', { num: 3 }))
      .max(24, t('max length is {num}', { num: 24 })),
    email: yup.string().required(t('email required')).email(t('invalid email')),
    password: yup
      .string()
      .required(t('password required'))
      .min(
        GlobalConstants.minPasswordLength,
        t('min length is {num}', { num: GlobalConstants.minPasswordLength })
      ),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], t('passwords must match'))
      .required(t('confirm password required')),
  });

export type ProfileFormValues = yup.InferType<ReturnType<typeof getProfileSchema>>;
```

## Usage at the call site

```tsx
const t = useAppTranslations();
const form = useForm<ProfileFormValues>({
  resolver: yupResolver(getProfileSchema(t)),
});

return (
  <Form form={form} onSubmit={onSubmit}>
    <FormItem name="username">
      <Input />
    </FormItem>
    <FormItem name="email">
      <Input />
    </FormItem>
    <FormItem name="password">
      <Input type="password" />
    </FormItem>
    <FormItem name="confirmPassword">
      <Input type="password" />
    </FormItem>
    <Button type="submit">{t('save')}</Button>
  </Form>
);
```

## Steps

1. Create the file at `src/lib/yup/<name>.schemes.ts`
2. Export the schema as `getXSchema(t: Dictionary)` — never as a static schema with English literals
3. Export an inferred form-values type via `yup.InferType<ReturnType<typeof getXSchema>>`
4. For magic numbers (lengths, limits), pull from `src/constants/global.constants.ts` — never hardcode
5. Add any new translation keys to `messages/en.json`, `messages/hy.json`, `messages/ru.json` (use the `sync-translations` skill)
6. Run `npm run type-check`

## Don'ts

- Don't write a static `export const schema = yup.object({...})` — always a factory
- Don't hardcode error strings — always `t(...)`
- Don't repeat keys like `'min length is {num}'` if they already exist in `en.json` — reuse them
- Don't put schemas anywhere except `src/lib/yup/`
