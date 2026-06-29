import { PageHeader } from '@/components/layout-elements/PageHeader';
import { getAppTranslations } from '@/i18n/getAppTranslations';

export default async function FaqHeader() {
  const t = await getAppTranslations();
  return <PageHeader title={t('faq')} />;
}
