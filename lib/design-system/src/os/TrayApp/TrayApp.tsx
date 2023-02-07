import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';
import { rgba } from 'polished';
import { BoxProps } from '../../';
import { getVar } from '../../util/colors';

const Wrapper = styled(motion.div)`
  z-index: 13;
  position: absolute;
  overflow: hidden;
  border-radius: 16px;
  transform: translate3d(0, 0, 0);
  backdrop-filter: blur(24px);
  backface-visibility: hidden;
  background: ${() => rgba(getVar('window'), 0.9)};
  border: 1px solid var(--rlm-border-color);
  box-shadow: 0px 0px 9px rgba(0, 0, 0, 0.12);
  ::-webkit-scrollbar {
    display: none;
  }
`;

const AppSection = styled(motion.div)`
  padding: 12px;
`;

type TrayAppProps = {
  id: string;
  coords: any;
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
  const handleClickOutside = useCallback(
    (event: any) => {
      // If we aren't clicking on a tray icon, close tray
      if (`${id}-icon` !== event.target.id) {
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
        <Wrapper
          key={`${id}-app`}
          id={`${id}-app`}
          initial={{
            x: coords.x,
            y: coords.y + 8,
            height: coords.height,
            width: coords.width,
            opacity: 0,
            display: 'none',
          }}
          animate={{
            x: coords.x,
            y: coords.y,
            opacity: isOpen ? 1 : 0,

            display: 'block',
          }}
          exit={{
            x: coords.x,
            y: coords.y + 8,
            height: coords.height,
            width: coords.width,
            opacity: 0,
            display: 'none',
          }}
          transition={{
            duration: 0.2,
          }}
        >
          <AppSection>{children}</AppSection>
        </Wrapper>
      )}
    </AnimatePresence>
  );
};
