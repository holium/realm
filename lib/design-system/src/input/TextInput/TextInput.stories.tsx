import { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { TextInput } from './TextInput';
import { Icon } from '../../general/Icon/Icon';
import { Button } from '../../general/Button/Button';

export default {
  component: TextInput,
} as ComponentMeta<typeof TextInput>;

export const Default: ComponentStory<typeof TextInput> = () => (
  <TextInput
    width={300}
    id="input-1"
    name="test-input"
    placeholder="Placeholder here"
  />
);

export const FullProps: ComponentStory<typeof TextInput> = () => (
  <TextInput
    width={300}
    id="input-2"
    name="test-input-2"
    tabIndex={1}
    placeholder="optional"
    // error={'This is an error message'}
    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
      console.log(evt.target.value);
    }}
    onFocus={() => console.log('Focused')}
    onBlur={() => console.log('Blurred')}
  />
);

export const Password: ComponentStory<typeof TextInput> = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextInput
      width={300}
      id="input-3"
      name="test-input-3"
      type={showPassword ? 'text' : 'password'}
      placeholder="Password"
      rightAdornment={
        <Button.IconButton onClick={() => setShowPassword((prev) => !prev)}>
          <Icon name={showPassword ? 'EyeOff' : 'EyeOn'} opacity={0.5} />
        </Button.IconButton>
      }
    />
  );
};
