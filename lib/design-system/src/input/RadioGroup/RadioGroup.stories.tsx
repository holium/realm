import { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { RadioGroup } from './RadioGroup';

export default {
  component: RadioGroup,
} as ComponentMeta<typeof RadioGroup>;

export const Default: ComponentStory<typeof RadioGroup> = () => {
  const [value, setValue] = useState('option-1');

  return (
    <RadioGroup
      options={[
        { label: 'Option 1', value: 'option-1' },
        { label: 'Option 2', value: 'option-2' },
        { label: 'Option 3', value: 'option-3' },
      ]}
      selected={value}
      onClick={setValue}
    />
  );
};
