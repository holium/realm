import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { color, compose, space, typography } from 'styled-system';

import { Box } from '@holium/design-system/general';

import { useAppState } from 'renderer/stores/app.store';

import { MiniAppWindow } from '../SystemBar/components/MiniAppWindow';

export interface RealmPopoverProps {
  id: string;
  isOpen: boolean;
  coords?: {
    top: number;
    left: number;
  };
  style?: any;
  children?: any;
  buttonOffset?: {
    x?: number;
    y?: number;
  };
  dimensions: {
    width: number;
    height?: number;
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
`)(compose(space, color, typography));

const RealmPopoverPresenter = (props: RealmPopoverProps) => {
  const { id, isOpen, style, children, coords, dimensions, onClose } = props;
  const { theme } = useAppState();
  const { textColor, windowColor } = theme;

  const handleClickOutside = useCallback(
    (event: any) => {
      // If we aren't clicking on the tray's trigger,
      // nor any of its children, then close the tray.
      const trigger = document.getElementById(`${id}-trigger`);
      if (
        trigger &&
        event.target &&
        trigger !== event.target &&
        !trigger.contains(event.target as Node)
      ) {
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
    [id, onClose]
  );

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        zIndex: 4,
      }}
    >
      <RealmPopoverWrapper id={`${id}-wrapper`} style={style}>
        <AnimatePresence>
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
                  maxHeight: '55vh',
                }}
                color={textColor}
                customBg={windowColor}
                onContextMenu={(evt) => evt.stopPropagation()}
              >
                <motion.div style={{ ...coords, padding: 20 }}>
                  {children}
                </motion.div>
              </MiniAppWindow>
            </Wrapper>
          )}
        </AnimatePresence>
      </RealmPopoverWrapper>
    </Box>
  );
};

export const RealmPopover = observer(RealmPopoverPresenter);
