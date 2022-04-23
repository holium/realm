/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import styled, { css } from 'styled-components';
import { compose, space, color, typography } from 'styled-system';
import { Box } from '../../../../../../components';
import { Portal } from '../../../../../modals/Portal';

export type TrayMenuProps = {
  id: string;
  buttonRef: any;
  style?: any;
  content?: React.ReactNode | string;
  children: React.ReactNode;
  position?: any;
  dimensions: {
    height: number;
    width: number;
  };
};

const Wrapper = styled(motion.div)`
  position: absolute;
  box-sizing: border-box;
  max-width: 20rem;
`;

export const TrayMenuWrapper = styled(styled.div<Partial<TrayMenuProps>>`
  z-index: 4;
`)(compose(space, color, typography));

export const TrayMenu = (props: TrayMenuProps) => {
  const { id, buttonRef, style, content, dimensions, children } = props;
  let trayMenuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    left: number;
    bottom: number;
  }>({ left: 0, bottom: 48 });
  const [isVisible, setIsVisible] = useState(false);
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
      // if we are clicking in the app area
      const trayNode = ReactDOM.findDOMNode(trayMenuRef.current);
      if (`${id}-app` === event.target.id) {
        return;
      }
      if (trayNode && !trayNode?.contains(event.target)) {
        setIsVisible(false);
      }
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
    let left =
      event.clientX -
      dimensions.width -
      buttonEvent.offsetX +
      buttonEvent.srcElement.offsetWidth +
      8;

    let bottom = event.screenY - event.clientY + 15;
    return {
      left,
      bottom,
    };
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
          {isVisible && coords && (
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
                y: 0,
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

TrayMenu.defaultProps = {};
