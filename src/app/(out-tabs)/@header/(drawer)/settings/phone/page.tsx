import { PageHeader } from '@/components/layout-elements/PageHeader';
import { getAppTranslations } from '@/i18n/getAppTranslations';
import { routes } from '@/constants/routes';

export default async function PhoneHeader() {
  const t = await getAppTranslations();
  return <PageHeader title={t('change phone')} backRoute={routes.settings.index} />;
}
