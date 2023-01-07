import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../';
import { TextInput } from './';

export default {
  component: TextInput,
} as ComponentMeta<typeof TextInput>;

export const Default: ComponentStory<typeof TextInput> = () => (
  <Flex flexDirection="column" width={300}>
    <TextInput id="input-1" name="test-input" placeholder="Placeholder here" />
  </Flex>
);

export const TextArea: ComponentStory<typeof TextInput> = () => (
  <Flex flexDirection="column">
    <TextInput
      id="input-2"
      name="test-area-input"
      type="textarea"
      placeholder="Placeholder here"
      rows={4}
      cols={40}
    />
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
