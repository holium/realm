import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from './Flex';

export default {
  component: Flex,
} as ComponentMeta<typeof Flex>;

export const FlexDemo: ComponentStory<typeof Flex> = () => (
  <Flex>
    <Flex flex={1} p={12} color="base" bg="card">
      Flex 1
    </Flex>
    <Flex flex={1} p={12} color="text">
      Flex 1
    </Flex>
  </Flex>
);
