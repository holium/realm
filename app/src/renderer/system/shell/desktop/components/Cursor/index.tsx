// @ts-nocheck
import React, { FC, useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

import { useEventListener } from './useEventListener';
import IsDevice from './IsDevice';

type AnimatedCursorProps = {
  color: string;
  animateOut?: boolean;
  outerAlpha: number;
  innerSize: number;
  outerSize: number;
  outerScale: number;
  innerScale: number;
  trailingSpeed: number;
  clickables: string[];
};

/**
 * Cursor Core
 * Replaces the native cursor with a custom animated cursor, consisting
 * of an inner and outer dot that scale inversely based on hover or click.
 *
 * @author Stephen Scaff (github.com/stephenscaff)
 *
 * @param {string} color - rgb color value
 * @param {number} outerAlpha - level of alpha transparency for color
 * @param {number} innerSize - inner cursor size in px
 * @param {number} innerScale - inner cursor scale amount
 * @param {number} outerSize - outer cursor size in px
 * @param {number} outerScale - outer cursor scale amount
 * @param {array}  clickables - array of clickable selectors
 *
 */
export const CursorCore: FC<AnimatedCursorProps> = ({
  animateOut,
  color = '220, 90, 90',
  outerAlpha = 0.3,
  innerSize = 8,
  outerSize = 8,
  outerScale = 6,
  innerScale = 0.6,
  trailingSpeed = 8,
  clickables = [
    'a',
    'input[type="text"]',
    'input[type="email"]',
    'input[type="number"]',
    'input[type="submit"]',
    'input[type="image"]',
    'label[for]',
    'select',
    'textarea',
    'button',
    '.link',
  ],
}) => {
  const cursorOuterRef = useRef();
  const cursorInnerRef = useRef();
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isTextCursor, setTextCursor] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isActiveClickable, setIsActiveClickable] = useState(false);
  let endX = useRef(0);
  let endY = useRef(0);

  /**
   * Primary Mouse move event
   * @param {number} clientX - MouseEvent.clientx
   * @param {number} clientY - MouseEvent.clienty
   */
  const onMouseMove = useCallback((evt: MouseEvent) => {
    const { clientX, clientY } = evt;
    // console.log(evt);
    // TODO trying to get the edge transition to work well
    // if (clientX >= window.innerWidth - 1 || clientX === 1) {
    //   setIsVisible(false);
    // }
    // if (clientY >= window.innerHeight - 1 || clientY === 1) {
    //   setIsVisible(false);
    // }
    // if (clientX >= window.innerWidth - 2 || clientX === 2) {
    //   setIsVisible(true);
    // }
    // if (clientY >= window.innerHeight - 2 || clientY === 2) {
    //   setIsVisible(true);
    // }
    setCoords({ x: clientX, y: clientY });
    cursorInnerRef.current.style.top = `${clientY}px`;
    cursorInnerRef.current.style.left = `${clientX}px`;
    endX.current = clientX;
    endY.current = clientY;
  }, []);

  // Outer Cursor Animation Delay
  const animateOuterCursor = useCallback(
    (time) => {
      if (previousTimeRef.current !== undefined) {
        coords.x += (endX.current - coords.x) / trailingSpeed;
        coords.y += (endY.current - coords.y) / trailingSpeed;
        cursorOuterRef.current.style.top = `${coords.y}px`;
        cursorOuterRef.current.style.left = `${coords.x}px`;
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animateOuterCursor);
    },
    [requestRef] // eslint-disable-line
  );
  // Set is visible initially

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // RAF for animateOuterCursor
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateOuterCursor);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animateOuterCursor]);

  // Mouse Events State updates
  const onMouseDown = useCallback(() => setIsActive(true), []);
  const onMouseUp = useCallback(() => setIsActive(false), []);
  const onMouseEnterViewport = useCallback(() => {
    setIsVisible(true);
  }, []);
  const onMouseLeaveViewport = useCallback(() => {
    setIsVisible(false);
    console.log('leave viewport?');
    setIsActiveClickable(false);
  }, []);

  useEventListener('mousemove', onMouseMove);
  useEventListener('mousedown', onMouseDown);
  useEventListener('mouseup', onMouseUp);
  // useEventListener('mouseover', onMouseEnterViewport);
  // useEventListener('mouseout', onMouseLeaveViewport);

  // Cursors Hover/Active State
  useEffect(() => {
    if (isActive) {
      cursorInnerRef.current.style.transform = `translate(-50%, -50%) scale(${innerScale})`;
      cursorOuterRef.current.style.transform = `translate(-50%, -50%) scale(${outerScale})`;
    } else {
      cursorInnerRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorOuterRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  }, [innerScale, outerScale, isActive]);

  // Cursors Click States
  useEffect(() => {
    if (isActiveClickable) {
      cursorInnerRef.current.style.transform = `translate(-50%, -50%) scale(${
        innerScale * 1.2
      })`;
      cursorOuterRef.current.style.transform = `translate(-50%, -50%) scale(${
        outerScale * 1.4
      })`;
    }
  }, [innerScale, outerScale, isActiveClickable]);

  // Cursor Visibility State
  useEffect(() => {
    if (isVisible) {
      cursorInnerRef.current.style.opacity = 1;
      cursorOuterRef.current.style.opacity = 1;
    } else {
      cursorInnerRef.current.style.opacity = 0;
      cursorOuterRef.current.style.opacity = 0;
    }
  }, [isVisible]);

  useEffect(() => {
    const clickableEls = document.querySelectorAll(clickables.join(','));
    const inputs = document.querySelectorAll(
      [
        'input[type="text"]',
        'input[type="email"]',
        'input[type="number"]',
        'input[type="submit"]',
        'input[type="image"]',
        'input[type="password"]',
        'input[type="date"]',
        'input',
      ].join(',')
    );
    inputs.forEach((input) => {
      input.style.cursor = 'none';
      input.addEventListener('mouseover', () => {
        setTextCursor(true);
      });
      input.addEventListener('mouseout', () => {
        setTextCursor(false);
      });
      input.addEventListener('mousedown', () => {
        setTextCursor(true);
      });
    });

    clickableEls.forEach((el) => {
      el.style.cursor = 'none';

      el.addEventListener('mouseover', () => {
        setTextCursor(false);
        setIsActive(true);
      });
      el.addEventListener('click', () => {
        // setIsActive(true);
        setIsActiveClickable(false);
      });
      el.addEventListener('mousedown', () => {
        setIsActiveClickable(true);
      });
      el.addEventListener('drag', () => {
        setIsActive(true);
        setIsActiveClickable(true);
      });
      el.addEventListener('mouseup', () => {
        setIsActive(true);
      });
      el.addEventListener('mouseout', () => {
        setIsActive(false);
        setIsActiveClickable(false);
      });
    });

    return () => {
      inputs.forEach((input) => {
        input.style.cursor = 'none';
        input.removeEventListener('mouseover', () => {
          setTextCursor(true);
        });
        input.removeEventListener('mouseout', () => {
          setTextCursor(false);
        });
        input.removeEventListener('mousedown', () => {
          setTextCursor(true);
        });
      });
      clickableEls.forEach((el) => {
        el.removeEventListener('mouseover', () => {
          setIsActive(true);
        });
        el.removeEventListener('click', () => {
          setIsActive(true);
          setIsActiveClickable(false);
        });
        el.removeEventListener('mousedown', () => {
          setIsActiveClickable(true);
        });
        el.removeEventListener('mouseup', () => {
          setIsActive(true);
        });
        el.removeEventListener('mouseout', () => {
          setIsActive(false);
          setIsActiveClickable(false);
        });
      });
    };
  }, [isActive, clickables]);

  // Cursor Styles
  const styles = {
    cursorInner: {
      zIndex: 999,
      display: 'block',
      position: 'fixed',
      // borderRadius: '50%',
      width: innerSize,
      height: innerSize,
      pointerEvents: 'none',
      border: '1px solid white',
      boxSizing: 'content-box',
      backgroundColor: `rgba(${color}, 1)`,
      // transition: 'opacity 0.15s ease-in-out, transform 0.25s ease-in-out',
    },
    cursorOuter: {
      boxSizing: 'content-box',
      zIndex: 999,
      display: 'block',
      position: 'fixed',
      borderRadius: '50%',
      pointerEvents: 'none',
      width: outerSize,
      height: outerSize,
      backgroundColor: `rgba(${color}, ${outerAlpha})`,
      transition: 'transform 0.15s ease-in-out',
      willChange: 'transform',
    },
  };

  // Hide / Show global cursor
  document.body.style.cursor = 'none';

  return (
    <React.Fragment>
      <motion.div
        ref={cursorOuterRef}
        layoutId="cursor-outer-1"
        animate={{
          opacity: isTextCursor ? 0 : 1,
        }}
        transition={{ opacity: 0.05 }}
        style={{
          ...styles.cursorOuter,
          visibility: isVisible ? 'visible' : 'hidden',
        }}
      />
      <motion.div
        layoutId="cursor-1"
        ref={cursorInnerRef}
        animate={{
          width: isTextCursor ? 2.5 : innerSize,
          height: isTextCursor ? 18 : innerSize,
          borderRadius: isTextCursor ? '2%' : '50%',
          visibility: isVisible ? 'visible' : 'hidden',
        }}
        transition={{
          width: 0.15,
          height: 0.15,
          borderRadius: 0.15,
          visibility: 0.1,
        }}
        style={{
          ...styles.cursorInner,
        }}
        whileTap={{ scale: 0.975 }}
      />
    </React.Fragment>
  );
};

/**
 * AnimatedCursor
 * Calls and passes props to CursorCore if not a touch/mobile device.
 */
function AnimatedCursor({
  animateOut,
  color,
  outerAlpha,
  innerSize,
  innerScale,
  outerSize,
  outerScale,
  trailingSpeed,
  clickables,
}) {
  if (typeof navigator !== 'undefined' && IsDevice.any()) {
    return <React.Fragment></React.Fragment>;
  }
  return (
    <CursorCore
      animateOut={animateOut}
      color={color}
      outerAlpha={outerAlpha}
      innerSize={innerSize}
      innerScale={innerScale}
      outerSize={outerSize}
      outerScale={outerScale}
      trailingSpeed={trailingSpeed}
      clickables={clickables}
    />
  );
}

export default AnimatedCursor;
