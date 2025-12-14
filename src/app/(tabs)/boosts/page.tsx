import '@/styles/components/loading.css';
import { GlobalConstants } from '@/constants/global.constants';

export default function BoostsPage() {
  return (
    <div className="h-full flex-center">
      <div className="loader">{GlobalConstants.projectName}</div>
    </div>
  );
}
