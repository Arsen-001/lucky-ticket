'use client';

import { type ReactNode, useEffect, useState } from 'react';
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
  const [container, setContainer] = useState<Element | null>(null);

  useEffect(() => {
    setContainer(document.querySelector(selector));
  }, [selector]);

  if (!show || !container) {
    return null;
  }

  return createPortal(children, container);
};
