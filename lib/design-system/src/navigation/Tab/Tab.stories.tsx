import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../';
import { Tab } from './';

export default {
  component: Tab,
} as ComponentMeta<typeof Tab>;

export const Default: ComponentStory<typeof Tab> = () => (
  <Flex flexDirection="column">
    <Tab />
  </Flex>
);
