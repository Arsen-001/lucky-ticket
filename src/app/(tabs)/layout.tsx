import { Header } from '@/components/layout-elements/Header';
import { TabBar } from '@/components/layout-elements/TabBar';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';
import { Drawer } from '@/components/layout-elements/Drawer';

export default function TabsLayout({ children }: ChildrenProps) {
  return (
    <>
      <Header className="fixed top-0 left-0 right-0 z-50" />
      <main className="h-full pt-26 pb-20 w-screen overflow-x-hidden">{children}</main>
      <TabBar className="fixed bottom-0 w-full z-50" />
      <Drawer />
    </>
  );
}
