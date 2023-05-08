import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const Portal = ({ children }: { children: ReactNode }) => {
  // Make it SSR compatible.
  const mount =
    typeof window === 'undefined'
      ? null
      : document.getElementById('portal-root');
  const el =
    typeof window === 'undefined' ? null : document.createElement('div');

  useEffect(() => {
    if (!mount || !el) return;

    mount.appendChild(el);
    return () => {
      mount.removeChild(el);
    };
  }, [el, mount]);

  if (!el) return null;

  return createPortal(children, el);
};
