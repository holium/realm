import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../..';
import { Icon } from '.';

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
