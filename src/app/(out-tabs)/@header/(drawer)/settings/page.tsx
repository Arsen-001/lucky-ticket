import { PageHeader } from '@/components/layout-elements/PageHeader';
import { getAppTranslations } from '@/i18n/getAppTranslations';
import { routes } from '@/constants/routes';

export default async function SettingsHeader() {
  const t = await getAppTranslations();
  return <PageHeader backRoute={routes.home} title={t('settings')} />;
}
