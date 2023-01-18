import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../general/Flex/Flex';
import { TextInput } from './TextInput';

export default {
  component: TextInput,
} as ComponentMeta<typeof TextInput>;

export const Default: ComponentStory<typeof TextInput> = () => (
  <Flex flexDirection="column" width={300}>
    <TextInput id="input-1" name="test-input" placeholder="Placeholder here" />
  </Flex>
);

export const FullProps: ComponentStory<typeof TextInput> = () => (
  <Flex flexDirection="column" width={300}>
    <TextInput
      id="input-1"
      name="test-input-2"
      tabIndex={1}
      placeholder="optional"
      // error={'This is an error message'}
      onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
        console.log(evt.target.value);
      }}
      onFocus={(e) => {
        console.log('Focused');
      }}
      onBlur={(e) => {
        console.log('Blurred');
      }}
    />
  </Flex>
);
