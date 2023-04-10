import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const Portal = ({ children }: { children: ReactNode }) => {
  const mount = document.getElementById('portal-root');

  const el = document.createElement('div');

  useEffect(() => {
    mount && mount.appendChild(el);
    return () => {
      mount && mount.removeChild(el);
    };
  }, [el, mount]);

  return createPortal(children, el);
};
