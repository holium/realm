import { useEffect, useState } from 'react';
import { MouseState } from '@holium/realm-presence';
import { AnimatedCursor } from './AnimatedCursor';
import { useToggle } from 'renderer/logic/lib/useToggle';
import { getMouseState } from './getMouseState';

const useMouseState = (containerId: string) => {
  const active = useToggle(false);
  const visible = useToggle(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [state, setState] = useState<MouseState>('pointer');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

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
      container.removeEventListener('mousedown', active.toggleOn);
      container.removeEventListener('mouseup', active.toggleOff);
    };
  }, []);

  return { state, position, isVisible: visible.isOn, isActive: active.isOn };
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
  const { state, position, isActive, isVisible } = useMouseState(containerId);

  return (
    <AnimatedCursor
      color={color}
      state={state}
      position={position}
      isActive={isActive}
      isVisible={isVisible}
    />
  );
};
