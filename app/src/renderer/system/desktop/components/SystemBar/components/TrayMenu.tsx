/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/prop-types */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styled, { css } from 'styled-components';
import { compose, space, color, typography } from 'styled-system';
import { Portal } from 'renderer/system/dialog/Portal';
import { TrayAppKeys, useTrayApps } from 'renderer/logic/apps/store';

export type TrayMenuProps = {
  id: TrayAppKeys;
  coords?: any;
  style?: any;
  content?: any | string;
  children?: any;
  buttonOffset?: {
    x?: number;
    y?: number;
  };
  position?:
    | 'top-right'
    | 'top-left'
    | 'top'
    | 'bottom-left'
    | 'bottom-right'
    | 'bottom';
  dimensions: {
    height: number;
    width: number;
  };
};

const Wrapper = styled(motion.div)`
  position: absolute;
  box-sizing: border-box;
  /* max-width: 20rem; */
`;

export const TrayMenuWrapper = styled(styled.div<Partial<TrayMenuProps>>`
  z-index: 4;
  -webkit-backface-visibility: hidden;
  -webkit-transform: translate3d(0, 0, 0);
  -webkit-perspective: 1000;
  backface-visibility: hidden;
  perspective: 1000;
  transform: translate3d(0, 0, 0);
  will-change: transform;
`)(compose(space, color, typography));

export const TrayMenu = (props: TrayMenuProps) => {
  const { id, style, content, dimensions, coords } = props;

  const { setActiveApp } = useTrayApps();

  let body = content;
  const handleClickOutside = (event: any) => {
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
      if (appNode && !appNode.contains(event.target)) {
        setActiveApp(null);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [id]);

  return (
    <TrayMenuWrapper id={`${id}`} data-visible={id} style={style}>
      <Portal>
        <AnimatePresence>
          {id && (
            <Wrapper
              key={`${id}-trayMenu`}
              style={coords}
              initial={{
                opacity: 0,
                y: 8,
                width: dimensions.width,
                height: dimensions.height,
              }}
              animate={{
                opacity: 1,
                y: 0,
                width: dimensions.width,
                height: dimensions.height,
                transition: {
                  duration: 0.2,
                },
              }}
              exit={{
                opacity: 0,
                y: 8,
                height: dimensions.height / 2,
                width: dimensions.width,
                transition: {
                  duration: 0.2,
                },
              }}
            >
              <motion.div style={coords}>{body}</motion.div>
            </Wrapper>
          )}
        </AnimatePresence>
      </Portal>
    </TrayMenuWrapper>
  );
};

TrayMenu.defaultProps = {
  position: 'top-left',
  defaultIsVisible: false,
};
