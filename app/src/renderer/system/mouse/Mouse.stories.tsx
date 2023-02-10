import { useEffect, useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '@holium/design-system';
import { AnimatedCursor } from './AnimatedCursor';
import { useToggle } from 'renderer/logic/lib/useToggle';

export default {
  argTypes: {
    state: {
      control: {
        type: 'select',
        options: ['pointer', 'text', 'resize'],
      },
    },
    color: {
      control: {
        type: 'text',
      },
    },
    isActive: {
      control: {
        type: 'boolean',
      },
    },
  },
} as ComponentMeta<typeof AnimatedCursor>;

const useMouseListeners = (mouseAreaId: string) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const visible = useToggle(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };

    document
      .getElementById(mouseAreaId)
      ?.addEventListener('mouseenter', visible.toggleOn);
    document
      .getElementById(mouseAreaId)
      ?.addEventListener('mouseleave', visible.toggleOff);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return { coords, visible };
};

export const Demo: ComponentStory<typeof AnimatedCursor> = ({
  state = 'pointer',
  color = '0, 0, 0',
  isActive = false,
}) => {
  const mouseAreaId = 'mouse-area';
  const { coords, visible } = useMouseListeners(mouseAreaId);

  return (
    <Flex
      id={mouseAreaId}
      className="wallpaper"
      flexDirection="column"
      justifyContent="flex-end"
      p={2}
      width="100%"
      height="calc(100vh - 32px)"
      style={{ cursor: 'none' }}
    >
      <AnimatedCursor
        state={state}
        coords={coords}
        isVisible={visible.isOn}
        isActive={isActive}
        color={color}
      />
    </Flex>
  );
};
