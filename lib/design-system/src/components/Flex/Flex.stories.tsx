import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from './Flex';

export default {
  component: Flex,
} as ComponentMeta<typeof Flex>;

export const FlexDemo: ComponentStory<typeof Flex> = () => (
  <Flex>
    <Flex bg="card" color="base" flex={1} padding={12}>
      Flex 1
    </Flex>
    <Flex color="text" flex={1} padding={12}>
      Flex 1
    </Flex>
  </Flex>
);
