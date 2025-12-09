import { Header } from '@/components/layout-elements/Header';
import { TabBar } from '@/components/layout-elements/TabBar';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';
import { Drawer } from '@/components/layout-elements/Drawer';

export default function TabsLayout({ children }: ChildrenProps) {
  return (
    <div className="h-screen">
      <Header className="fixed top-0 left-0 right-0 z-50" />
      <main className="flex-1 mt-20">{children}</main>
      <TabBar className="fixed bottom-0 w-full z-50" />
      <Drawer />
    </div>
  );
}
