import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Flex } from '@holium/design-system/general';

import { AnimatedCursor } from './AnimatedCursor';
import { StandAloneMouse } from './StandAloneMouse';

export default {
  argTypes: {
    color: {
      control: {
        type: 'text',
      },
    },
  },
  title: 'OS/Mouse',
} as ComponentMeta<typeof AnimatedCursor>;

export const Demo: ComponentStory<typeof AnimatedCursor> = ({
  color,
}: {
  color?: string;
}) => {
  const containerId = 'mouse-area';

  return (
    <Flex
      id={containerId}
      className="wallpaper"
      flexDirection="column"
      justifyContent="flex-end"
      p={2}
      width="100%"
      height="calc(100vh - 32px)"
      style={{ cursor: 'none' }}
    >
      <StandAloneMouse containerId={containerId} color={color ?? '0, 0, 0'} />
    </Flex>
  );
};
