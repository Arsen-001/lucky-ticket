export const startsWithDynamic = (pattern: string, pathname: string) => {
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');

  if (patternParts.length > pathParts.length) return false;

  return patternParts.every((part, i) =>
    part.startsWith('[') && part.endsWith(']') ? true : part === pathParts[i]
  );
};

export const matchDynamic = (pattern: string, pathname: string) => {
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');

  if (patternParts.length !== pathParts.length) return false;

  return patternParts.every((part, i) =>
    part.startsWith('[') && part.endsWith(']') ? true : part === pathParts[i]
  );
};
