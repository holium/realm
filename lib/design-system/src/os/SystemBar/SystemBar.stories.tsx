import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../';
import { SystemBar } from '.';

export default {
  component: SystemBar,
} as ComponentMeta<typeof SystemBar>;

export const Base: ComponentStory<typeof SystemBar> = () => (
  <Flex
    className="wallpaper"
    flexDirection="column"
    justifyContent="flex-end"
    p={2}
    width="100%"
    height="calc(100vh - 32px)"
  >
    <SystemBar />
  </Flex>
);
