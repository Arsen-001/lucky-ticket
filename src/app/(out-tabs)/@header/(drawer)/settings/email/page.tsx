import { PageHeader } from '@/components/layout-elements/PageHeader';
import { getAppTranslations } from '@/i18n/getAppTranslations';
import { routes } from '@/constants/routes';

export default async function EmailHeader() {
  const t = await getAppTranslations();
  return <PageHeader title={t('change email')} backRoute={routes.settings.index} />;
}
