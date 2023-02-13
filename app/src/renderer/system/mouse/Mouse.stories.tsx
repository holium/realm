import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '@holium/design-system';
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
  title: 'App/System/Mouse',
} as ComponentMeta<typeof AnimatedCursor>;

export const Demo: ComponentStory<typeof AnimatedCursor> = ({ color }) => {
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
