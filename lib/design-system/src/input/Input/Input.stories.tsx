import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../general/Flex/Flex';
import { Input, TextArea } from './Input';

export default {
  component: Input,
} as ComponentMeta<typeof Input>;

export const InputBase: ComponentStory<typeof Input> = () => (
  <Flex flexDirection="column" width={300}>
    <Input id="input-1" type="text" placeholder="Placeholder here" />
  </Flex>
);

export const TextAreaBase: ComponentStory<typeof Input> = () => (
  <Flex flexDirection="column" width={300}>
    <TextArea id="text-area-1" placeholder="Placeholder here" />
  </Flex>
);
