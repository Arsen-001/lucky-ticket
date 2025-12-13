const localeKey = 'locale';

export const setLocaleLS = (locale: string) => localStorage.setItem(localeKey, locale);
export const getLocaleLS = () => localStorage.getItem(localeKey);
export const removeLocaleLS = () => localStorage.removeItem(localeKey);
