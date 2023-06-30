import { useState } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Select } from './Select';

export default {
  component: Select,
} as ComponentMeta<typeof Select>;

export const Default: ComponentStory<typeof Select> = () => {
  const [selected, setSelected] = useState('alpha');

  return (
    <Select
      id="select-input-story"
      maxWidth={200}
      options={[
        { label: 'alpha', value: 'alpha', disabled: true },
        { label: 'beta', value: 'beta' },
        { label: 'gamma', value: 'gamma' },
      ]}
      selected={selected}
      onClick={(value) => setSelected(value as string)}
    />
  );
};
