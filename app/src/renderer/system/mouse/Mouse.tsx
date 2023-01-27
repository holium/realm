import { useState, useEffect, PropsWithChildren } from 'react';
import { useToggle } from 'renderer/logic/lib/useToggle';
import { AnimatedCursor, MouseState } from './AnimatedCursor';

export const Mouse = ({ children }: PropsWithChildren) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [state, setState] = useState<MouseState>('pointer');
  const active = useToggle(false);
  const visible = useToggle(false);

  useEffect(() => {
    window.electron.app.onMouseMove((newCoordinates, newState) => {
      setCoords(newCoordinates);
      setState(newState);
    });

    window.electron.app.onMouseDown(active.toggleOn);
    window.electron.app.onMouseUp(active.toggleOff);

    const handleMouseOver = () => visible.toggleOn();
    const handleMouseOut = () => visible.toggleOff();

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
  }, []);

  return (
    <AnimatedCursor
      state={state}
      coords={coords}
      isActive={active.isOn}
      isVisible={visible.isOn}
    >
      {children}
    </AnimatedCursor>
  );
};
