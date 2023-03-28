import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

type MenuPortalProps = {
  id: string;
  isOpen: boolean;
  children: React.ReactNode;
};

export const MenuPortal = ({ id, isOpen, children }: MenuPortalProps) => {
  const el = document.createElement('div');
  const menuRoot = document.getElementById('menu-root');
  // el?.setAttribute(
  //   'style',
  //   'position: absolute; top: 0px; left: 0px; z-index: 1000;'
  // );
  useEffect(() => {
    if (isOpen) menuRoot?.appendChild(el);
    return () => {
      if (isOpen) menuRoot?.removeChild(el);
    };
  }, [id, isOpen]);
  return createPortal(children, el);
};
