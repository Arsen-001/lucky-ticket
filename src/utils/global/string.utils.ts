export const stringCompare = (str1: string, str2: string) => {
  return str1.toLowerCase() === str2.toLowerCase();
};

export const stringIncludes = (str: string | string[], search: string) => {
  if (typeof str === 'string') {
    return str.toLowerCase().includes(search.toLowerCase());
  }

  if (Array.isArray(str)) {
    return str.some(s => s.toLowerCase().includes(search.toLowerCase()));
  }
  return false;
};

export const stringStartsWith = (str: string, search: string) => {
  return str.toLowerCase().startsWith(search.toLowerCase());
};
