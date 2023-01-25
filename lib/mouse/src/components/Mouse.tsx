import { useState, useEffect, useCallback, PropsWithChildren } from 'react';
import { AnimatedCursor, MouseState } from './AnimatedCursor';
import { useEventListener } from './useEventListener';

export const Mouse = ({ children }: PropsWithChildren) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [state, setState] = useState<MouseState>('pointer');
  const [isActive, setIsActive] = useState(false);
  // Only state that is not coming from the app layer:
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.electron.app.onMouseMove((newCoordinates, newState) => {
      setCoords(newCoordinates);
      setState(newState);
    });

    window.electron.app.onMouseDown(() => {
      setIsActive(true);
    });

    window.electron.app.onMouseUp(() => {
      setIsActive(false);
    });
  }, []);

  const onMouseEnterViewport = useCallback(() => {
    setIsVisible(true);
    setIsActive(false);
  }, []);

  const onMouseLeaveViewport = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEventListener('mouseover', onMouseEnterViewport);
  useEventListener('mouseout', onMouseLeaveViewport);

  return (
    <AnimatedCursor
      state={state}
      coords={coords}
      isActive={isActive}
      isVisible={isVisible}
    >
      {children}
    </AnimatedCursor>
  );
};
