'use client';

import { LabCompactSection } from './LabCompactSection';
import { LabEngineAliveSection } from './LabEngineAliveSection';
import { LabEnginesSection } from './LabEnginesSection';
import { LabTabBarSection } from './LabTabBarSection';
import { LabTasksSection } from './LabTasksSection';

/**
 * Design lab — a scratch surface for judging options on the real components,
 * with the real theme and the real data, instead of on a mock-up.
 *
 * It is not part of the product: `/lab` answers 404 in a production build
 * (@see src/app/lab/page). Delete this folder once the options it holds have
 * been decided.
 */
export function LabScreen() {
  return (
    <div className="main-scrollbar h-full overflow-y-auto pb-24">
      <header className="px-4 pt-5 pb-1">
        <h1 className="text-base font-extrabold text-white">Лаборатория</h1>
        <p className="mt-1 text-[11px] leading-snug text-white/45">
          Живой движок, кандидаты карточки задания и варианты нижних табов. Компоненты настоящие,
          данные живые.
        </p>
      </header>

      <LabEnginesSection />

      <LabTabBarSection />

      <LabEngineAliveSection />

      <LabCompactSection />

      <LabTasksSection />
    </div>
  );
}
