import { getAppTranslations } from '@/i18n/getAppTranslations';
import '@/styles/components/loading.css';

export default async function Loading() {
  const t = await getAppTranslations();
  return (
    <div className="h-full flex-center">
      <div className="loader">{t('loading')}</div>
    </div>
  );
}
