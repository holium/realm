import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Icon } from './Icon';
import { Flex } from '../Flex/Flex';

export default {
  component: Icon,
} as ComponentMeta<typeof Icon>;

export const Default: ComponentStory<typeof Icon> = (args) => (
  <Flex>
    <Icon {...args} />
  </Flex>
);

Default.args = {
  name: 'Messages',
};
