---
name: new-modal
description: Scaffold a new modal/sheet component using the project's portal + inert + ConfirmModal/Modal conventions. Use when adding a confirmation dialog, info modal, share sheet, claim flow, etc. Avoids the common bugs around inert={false}, missing aria-hidden, focus trap, and incorrect portal target.
---

# new-modal

Scaffold a modal that follows the project's conventions for portals, animations, and accessibility.

## When to use

- "Add a modal for X"
- "Build a confirmation dialog"
- "Create a sheet that opens when ..."
- Any UI piece that overlays content and traps user attention

## Decide which base to use

- **Reusing an existing primitive**:
  - Confirm-style yes/no flow → wrap `ConfirmModal`
  - Notification/info → wrap `NotificationModal`
- **Custom layout** → wrap the base `Modal` from `src/components/shared/modals/Modal.tsx` (uses `ClientPortal` to `#portal-root`)

Always wrap rather than fork — Modal/ConfirmModal already handle portal, animations, and `inert` correctly.

## Template — custom modal

```tsx
'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface FooModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  className?: string;
}

export function FooModal({ open, onClose, onConfirm, className }: FooModalProps) {
  const t = useAppTranslations();
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} className={twMerge('flex flex-col gap-4 p-6', className)}>
      <h2 className="text-xl font-bold text-white">{t('foo title')}</h2>
      <p className="text-white-secondary">{t('foo description')}</p>
      <div className="flex gap-2">
        <Button variant="transparent" onClick={onClose} className="flex-available">
          {t('cancel')}
        </Button>
        <Button
          variant="primary"
          loading={submitting}
          onClick={handleConfirm}
          className="flex-available"
        >
          {t('confirm')}
        </Button>
      </div>
    </Modal>
  );
}
```

## Rules

- **Always pass `open` and `onClose`** — both are required for proper inert/animation behavior
- **Never render conditionally** at the parent (don't `{open && <FooModal />}`) — pass `open` as a prop. The base modal manages mount/unmount internally to keep exit animations
- **Use `inert={!open ? true : undefined}`** if you build a custom overlay — never `inert={false}` (React strips false booleans)
- **Localize every string** with `useAppTranslations`
- **No manual focus trapping** — the Modal primitive handles it
- **No state stored in the modal that survives close** — assume modals can be unmounted on close. Move long-lived state up
- **Mutations triggered from a modal**:
  - Use the RTK Query mutation's `isLoading` for the button's `loading` prop
  - Close the modal in the success path
  - Show errors via the `Form`'s `errorMessage` prop (if there's a form) or via `NotificationModal`

## Steps

1. Decide base: `ConfirmModal` / `NotificationModal` / `Modal`
2. Place the file:
   - Reusable across pages → `src/components/shared/modals/`
   - Page-specific → `src/components/pages/<route-group>/<route>/`
3. Define props: at minimum `open`, `onClose`, plus action handlers
4. Wire any RTK Query mutations and handle their loading/error states
5. Localize all visible strings
6. Run `npm run type-check`

## Don'ts

- Don't use raw `react-dom/createPortal` — use `ClientPortal` (or just use `Modal`)
- Don't add a backdrop element manually — `Modal` handles it
- Don't animate via JS (`useEffect` + `setTimeout`) — modal animations are CSS-driven
- Don't hardcode the z-index — `Modal` already places itself above the header (z-50)
