import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../..';
import { AvatarInput } from '.';

export default {
  component: AvatarInput,
} as ComponentMeta<typeof AvatarInput>;

export const Default: ComponentStory<typeof AvatarInput> = (args) => (
  <Flex>
    <AvatarInput {...args} />
  </Flex>
);

Default.args = {
  id: 'test-avatar',
  onSave: (url) => {
    console.log('should save url', url);
  },
};
