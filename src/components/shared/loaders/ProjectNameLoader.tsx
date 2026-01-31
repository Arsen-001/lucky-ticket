import { GlobalConstants } from '@/constants/global.constants';

export default function ProjectNameLoader() {
  return <div className="loader">{GlobalConstants.projectName}</div>;
}
