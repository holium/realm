import { useEffect, useState } from 'react';

import { hexToRgb, rgbToString, useToggle } from '@holium/design-system/util';
import { MouseState } from '@holium/realm-presence';

import { AnimatedCursor } from './AnimatedCursor';
import { EphemeralChat } from './Mouse.styles';

export const Mouse = () => {
  const enabled = useToggle(true);
  const active = useToggle(false);
  const visible = useToggle(false);
  const mouseLayerTracking = useToggle(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [state, setState] = useState<MouseState>('pointer');
  const [mouseColor, setMouseColor] = useState('78, 158, 253');
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

    const handleMouseMove = (e: MouseEvent) => {
      // If this code is reached, great, it means the device (probably macOS)
      // can detect mouse movement directly in the mouse layer, so we'll use that instead of IPC.
      // At least for moving, dragging is still IPC'd.
      if (!mouseLayerTracking.isOn) mouseLayerTracking.toggleOn();

      if (!active.isOn) setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    window.electron.app.onMouseDown(active.toggleOn);

    window.electron.app.onMouseUp(active.toggleOff);

    window.electron.app.onMouseColorChange((hex) => {
      const rgbString = rgbToString(hexToRgb(hex));
      if (rgbString) setMouseColor(rgbString);
    });

    window.electron.app.onEnableRealmCursor(enabled.toggleOn);
    window.electron.app.onDisableRealmCursor(enabled.toggleOff);
    window.electron.app.isRealmCursorEnabled().then(enabled.setToggle);

    window.electron.app.onToggleOnEphemeralChat(ephemeralChat.toggleOn);

    window.electron.app.onToggleOffEphemeralChat(() => {
      ephemeralChat.toggleOff();
      setChat('');
    });

    window.electron.app.onRealmToAppEphemeralChat((_, c) => setChat(c));

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!enabled.isOn) return null;

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
