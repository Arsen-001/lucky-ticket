import { PageHeader } from '@/components/layout-elements/PageHeader';
import { getAppTranslations } from '@/i18n/getAppTranslations';
import { routes } from '@/constants/routes';

export default async function SecurityHeader() {
  const t = await getAppTranslations();
  return <PageHeader title={t('security')} backRoute={routes.settings.index} />;
}
