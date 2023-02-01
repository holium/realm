import { useState, useEffect } from 'react';
import { useToggle } from 'renderer/logic/lib/useToggle';
import { hexToRgb, rgbToString } from 'os/lib/color';
import { AnimatedCursor, MouseState } from './AnimatedCursor';

export const Mouse = () => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [state, setState] = useState<MouseState>('pointer');
  const [mouseColor, setMouseColor] = useState('0, 0, 0');
  const active = useToggle(false);
  const visible = useToggle(false);

  useEffect(() => {
    window.electron.app.onMouseMove((newCoordinates, newState, isDragging) => {
      // We only use the IPC's coordinates if we're dragging since the
      // mouse layer doesn't capture the mouse position when it's dragging.
      if (isDragging) setCoords(newCoordinates);
      setState(newState);
    });

    window.electron.app.onMouseColorChange((hex) => {
      const rgbString = rgbToString(hexToRgb(hex));
      if (rgbString) setMouseColor(rgbString);
    });

    window.electron.app.onMouseDown(active.toggleOn);
    window.electron.app.onMouseUp(active.toggleOff);

    const handleMouseOver = visible.toggleOn;
    const handleMouseOut = visible.toggleOff;
    const handleMouseMove = (e: MouseEvent) => {
      if (!active.isOn) setCoords({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <AnimatedCursor
      state={state}
      coords={coords}
      isActive={active.isOn}
      isVisible={visible.isOn}
      color={mouseColor}
    />
  );
};
