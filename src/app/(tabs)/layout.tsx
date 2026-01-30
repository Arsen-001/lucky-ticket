import { Header } from '@/components/layout-elements/Header';
import { TabBar } from '@/components/layout-elements/TabBar';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';
import { Drawer } from '@/components/layout-elements/Drawer';

export default function TabsLayout({ children }: ChildrenProps) {
  return (
    <>
      <Header className="fixed top-0 left-0 right-0 z-50 shadow-xs" />
      <main className="h-full pt-20 pb-20">
        <div className="h-full overflow-hidden inset-container-background">
          <div className="h-full overflow-auto scrollbar-hidden flex-col-stretch">{children}</div>
        </div>
      </main>
      <TabBar className="fixed bottom-0 left-0 right-0 z-50  shadow-xs" />
      <Drawer />
    </>
  );
}
