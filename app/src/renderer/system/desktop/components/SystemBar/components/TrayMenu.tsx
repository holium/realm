/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styled, { css } from 'styled-components';
import { compose, space, color, typography } from 'styled-system';
import { Box } from 'renderer/components';
import { Portal } from 'renderer/system/dialog/Portal';

export type TrayMenuProps = {
  id: string;
  buttonRef: any;
  appRef: any;
  style?: any;
  content?: React.ReactNode | string;
  children: React.ReactNode;
  defaultIsVisible?: boolean;
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
  --webkit-backface-visibility: hidden;
  --webkit-transform: translate3d(0, 0, 0);
  --webkit-perspective: 1000;
  will-change: transform;
`)(compose(space, color, typography));

export const TrayMenu = (props: TrayMenuProps) => {
  const {
    id,
    appRef,
    defaultIsVisible,
    buttonRef,
    buttonOffset,
    style,
    content,
    position,
    dimensions,
    children,
  } = props;
  let trayMenuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    left: number;
    bottom: number;
  }>({ left: 0, bottom: 48 });
  const [isVisible, setIsVisible] = useState(defaultIsVisible);

  const anchorOffset = { x: 8, y: 26, ...buttonOffset };
  let body = content;

  const handleClickOutside = (event: any) => {
    if (`${id}-icon` === event.target.id) {
      // if we clicked the button
      const trayNode = document.getElementById(id);
      const isVisible = trayNode
        ? trayNode!.getAttribute('data-visible') === 'true'
        : false; // get if the tray is visible currently
      setIsVisible(!isVisible);
    } else {
      // we are clicking on an element that should close the tray
      if (event.target.getAttribute('data-close-tray') === 'true') {
        setIsVisible(false);
        event.stopPropagation();
        return;
      }
      // if we are clicking in the app area
      if (appRef && appRef.current && appRef.current.contains(event.target)) {
        return;
      }

      if (`${id}-app` === event.target.id) {
        return;
      }
      const appNode = document.getElementById(`${id}-app`);

      if (appNode && !appNode.contains(event.target)) {
        setIsVisible(false);
      }
      // const trayNode = ReactDOM.findDOMNode(trayMenuRef.current);
      // if (trayNode && !trayNode?.contains(event.target)) {
      //   setIsVisible(false);
      // }
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const calculateAnchorPoint = (event: any) => {
    const buttonEvent = event.nativeEvent;
    let style = {};

    let left = null;
    if (position?.includes('-left')) {
      left =
        event.clientX -
        dimensions.width -
        buttonEvent.offsetX +
        buttonEvent.srcElement.offsetWidth +
        anchorOffset.x;
      style = { ...style, left };
    }
    // let right = null;
    if (position?.includes('-right')) {
      left = event.clientX - buttonEvent.offsetX - anchorOffset.x;
      style = { ...style, left };
    }

    let bottom =
      // event.clientY -
      // buttonEvent.offsetY +
      buttonEvent.srcElement.offsetHeight + anchorOffset.y;
    style = { ...style, bottom };
    return style;
  };

  const setAnchor = ({ left, bottom }: any) => {
    setCoords({ left, bottom });
  };

  return (
    <TrayMenuWrapper
      id={`${id}`}
      data-visible={isVisible}
      ref={trayMenuRef}
      style={style}
    >
      <Portal>
        <AnimatePresence>
          {isVisible && (
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
              // variants={menuAnimate}
            >
              <motion.div style={coords}>{body}</motion.div>
            </Wrapper>
          )}
        </AnimatePresence>
      </Portal>
      <Box
        id={`${id}-icon`}
        position="relative"
        onClick={(evt: any) => {
          const newCoords = calculateAnchorPoint(evt);
          setAnchor(newCoords);
          // setIsVisible(!isVisible);
        }}
      >
        {children}
      </Box>
    </TrayMenuWrapper>
  );
};

TrayMenu.defaultProps = {
  position: 'top-left',
  defaultIsVisible: false,
};
