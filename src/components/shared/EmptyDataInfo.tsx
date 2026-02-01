import { Info, type InfoProps } from '@/components/shared/Info';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TextSearch } from 'lucide-react';

export function EmptyDataInfo(props: InfoProps) {
  const t = useAppTranslations();
  return (
    <Info
      icon={<TextSearch />}
      title={t('no results found')}
      description={t('no results description')}
      {...props}
    />
  );
}
