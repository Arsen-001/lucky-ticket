import { usePathname } from 'next/navigation';
import { matchDynamic, startsWithDynamic } from '@/utils/global/pathname.utils';

export function useLocation() {
  const pathname = usePathname();

  const startWith = (prefix: string) => {
    return startsWithDynamic(pathname, prefix);
  };
  const matchPathname = (prefix: string) => {
    return matchDynamic(pathname, prefix);
  };
  const getPathPart = (part: number) => '/' + pathname.split('/')[part];
  const pathsLength = pathname.split('/').length - 1;

  return { pathname, startWith, matchPathname, getPathPart, pathsLength };
}
