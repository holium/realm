import { useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';

import { BoxProps } from '../../general/Box/Box';

export const TrayAppWrapper = styled(motion.div)`
  display: flex !important;
  flex-direction: column;
  padding: 12px;
  z-index: 16;
  height: inherit;
  position: absolute;
  overflow: hidden;
  gap: 12px;
  border-radius: 16px;
  backdrop-filter: var(--blur);
  backface-visibility: hidden;
  background: rgba(var(--rlm-window-bg-rgba)) !important;
  border: 1px solid rgba(var(--rlm-border-rgba));
  box-shadow: 0px 0px 9px rgba(0, 0, 0, 0.12);
  // this forces gpu rendering on the tray app which is needed to prevent
  // a flicker bug due to the backdrop-filter
  --webkit-transform: translate3d(0, 0, 0);
  --webkit-backdrop-filter: var(--blur);
  --webkit-backface-visibility: hidden;
  ::-webkit-scrollbar {
    display: none;
  }
`;

type AppCoords = {
  x: number;
  y: number;
  height: number;
  width: number;
};

type TrayAppProps = {
  id: string;
  coords: AppCoords;
  children: JSX.Element;
  isOpen?: boolean;
  closeTray: () => void;
} & BoxProps;

export const TrayApp = ({
  id,
  children,
  isOpen = true,
  closeTray,
  coords,
}: TrayAppProps) => {
  const appId = useMemo(() => `${id}-app`, [id]);

  const handleClickOutside = useCallback(
    (event: any) => {
      // If we aren't clicking on a tray icon, close tray
      if (`${id}-icon` !== event.target.id) {
        if (event.target.getAttribute('data-close-tray') === 'false') {
          return;
        }
        // we are clicking on an element that should close the tray
        if (event.target.getAttribute('data-close-tray') === 'true') {
          event.stopPropagation();
          closeTray();
          return;
        }
        // If the app id matches the target, don't close
        if (`${id}-app` === event.target.id) {
          return;
        }
        // If the lightbox node contains the click event target, don't close
        const lightboxNode = document.getElementsByClassName('pswp')[0];
        if (lightboxNode && lightboxNode.contains(event.target)) {
          return;
        }
        // If the app node does not contain the click event target, close it.
        const appNode = document.getElementById(`${id}-app`);
        if (appNode && !appNode.contains(event.target)) {
          closeTray();
        }
      }
    },
    [id]
  );

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <AnimatePresence>
      {isOpen && (
        <TrayAppWrapper
          key={appId}
          id={appId}
          initial={{
            x: coords.x,
            y: coords.y,
            height: coords.height,
            width: coords.width,
            opacity: 0,
            display: 'none',
          }}
          animate={{
            x: coords.x,
            y: coords.y,
            height: coords.height,
            width: coords.width,
            opacity: isOpen ? 1 : 0,
            display: 'block',
          }}
          exit={{
            x: coords.x,
            y: coords.y,
            height: coords.height,
            width: coords.width,
            opacity: 0,
            display: 'none',
          }}
          transition={{
            duration: 0.2,
          }}
        >
          {children}
        </TrayAppWrapper>
      )}
    </AnimatePresence>
  );
};
