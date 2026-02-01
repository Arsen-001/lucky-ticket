export const stringCompare = (str1: string, str2: string) => {
  return str1.toLowerCase() === str2.toLowerCase();
};

export const stringIncludes = (str: string, search: string) => {
  return str.toLowerCase().includes(search.toLowerCase());
};

export const stringStartsWith = (str: string, search: string) => {
  return str.toLowerCase().startsWith(search.toLowerCase());
};
