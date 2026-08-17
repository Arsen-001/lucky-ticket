// EMAIL OFF (2026-08-17) — header slot of a screen that no longer routes; it is
// parked in a private folder (`_email`) alongside the page itself. Grep `EMAIL OFF`.
import { PageHeader } from '@/components/layout-elements/PageHeader';
import { getAppTranslations } from '@/i18n/getAppTranslations';
import { routes } from '@/constants/routes';

export default async function EmailHeader() {
  const t = await getAppTranslations();
  return <PageHeader title={t('change email')} backRoute={routes.settings.index} />;
}
