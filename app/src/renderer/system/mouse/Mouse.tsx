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
  const mouseLayerTracking = useToggle(false);
  const disabled = useToggle(false);
  const [icon, setIcon] = useState<'Airlift' | undefined>(undefined);
  const [airlift, setAirlift] = useState<string | undefined>(undefined);

  useEffect(() => {
    window.electron.app.onMouseOver(visible.toggleOn);
    window.electron.app.onMouseOut(visible.toggleOff);
    window.electron.app.onMouseMove((newCoordinates, newState, isDragging) => {
      // We only use the IPC'd coordinates if
      // A) mouse layer tracking is disabled, or
      // B) the mouse is dragging, since the mouse layer doesn't capture movement on click.
      if (!mouseLayerTracking.isOn) {
        setCoords(newCoordinates);
      } else {
        if (isDragging) setCoords(newCoordinates);
      }
      setState(newState);
    });

    window.electron.app.onMouseColorChange((hex) => {
      const rgbString = rgbToString(hexToRgb(hex));
      if (rgbString) setMouseColor(rgbString);
    });

    window.electron.app.onMouseDown(active.toggleOn);
    window.electron.app.onMouseUp(active.toggleOff);
    window.electron.app.onMouseIcon(setIcon);
    window.electron.app.onAirlift((blah: any) => {
      /*const image = new Image();
      image.src = blah;*/
      setAirlift(blah);
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!active.isOn) setCoords({ x: e.clientX, y: e.clientY });
    };

    window.electron.app.onEnableMouseLayerTracking(() => {
      mouseLayerTracking.toggleOn();
      window.addEventListener('mousemove', handleMouseMove);
    });

    window.electron.app.onDisableCustomMouse(disabled.toggleOn);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (disabled.isOn) return null;

  return (
    <AnimatedCursor
      state={state}
      coords={coords}
      isActive={active.isOn}
      isVisible={visible.isOn}
      color={mouseColor}
      icon={icon}
      airlift={airlift}
    />
  );
};
