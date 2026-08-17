// EMAIL OFF (2026-08-17) — the folder is `_email`, and an underscore opts a
// folder and everything under it out of routing, so this screen is not reachable
// while the change-email flow is off (the backend answers 404 on
// `me/email/request-code` — SMTP is not configured). The file is kept verbatim,
// not deleted: renaming the two folders back to `email` and uncommenting the
// route in `constants/routes.ts` is the whole revival. Grep `EMAIL OFF`.
import { EmailVerificationContainer } from '@/components/pages/out-tabs/drawer/settings/email/EmailVerificationContainer';

export default function EmailPage() {
  return <EmailVerificationContainer />;
}
