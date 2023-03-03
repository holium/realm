import { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { RadioImages } from './RadioImages';

export default {
  component: RadioImages,
} as ComponentMeta<typeof RadioImages>;

export const Default: ComponentStory<typeof RadioImages> = () => {
  const [value, setValue] = useState('option-1');

  return (
    <RadioImages
      options={[
        { value: 'alpha', imageSrc: 'https://picsum.photos/200' },
        { value: 'beta', imageSrc: 'https://picsum.photos/200' },
        { value: 'gamma', imageSrc: 'https://picsum.photos/200' },
      ]}
      selected={value}
      onClick={setValue}
    />
  );
};
