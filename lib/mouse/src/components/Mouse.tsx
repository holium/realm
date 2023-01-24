import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, MotionStyle, Variants } from 'framer-motion';
import { useEventListener } from './useEventListener';
import IsDevice from './isDevice';

export interface Vec2 {
  x: number;
  y: number;
}

interface AnimatedCursorProps {
  id?: string;
  color?: string;
  animateOut?: boolean;
  outerAlpha?: number;
  innerSize?: number;
  outerSize?: number;
  outerScale?: number;
  innerScale?: number;
  trailingSpeed?: number;
  coords?: Vec2;
  isActive?: boolean;
  isActiveClickable?: boolean;
  isVisible?: boolean;
  isTextCursor?: boolean;
  isResizeCursor?: boolean;
  initialRender?: boolean;
  children?: React.ReactNode;
}

const getCurrentCursor = (isTextCursor: boolean, isResizeCursor: boolean) => {
  if (isTextCursor) {
    return 'text';
  }
  if (isResizeCursor) {
    return 'resize';
  }
  return 'pointer';
};
/**
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
const CursorCore = ({
  id = 'rlm-cursor',
  // animateOut,
  color = '0, 0, 0',
  outerAlpha = 0.2,
  innerSize = 10,
  outerSize = 12,
  outerScale = 2,
  innerScale = 0.9,
  trailingSpeed = 1,
  coords = { x: 0, y: 0 },
  isActive,
  isActiveClickable,
  isVisible = true,
  isTextCursor,
  isResizeCursor,
  children,
}: AnimatedCursorProps) => {
  const cursorOuterRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const endX = useRef(0);
  const endY = useRef(0);

  // Outer Cursor Animation Delay
  const animateOuterCursor = useCallback(
    (time: number) => {
      if (!cursorOuterRef.current) return;
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

  // RAF for animateOuterCursor
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateOuterCursor);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animateOuterCursor]);

  // Cursor Visibility State
  useEffect(() => {
    if (!cursorInnerRef.current || !cursorOuterRef.current) return;
    if (isVisible) {
      cursorInnerRef.current.style.opacity = '1';
      cursorOuterRef.current.style.opacity = '1';
      cursorInnerRef.current.style.transform =
        'translate(-50%, -50%) scale(1.0)';
      cursorOuterRef.current.style.transform =
        'translate(-50%, -50%) scale(1.0)';
    } else {
      cursorInnerRef.current.style.opacity = '0';
      cursorOuterRef.current.style.opacity = '0';
    }
  }, [isVisible]);

  // Update cursor coordinates
  useEffect(() => {
    if (!cursorInnerRef.current || !cursorOuterRef.current) return;
    cursorInnerRef.current.style.top = `${coords.y}px`;
    cursorInnerRef.current.style.left = `${coords.x}px`;
    if (cursorInnerRef.current.style.transform === 'none') {
      // if for some reason the transform isnt set yet.
      cursorInnerRef.current.style.transform =
        'translate(-50%, -50%) scale(1.0)';
      cursorOuterRef.current.style.transform =
        'translate(-50%, -50%) scale(1.0)';
    }
    endX.current = coords.x;
    endY.current = coords.y;
  }, [coords]);

  // Cursors Hover/Active State
  useEffect(() => {
    if (!cursorInnerRef.current || !cursorOuterRef.current) return;
    if (isActive) {
      cursorInnerRef.current.style.transform = `translate(-50%, -50%) scale(${innerScale})`;
      cursorOuterRef.current.style.transform = `translate(-50%, -50%) scale(${outerScale})`;
    } else {
      cursorInnerRef.current.style.transform =
        'translate(-50%, -50%) scale(1.0)';
      cursorOuterRef.current.style.transform =
        'translate(-50%, -50%) scale(1.0)';
    }
  }, [innerScale, outerScale, isActive]);

  // Cursors Click States
  useEffect(() => {
    if (!cursorInnerRef.current || !cursorOuterRef.current) return;
    if (isActiveClickable) {
      cursorInnerRef.current.style.transform = `translate(-50%, -50%) scale(${
        innerScale * 1.2
      })`;
      cursorOuterRef.current.style.transform = `translate(-50%, -50%) scale(${
        outerScale * 1.2
      })`;
    }
  }, [innerScale, outerScale, isActiveClickable]);

  // Cursor Styles
  const styles: Record<string, MotionStyle> = {
    cursorInner: {
      zIndex: 100000,
      display: 'block',
      position: 'absolute',
      width: innerSize,
      height: innerSize,
      pointerEvents: 'none',
      border: '1px solid white',
      boxSizing: 'content-box',
      backgroundColor: `rgba(${color}, 1)`,
      transition: 'opacity 0.15s ease-in-out, transform 0.25s ease-in-out',
    },
    cursorOuter: {
      boxSizing: 'content-box',
      zIndex: 100000,
      display: 'block',
      position: 'absolute',
      borderRadius: '50%',
      pointerEvents: 'none',
      width: outerSize,
      height: outerSize,
      backgroundColor: `rgba(${color}, ${outerAlpha})`,
      transition: 'transform 0.15s ease-in-out',
      willChange: 'transform',
    },
  };

  const cursorVariants: Variants = {
    text: {
      width: 2.5,
      height: 18,
      borderRadius: '2%',
      visibility: isVisible ? 'visible' : 'hidden',
    },
    pointer: {
      width: innerSize,
      height: innerSize,
      borderRadius: '50%',
      visibility: isVisible ? 'visible' : 'hidden',
    },
    resize: {
      width: innerSize,
      height: innerSize,
      borderRadius: '2%',
      visibility: isVisible ? 'visible' : 'hidden',
    },
  };

  return (
    <React.Fragment>
      <motion.div
        ref={cursorOuterRef}
        layoutId={`${id}-outer`}
        id={`${id}-outer`}
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
        layoutId={`${id}`}
        id={`${id}`}
        ref={cursorInnerRef}
        variants={cursorVariants}
        animate={getCurrentCursor(
          Boolean(isTextCursor),
          Boolean(isResizeCursor)
        )}
        // animate={{
        //   width: isTextCursor ? 2.5 : innerSize,
        //   height: isTextCursor ? 18 : innerSize,
        //   borderRadius: isTextCursor ? '2%' : '50%',
        //   visibility: isVisible ? 'visible' : 'hidden',
        // }}
        transition={{
          width: 0.15,
          height: 0.15,
          borderRadius: 0.15,
          visibility: 0.1,
        }}
        style={{
          ...styles.cursorInner,
        }}
        // whileTap={{ scale: 0.975 }}
      >
        {children}
      </motion.div>
    </React.Fragment>
  );
};

/**
 * Calls and passes props to CursorCore if not a touch/mobile device.
 */
