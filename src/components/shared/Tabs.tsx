'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export type TabClassName = string | ((tabKey: string) => string);

export interface TabsProps {
  items: { key: string; title: ReactNode; children?: ReactNode }[];
  activeKey?: string;
  defaultActiveKey?: string;
  onTabChange?: (key: string) => void;
  hideMountAnimation?: boolean;
  className?: TabClassName;
  classNames?: {
    container?: TabClassName;
    tab?: TabClassName;
    indicator?: TabClassName;
    scrollButtons?: TabClassName;
    children?: TabClassName;
  };
}

export function Tabs({
  items,
  activeKey: propActiveKey,
  defaultActiveKey,
  onTabChange,
  hideMountAnimation,
  className,
  classNames,
}: TabsProps) {
  const t = useAppTranslations();
  const [internalActiveKey, setInternalActiveKey] = useState(defaultActiveKey || items[0]?.key);
  const activeKey = propActiveKey !== undefined ? propActiveKey : internalActiveKey;

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, height: 0 });
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const updateIndicator = () => {
    const activeTab = tabRefs.current.get(activeKey);
    if (activeTab && tabsContainerRef.current) {
      const containerRect = tabsContainerRef.current.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();

      setIndicatorStyle({
        left: tabRect.left - containerRect.left + tabsContainerRef.current.scrollLeft,
        width: tabRect.width,
        height: tabRect.height,
      });
    }
  };

  const checkScroll = () => {
    const el = tabsContainerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftScroll(scrollLeft > 0);
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    updateIndicator();
    checkScroll();

    const handleResize = () => {
      updateIndicator();
      checkScroll();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeKey, items]);

  const handleTabClick = (key: string) => {
    if (propActiveKey === undefined) {
      setInternalActiveKey(key);
    }
    onTabChange?.(key);
    centerActiveTab(key);
  };

  const centerActiveTab = (tabKey: string) => {
    const activeTab = tabRefs.current.get(tabKey);
    const container = tabsContainerRef.current;
    if (!activeTab || !container) return;

    const tabCenter = activeTab.offsetLeft + activeTab.offsetWidth / 2;
    const containerCenter = container.clientWidth / 2;

    container.scrollTo({
      left: tabCenter - containerCenter,
      behavior: 'smooth',
    });

    checkScroll();
  };

  const scroll = (direction: 'left' | 'right') => {
    const el = tabsContainerRef.current;
    if (!el) return;

    const amount = 200;
    const newScrollLeft = direction === 'left' ? el.scrollLeft - amount : el.scrollLeft + amount;

    el.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    checkScroll();
  };

  const getClassName = (className?: TabClassName) => {
    if (!className) return '';
    if (typeof className === 'function') {
      return className(activeKey);
    }
    return className;
  };

  const buttonClassName = twMerge(
    'p-1 absolute z-20 flex items-center justify-center rounded-full text-white shadow-lg',
    getClassName(classNames?.scrollButtons)
  );
  const currentChildren = items.find(item => item.key === activeKey)?.children;

  return (
    <>
      <div
        className={twMerge(
          'relative flex w-full max-w-full items-center justify-center overflow-hidden px-1',
          getClassName(className)
        )}
      >
        {/* Left scroll button */}
        {showLeftScroll && (
          <Button
            className={twMerge(buttonClassName, 'left-0')}
            onClick={() => scroll('left')}
            aria-label={t('scroll left')}
          >
            <ChevronLeft size={20} />
          </Button>
        )}

        {/* Tabs container */}
        <div
          ref={tabsContainerRef}
          className={twMerge(
            'scrollbar-hidden relative flex max-w-full items-center overflow-x-auto overflow-y-hidden rounded-full bg-gradient-purple scroll-smooth',
            !hideMountAnimation && 'animate-fade-in',
            getClassName(classNames?.container)
          )}
          onScroll={checkScroll}
          role="tablist"
        >
          {/* Indicator */}
          <div
            className={twMerge(
              'absolute z-1 rounded-full bg-pink-gradient transition-[transform,width] duration-300 ease-in-out pointer-events-none',
              getClassName(classNames?.indicator)
            )}
            style={{
              transform: `translateX(${indicatorStyle.left}px)`,
              width: `${indicatorStyle.width}px`,
              height: `${indicatorStyle.height}px`,
            }}
          />

          {/* Tabs */}
          {items.map((item, index) => (
            <Button
              variant="transparent"
              key={item.key}
              ref={el => {
                if (el) tabRefs.current.set(item.key, el);
                else tabRefs.current.delete(item.key);
              }}
              onClick={() => handleTabClick(item.key)}
              role="tab"
              aria-selected={activeKey === item.key}
              aria-controls={`tab-panel-${item.key}`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
              className={twMerge(
                `
                relative z-2 whitespace-nowrap rounded-full
                px-4 py-1.5 m-0.5 text-sm font-semibold
                text-white-secondary transition-colors
                hover:text-white/90 w-auto
              `,
                !hideMountAnimation && 'animate-slide-in-bottom',
                activeKey === item.key ? 'text-white' : '',
                getClassName(classNames?.tab)
              )}
            >
              {item.title}
            </Button>
          ))}
        </div>

        {/* Right scroll button */}
        {showRightScroll && (
          <Button
            className={twMerge(buttonClassName, 'right-0')}
            onClick={() => scroll('right')}
            aria-label={t('scroll right')}
          >
            <ChevronRight size={20} />
          </Button>
        )}
      </div>
      {currentChildren && (
        <div key={activeKey} className={twMerge('mt-5', getClassName(classNames?.children))}>
          {currentChildren}
        </div>
      )}
    </>
  );
}
