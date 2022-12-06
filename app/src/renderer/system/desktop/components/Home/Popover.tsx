/* eslint-disable react/prop-types */
import { useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';
import { compose, space, color, typography } from 'styled-system';
import { Portal } from 'renderer/system/dialog/Portal';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { MiniAppWindow } from '../SystemBar/components/MiniAppWindow';

export interface RealmPopoverProps {
  id: string;
  isOpen: boolean;
  coords?: any;
  style?: any;
  children?: any;
  buttonOffset?: {
    x?: number;
    y?: number;
  };
  dimensions: {
    height: number;
    width: number;
  };
  onClose: () => void;
}

const Wrapper = styled(motion.div)`
  position: absolute;
  box-sizing: border-box;
  /* max-width: 20rem; */
`;
export const RealmPopoverWrapper = styled(styled.div<
  Partial<RealmPopoverProps>
>`
  z-index: 4;
  --webkit-backface-visibility: hidden;
  --webkit-transform: translate3d(0, 0, 0);
  --webkit-perspective: 1000;
  backface-visibility: hidden;
  perspective: 1000;
  transform: translate3d(0, 0, 0);
  will-change: transform;
`)(compose(space, color, typography));

export const RealmPopover = observer((props: RealmPopoverProps) => {
  const { id, isOpen, style, children, coords, dimensions, onClose } = props;
  const { theme } = useServices();
  const { textColor, windowColor } = theme.currentTheme;
  // const isOpen = searchMode !== 'none';
  const handleClickOutside = useCallback(
    (event: any) => {
      // If we aren't clicking on a tray icon, close tray
      if (`${id}-trigger` !== event.target.id) {
        // we are clicking on an element that should close the tray
        if (event.target.getAttribute('data-close-tray') === 'true') {
          onClose();
          event.stopPropagation();
          return;
        }

        // If the app node does not contain the click event target, close it.
        const appNode = document.getElementById(`${id}-app`);
        if (appNode && !appNode.contains(event.target)) {
          onClose();
        }
      }
    },
    [onClose, id]
  );

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside, isOpen]);

  return useMemo(
    () => (
      <RealmPopoverWrapper id={`${id}-wrapper`} style={style}>
        <AnimatePresence>
          <Portal>
            {isOpen && (
              <Wrapper
                key={`${id}-wrapper`}
                style={{
                  ...coords,
                  ...dimensions,
                  maxHeight: dimensions.height,
                }}
                initial={{
                  opacity: 0,
                  y: -8,
                  width: dimensions.width,
                  height: 'fit-content',
                  maxHeight: dimensions.height,
                }}
                animate={{
                  opacity: isOpen ? 1 : 0,
                  y: 0,
                  width: dimensions.width,
                  height: 'fit-content',
                  maxHeight: dimensions.height,
                  transition: {
                    duration: 0.2,
                  },
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                  height: 'fit-content',
                  width: dimensions.width,
                  maxHeight: dimensions.height,
                  transition: {
                    duration: 0.2,
                  },
                }}
              >
                <MiniAppWindow
                  id={`${id}-app`}
                  style={{
                    ...dimensions,
                    height: 'fit-content',
                    overflowY: 'auto',
                    maxHeight: '50vh',
                  }}
                  color={textColor}
                  customBg={windowColor}
                  onContextMenu={(evt: any) => evt.stopPropagation()}
                >
                  <motion.div style={{ ...coords, padding: 20 }}>
                    {children}
                  </motion.div>
                </MiniAppWindow>
              </Wrapper>
            )}
          </Portal>
        </AnimatePresence>
      </RealmPopoverWrapper>
    ),
    [isOpen, coords, dimensions, theme.currentTheme]
  );
});
