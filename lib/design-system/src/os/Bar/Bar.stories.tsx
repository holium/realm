import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex, Text } from '../../';
import { Bar } from '.';

export default {
  component: Bar,
} as ComponentMeta<typeof Bar>;

export const Base: ComponentStory<typeof Bar> = () => (
  <Flex
    className="wallpaper"
    flexDirection="column"
    justifyContent="flex-end"
    p={2}
    width="100%"
    height="calc(100vh - 32px)"
  >
    <Bar>
      <Text.Default>System bar</Text.Default>
    </Bar>
  </Flex>
);
