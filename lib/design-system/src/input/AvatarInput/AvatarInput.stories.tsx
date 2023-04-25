import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Flex } from '../../general/Flex/Flex';

import { AvatarInput } from './AvatarInput';

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
  width: 400,
  onSave: (url) => {
    console.log('should save url', url);
  },
};
