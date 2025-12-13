'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type ClientPortalProps = {
  children: ReactNode;
  selector?: string; // The ID of the target element (e.g., "#portal-root")
  show?: boolean; // Optional: Built-in conditional rendering
};

export const ClientPortal = ({
  children,
  selector = '#portal-root',
  show = true,
}: ClientPortalProps) => {
  const ref = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const container = document.querySelector(selector);
    if (!container) return;
    ref.current = container;
    setMounted(true);
    // document.body.style.overflow = 'hidden';
  }, [selector]);

  if (!mounted || !show || !ref?.current) {
    return null;
  }

  return createPortal(children, ref?.current);
};
