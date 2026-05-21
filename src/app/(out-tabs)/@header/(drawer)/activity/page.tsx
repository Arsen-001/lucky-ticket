import { PageHeader } from '@/components/layout-elements/PageHeader';
import { getAppTranslations } from '@/i18n/getAppTranslations';
import { routes } from '@/constants/routes';

export default async function ActivityHeader() {
  const t = await getAppTranslations();
  return <PageHeader title={t('activity points')} backRoute={routes.profile.index} />;
}
