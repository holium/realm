import { useRef, useCallback, useEffect, Fragment, useMemo } from 'react';
import { MotionStyle, motion, Variant } from 'framer-motion';
import { MouseState } from '@holium/realm-presence';
import { Position } from '@holium/shared';
import { IsDevice } from './isDevice';

const innerSize = 10;
const outerSize = 12;
const outerScale = 2;
const innerScale = 0.9;

type Props = {
  color: string;
  state: MouseState;
  position: Position;
  isActive: boolean;
  isVisible: boolean;
};

const AnimatedCursorView = ({
  color,
  state,
  position,
  isActive,
  isVisible,
}: Props) => {
  const cursorOuterRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const endX = useRef(0);
  const endY = useRef(0);

  const animateOuterCursor = useCallback(
    (time: number) => {
      if (!cursorOuterRef.current) return;
      if (previousTimeRef.current !== undefined) {
        position.x += endX.current - position.x;
        position.y += endY.current - position.y;
        cursorOuterRef.current.style.top = `${position.y}px`;
        cursorOuterRef.current.style.left = `${position.x}px`;
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
    cursorInnerRef.current.style.top = `${position.y}px`;
    cursorInnerRef.current.style.left = `${position.x}px`;
    if (cursorInnerRef.current.style.transform === 'none') {
      // if for some reason the transform isnt set yet.
      cursorInnerRef.current.style.transform =
        'translate(-50%, -50%) scale(1.0)';
      cursorOuterRef.current.style.transform =
        'translate(-50%, -50%) scale(1.0)';
    }
    endX.current = position.x;
    endY.current = position.y;
  }, [position]);

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

  // Cursor Styles
  const styles: Record<string, MotionStyle> = useMemo(
    () => ({
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
        backgroundColor: `rgba(${color}, 0.2)`,
        transition: 'transform 0.15s ease-in-out',
        willChange: 'transform',
      },
    }),
    [color, innerSize, outerSize]
  );

  const cursorVariants: Record<MouseState, Variant> = useMemo(
    () => ({
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
    }),
    [innerSize, isVisible]
  );

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
        style={styles.cursorInner}
      />
    </Fragment>
  );
};

export const AnimatedCursor = ({ ...props }: Props) => {
  const isTouchDevice = typeof navigator !== 'undefined' && IsDevice?.any();

  if (isTouchDevice) return null;

  return <AnimatedCursorView {...props} />;
};
