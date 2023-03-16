import { useState, useEffect } from 'react';
import { MouseState } from '@holium/realm-presence';
import { useToggle } from 'renderer/logic/lib/useToggle';
import { hexToRgb, rgbToString } from 'os/lib/color';
import { AnimatedCursor } from './AnimatedCursor';
import { EphemeralChat } from './Mouse.styles';

export const Mouse = () => {
  const active = useToggle(false);
  const visible = useToggle(false);
  const disabled = useToggle(false);
  const mouseLayerTracking = useToggle(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [state, setState] = useState<MouseState>('pointer');
  const [mouseColor, setMouseColor] = useState('0, 0, 0');
  const ephemeralChat = useToggle(false);
  const [chat, setChat] = useState('');

  useEffect(() => {
    window.electron.app.onMouseOut(visible.toggleOff);

    window.electron.app.onMouseMove((newCoordinates, newState, isDragging) => {
      // We only use the IPC'd coordinates if
      // A) mouse layer tracking is disabled (Win & Linux), or
      // B) the mouse is dragging, since the mouse layer can't record position on drag.
      if (!mouseLayerTracking.isOn || isDragging) {
        setPosition(newCoordinates);
      }

      if (!isDragging) setState(newState);
      if (!visible.isOn) visible.toggleOn();
    });

    window.electron.app.onMouseDown(active.toggleOn);

    window.electron.app.onMouseUp(active.toggleOff);

    window.electron.app.onMouseColorChange((hex) => {
      const rgbString = rgbToString(hexToRgb(hex));
      if (rgbString) setMouseColor(rgbString);
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!active.isOn) setPosition({ x: e.clientX, y: e.clientY });
    };

    window.electron.app.onEnableMouseLayerTracking(() => {
      mouseLayerTracking.toggleOn();
      window.addEventListener('mousemove', handleMouseMove);
    });

    window.electron.app.onDisableCustomMouse(disabled.toggleOn);

    window.electron.app.onToggleOnEphemeralChat(ephemeralChat.toggleOn);

    window.electron.app.onToggleOffEphemeralChat(ephemeralChat.toggleOff);

    window.electron.app.onRealmToAppEphemeralChat((_, c) => setChat(c));

    return () => {
      if (mouseLayerTracking.isOn) {
        window.removeEventListener('mousemove', handleMouseMove);
      }

      window.electron.app.removeOnMouseOut();
      window.electron.app.removeOnMouseMove();
      window.electron.app.removeOnMouseDown();
      window.electron.app.removeOnMouseUp();
      window.electron.app.removeOnMouseColorChange();
      window.electron.app.removeOnEnableMouseLayerTracking();
      window.electron.app.removeOnDisableCustomMouse();
      window.electron.app.removeOnToggleOnEphemeralChat();
      window.electron.app.removeOnToggleOffEphemeralChat();
      window.electron.app.removeOnRealmToAppEphemeralChat();
    };
  }, [active.isOn, visible.isOn, mouseLayerTracking.isOn]);

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
