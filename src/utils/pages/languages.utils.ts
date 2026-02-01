import { type Language } from '@/hooks/useGetAvailableLanguages';
import { stringIncludes } from '@/utils/global/string.utils';

export const filterLanguages = (languages: Language[], searchValue: string): Language[] => {
  return languages.filter(lang => stringIncludes([lang.name, lang.nativeName], searchValue));
};
