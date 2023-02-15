import { useRef, useCallback, useEffect, Fragment } from 'react';
import { MotionStyle, motion, Variant } from 'framer-motion';
import { IsDevice } from './isDevice';

export type MouseState = 'text' | 'resize' | 'pointer';

export type Vec2 = {
  x: number;
  y: number;
};

interface AnimatedCursorProps {
  color: string | null;
  outerAlpha?: number;
  innerSize?: number;
  outerSize?: number;
  outerScale?: number;
  innerScale?: number;
  trailingSpeed?: number;
  coords: Vec2;
  state: MouseState;
  isActive: boolean;
  isActiveClickable?: boolean;
  isVisible: boolean;
  initialRender?: boolean;
}

/**
 * @param {string} color - rgb color value
 * @param {number} outerAlpha - level of alpha transparency for color
 * @param {number} innerSize - inner cursor size in px
 * @param {number} innerScale - inner cursor scale amount
 * @param {number} outerSize - outer cursor size in px
 * @param {number} outerScale - outer cursor scale amount
 * @param {array}  clickables - array of clickable selectors
 */
const CursorCore = ({
  color,
  outerAlpha = 0.2,
  innerSize = 10,
  outerSize = 12,
  outerScale = 2,
  innerScale = 0.9,
  trailingSpeed = 1,
  coords,
  state,
  isActive,
  isActiveClickable,
  isVisible = true,
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
    [requestRef]
  );

  // RAF for animateOuterCursor
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateOuterCursor);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
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

  const cursorVariants: Record<MouseState, Variant> = {
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
    <Fragment>
      <motion.div
        ref={cursorOuterRef}
        animate={{
          opacity: state === 'text' ? 0 : 1,
        }}
        transition={{ opacity: 0.05 }}
        style={{
          ...styles.cursorOuter,
          visibility: isVisible ? 'visible' : 'hidden',
        }}
      />
      <motion.div
        ref={cursorInnerRef}
        variants={cursorVariants}
        animate={state}
        transition={{
          width: 0.15,
          height: 0.15,
          borderRadius: 0.15,
          visibility: 0.1,
        }}
        style={{
          ...styles.cursorInner,
        }}
      />
    </Fragment>
  );
};

/**
 * Calls and passes props to CursorCore if not a touch/mobile device.
 */
export const AnimatedCursor = ({ ...props }: AnimatedCursorProps) => {
  if (typeof navigator !== 'undefined' && IsDevice?.any()) {
    return <Fragment></Fragment>;
  }

  return <CursorCore {...props} />;
};