function AnimatedCursor({
  children,
  ...props
}: React.PropsWithChildren<AnimatedCursorProps>) {
  if (typeof navigator !== 'undefined' && IsDevice?.any()) {
    return <React.Fragment></React.Fragment>;
  }
  return <CursorCore {...props}>{children}</CursorCore>;
}

/**
 * Manages cursor states based on events in current user's window
 */
export function Mouse({
  children,
  ...props
}: React.PropsWithChildren<AnimatedCursorProps>) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isTextCursor, setTextCursor] = useState(false);
  const [isResizeCursor, setResizeCursor] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isActiveClickable, setIsActiveClickable] = useState(false);

  useEffect(() => {
    window.addEventListener('mousemove', (e) => {
      setCoords({ x: e.clientX, y: e.clientY });
    });

    // window.appData.mouseSet((newState, position) => {
    //   if (newState === 'text') setTextCursor(true);
    //   else setTextCursor(false);
    //   setCoords(position);
    // });
  }, []);

  const onMouseDown = useCallback(() => {
    setIsActive(true);
  }, []);

  const onMouseUp = useCallback(() => {
    setIsActive(false);
  }, []);

  const onMouseEnterViewport = useCallback(() => {
    setIsVisible(true);
    setIsActive(false);
  }, []);
  const onMouseLeaveViewport = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEventListener('mousedown', onMouseDown);
  useEventListener('mouseup', onMouseUp);
  useEventListener('mouseover', onMouseEnterViewport);
  useEventListener('mouseout', onMouseLeaveViewport);

  useEffect(() => {
    const clickableEls = document.querySelectorAll(
      [
        'a',
        'label[for]',
        'select',
        'textarea',
        'button',
        'li',
        '.link',
        '.app-dock-icon',
        '.realm-cursor-hover',
      ].join(',')
    ) as NodeListOf<HTMLElement>;

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
        '.input-transparent',
        '.ProseMirror',
        ':scope > .cursor-text',
        '.realm-cursor-text-cursor',
      ].join(',')
    ) as NodeListOf<HTMLInputElement>;

    const resizeHandlers = document.querySelectorAll(
      [
        '.app-window-resize',
        '.app-window-resize-br',
        '.app-window-resize-lr',
      ].join(',')
    ) as NodeListOf<HTMLElement>;

    resizeHandlers.forEach((resizer) => {
      resizer.style.cursor = 'none';
      resizer.addEventListener('mouseover', () => {
        setResizeCursor(true);
      });
      resizer.addEventListener('mouseout', () => {
        setResizeCursor(false);
      });
      resizer.addEventListener('mouseup', () => {
        setResizeCursor(false);
      });
      resizer.addEventListener('mousedown', () => {
        setResizeCursor(true);
      });
    });

    inputs.forEach((input) => {
      input.style.cursor = 'none';
      input.addEventListener('mouseover', () => {
        setTextCursor(true);
      });
      input.addEventListener('blur', () => {
        setTextCursor(false);
      });
      input.addEventListener('mouseout', () => {
        setTextCursor(false);
      });
      input.addEventListener('blur', () => {
        setIsActive(false);
      });
      input.addEventListener('mousedown', () => {
        setTextCursor(true);
      });
    });

    clickableEls.forEach((el) => {
      el.style.cursor = 'none';
      el.addEventListener('mouseover', () => {
        setIsActive(true);
      });
      el.addEventListener('click', (e) => {
        if (!e?.isTrusted) return;
        setIsActive(true);
        setIsActiveClickable(false);
      });
      el.addEventListener('mousedown', () => {
        setIsActiveClickable(true);
      });
      el.addEventListener('blur', () => {
        setIsActive(false);
      });
      el.addEventListener('mouseout', () => {
        setIsActive(false);
        setIsActiveClickable(false);
      });
    });

    return () => {
      resizeHandlers.forEach((resizer) => {
        resizer.addEventListener('mouseover', () => {
          setResizeCursor(true);
        });
        resizer.addEventListener('mouseout', () => {
          setResizeCursor(false);
        });
        resizer.addEventListener('mouseup', () => {
          setResizeCursor(false);
        });
        resizer.addEventListener('mousedown', () => {
          setResizeCursor(true);
        });
      });
      inputs.forEach((input) => {
        input.style.cursor = 'none';
        input.removeEventListener('mouseover', () => {
          setTextCursor(true);
        });
        input.removeEventListener('mouseout', () => {
          setTextCursor(false);
        });
        input.addEventListener('blur', () => {
          setIsActive(false);
        });
        input.removeEventListener('mousedown', () => {
          setTextCursor(true);
        });
      });
      clickableEls.forEach((el) => {
        el.addEventListener('mouseover', () => {
          setIsActive(true);
        });
        el.addEventListener('click', (e) => {
          if (!e?.isTrusted) return;
          setIsActive(true);
          setIsActiveClickable(false);
        });
        el.addEventListener('mousedown', () => {
          setIsActiveClickable(true);
        });
        el.addEventListener('blur', () => {
          setIsActive(false);
        });
        // el.addEventListener('mouseup', () => {
        //   setIsActive(true);
        // });
        el.addEventListener('mouseout', () => {
          setIsActive(false);
          setIsActiveClickable(false);
        });
      });
    };
  }, [isActive]);

  return (
    <AnimatedCursor
      coords={coords}
      isActive={isActive}
      isVisible={isVisible}
      isResizeCursor={isResizeCursor}
      isTextCursor={isTextCursor}
      isActiveClickable={isActiveClickable}
      {...props}
    >
      {children}
    </AnimatedCursor>
  );
}

export default AnimatedCursor;
