import { HorizontalSlider } from '@/components/pages/tabs/home/HorizontalSlider';
import { HomeClaimSection } from '@/components/pages/tabs/home/HomeClaimSection';

export default function HomePage() {
  return (
    <div className="min-h-full flex-col-stretch">
      <HorizontalSlider className="min-h-50 mt-6" />
      <HomeClaimSection className="flex-1" />
    </div>
  );
}
