import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { MouseState } from '@holium/realm-multiplayer';
import { useToggle } from 'renderer/logic/lib/useToggle';
import { bgIsLightOrDark, hexToRgb, rgbToString } from 'os/lib/color';
import { AnimatedCursor } from './AnimatedCursor';
import { Position } from 'os/types';

export const Mouse = () => {
  const active = useToggle(false);
  const visible = useToggle(false);
  const disabled = useToggle(false);
  const mouseLayerTracking = useToggle(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [state, setState] = useState<MouseState>('pointer');
  const [mouseColor, setMouseColor] = useState('0, 0, 0');
  const mouseOutTimeoutRef = useRef<NodeJS.Timeout>();
  const ephemeralChat = useToggle(false);
  const [chat, setChat] = useState('');

  useEffect(() => {
    window.electron.app.onMouseOut(() => {
      // We don't want to hide the cursor immediately because
      // mouseout can be called when moving between contexts (e.g. webviews).
      mouseOutTimeoutRef.current = setTimeout(() => {
        visible.toggleOff();
      }, 100);
    });
    window.electron.app.onMouseMove((newCoordinates, newState, isDragging) => {
      // We only use the IPC'd coordinates if
      // A) mouse layer tracking is disabled, or
      // B) the mouse is dragging, since position freezes on click.
      if (!mouseLayerTracking.isOn) {
        setPosition(newCoordinates);
      } else {
        if (isDragging) setPosition(newCoordinates);
      }
      if (!isDragging) setState(newState);
      if (!visible.isOn) visible.toggleOn();
      if (mouseOutTimeoutRef.current) clearTimeout(mouseOutTimeoutRef.current);
    });
    window.electron.app.onMouseColorChange((hex) => {
      const rgbString = rgbToString(hexToRgb(hex));
      if (rgbString) setMouseColor(rgbString);
    });
    window.electron.app.onMouseDown(active.toggleOn);
    window.electron.app.onMouseUp(active.toggleOff);

    const handleMouseMove = (e: MouseEvent) => {
      if (!active.isOn) setPosition({ x: e.clientX, y: e.clientY });
    };

    window.electron.app.onEnableMouseLayerTracking(() => {
      mouseLayerTracking.toggleOn();
      window.addEventListener('mousemove', handleMouseMove);
    });

    window.electron.app.onDisableCustomMouse(disabled.toggleOn);

    window.electron.app.onToggleEphemeralChat(ephemeralChat.toggle);

    window.electron.app.onRealmToAppEphemeralChat((_, c) => {
      setChat(c);
    });

    return () => {
      if (mouseLayerTracking.isOn) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  if (disabled.isOn) return null;

  return (
    <>
      <AnimatedCursor
        state={state}
        color={mouseColor}
        position={position}
        isActive={active.isOn}
        isVisible={visible.isOn}
      />
      {ephemeralChat.isOn && (
        <EphemeralChat position={position} color={mouseColor}>
          {chat}
        </EphemeralChat>
      )}
    </>
  );
};

export const EphemeralChat = styled.div<{ position: Position; color: string }>`
  position: absolute;
  top: ${({ position }) => position.y}px;
  left: ${({ position }) => position.x}px;
  padding: 16px;
  border-radius: 0 999px 999px 999px;
  color: ${({ color }) =>
    bgIsLightOrDark(color) === 'dark' ? 'white' : 'black'};
  background-color: ${({ color }) => `rgba(${color}, 0.5)`};
  border: 1px solid ${({ color }) => `rgba(${color}, 0.5)`};
  font-family: 'Rubik', sans-serif;
`;
