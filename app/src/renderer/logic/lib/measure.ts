import { RefObject, useLayoutEffect } from 'react';
import { ShellActions } from '../actions/shell';

export function useWindowSize(windowRef: RefObject<HTMLDivElement>) {
  useLayoutEffect(() => {
    const updateSize = () => {
      if (!windowRef.current) return;
      const dims = windowRef.current.getBoundingClientRect();
      ShellActions.setDesktopDimensions(
        Math.round(dims.width),
        Math.round(dims.height)
      );
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, [windowRef.current]);
}
