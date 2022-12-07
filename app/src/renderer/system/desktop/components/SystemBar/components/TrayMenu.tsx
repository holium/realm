import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';
import { compose, space, color, typography } from 'styled-system';
import { Portal } from 'renderer/system/dialog/Portal';
import { TrayAppKeys, useTrayApps } from 'renderer/apps/store';

export interface TrayMenuProps {
  id: TrayAppKeys;
  coords: any;
  body: JSX.Element;
}

const Wrapper = styled(motion.div)`
  position: absolute;
  box-sizing: border-box;
  /* max-width: 20rem; */
`;

export const TrayMenuWrapper = styled(styled.div<Partial<TrayMenuProps>>`
  z-index: 4;
  --webkit-backface-visibility: hidden;
  --webkit-transform: translate3d(0, 0, 0);
  --webkit-perspective: 1000;
  backface-visibility: hidden;
  perspective: 1000;
  transform: translate3d(0, 0, 0);
  will-change: transform;
`)(compose(space, color, typography));

export const TrayMenu = ({ id, body, coords }: TrayMenuProps) => {
  const { setActiveApp, activeApp } = useTrayApps();

  const handleClickOutside = useCallback(
    (event: any) => {
      // If we aren't clicking on a tray icon, close tray
      if (`${id}-icon` !== event.target.id) {
        // we are clicking on an element that should close the tray
        if (event.target.getAttribute('data-close-tray') === 'true') {
          setActiveApp(null);
          event.stopPropagation();
          return;
        }
        // If the app id matches the target, don't close
        if (`${id}-app` === event.target.id) {
          return;
        }
        // If the app node does not contain the click event target, close it.
        const appNode = document.getElementById(`${id}-app`);
        // TODO: fix wallet containing element detection
        if (appNode && !appNode.contains(event.target)) {
          setActiveApp(null);
        }
      }
    },
    [id, setActiveApp]
  );

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <TrayMenuWrapper id={id} data-visible={id}>
      <Portal>
        <AnimatePresence>
          {id && (
            <Wrapper
              key={`${id}-trayMenu`}
              style={coords}
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: activeApp ? 1 : 0,
                y: 0,
                transition: {
                  duration: 0.2,
                },
              }}
              exit={{
                opacity: 0,
                y: 8,
                transition: {
                  duration: 0.2,
                },
              }}
            >
              {body}
            </Wrapper>
          )}
        </AnimatePresence>
      </Portal>
    </TrayMenuWrapper>
  );
};
