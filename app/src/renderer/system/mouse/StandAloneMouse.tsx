import { useEffect, useState } from 'react';
import { AnimatedCursor, MouseState } from './AnimatedCursor';
import { useToggle } from 'renderer/logic/lib/useToggle';
import { getMouseState } from './getMouseState';

const useMouseListeners = (containerId: string) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [state, setState] = useState<MouseState>('pointer');
  const visible = useToggle(false);
  const active = useToggle(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });

      setState(getMouseState(e));
    };

    const container = document.getElementById(containerId);

    if (!container) return;

    container.addEventListener('mouseenter', visible.toggleOn);
    container.addEventListener('mouseleave', visible.toggleOff);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', active.toggleOn);
    container.addEventListener('mouseup', active.toggleOff);

    return () => {
      container.removeEventListener('mouseenter', visible.toggleOn);
      container.removeEventListener('mouseleave', visible.toggleOff);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return { state, coords, isVisible: visible.isOn, isActive: active.isOn };
};

type Props = {
  containerId: string;
  color?: string;
};

/**
 * A standalone version of the Realm mouse that can be used without Electron IPC.
 * Used by AppUpdater and Storybook.
 */
export const StandAloneMouse = ({ containerId, color = '0, 0, 0' }: Props) => {
  const { state, coords, isActive, isVisible } = useMouseListeners(containerId);

  return (
    <AnimatedCursor
      state={state}
      coords={coords}
      isActive={isActive}
      isVisible={isVisible}
      color={color}
    />
  );
};
