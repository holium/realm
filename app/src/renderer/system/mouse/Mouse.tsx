import { useState, useEffect, useCallback } from 'react';
import { useToggle } from 'renderer/logic/lib/useToggle';
import { hexToRgb, rgbToString } from 'os/lib/color';
import { AnimatedCursor, MouseState } from './AnimatedCursor';
import { Position } from 'os/types';
import {
  CursorEvent,
  CursorMovePayload,
  SendPartial,
  useRealmMultiplayer,
} from '@holium/realm-multiplayer';

export const Mouse = () => {
  const { api } = useRealmMultiplayer();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [state, setState] = useState<MouseState>('pointer');
  const [mouseColor, setMouseColor] = useState('0, 0, 0');
  const active = useToggle(false);
  const visible = useToggle(false);
  const mouseLayerTracking = useToggle(false);

  const updateMousePosition = useCallback((newPosition: Position) => {
    // Update the coordinates locally.
    setPosition(newPosition);
    // Signal to the rest of the network.
    const payload: SendPartial<CursorMovePayload> = {
      event: CursorEvent.Move,
      position: newPosition,
    };

    if (api) api.send(payload);
  }, []);

  useEffect(() => {
    window.electron.app.onMouseOver(visible.toggleOn);
    window.electron.app.onMouseOut(visible.toggleOff);
    window.electron.app.onMouseMove((newCoordinates, newState, isDragging) => {
      // We only use the IPC'd coordinates if
      // A) mouse layer tracking is disabled, or
      // B) the mouse is dragging, since the mouse layer doesn't capture movement on click.
      if (!mouseLayerTracking.isOn) {
        setPosition(newCoordinates);
      } else {
        if (isDragging) updateMousePosition(newCoordinates);
      }
      setState(newState);
    });

    window.electron.app.onMouseColorChange((hex) => {
      const rgbString = rgbToString(hexToRgb(hex));
      if (rgbString) setMouseColor(rgbString);
    });

    window.electron.app.onMouseDown(active.toggleOn);
    window.electron.app.onMouseUp(active.toggleOff);

    const handleMouseMove = (e: MouseEvent) => {
      if (!active.isOn) updateMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.electron.app.onEnableMouseLayerTracking(() => {
      mouseLayerTracking.toggleOn();
      window.addEventListener('mousemove', handleMouseMove);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <AnimatedCursor
      state={state}
      coords={position}
      isActive={active.isOn}
      isVisible={visible.isOn}
      color={mouseColor}
    />
  );
};
