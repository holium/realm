import { ComponentMeta, ComponentStory } from '@storybook/react';

import { RadioImages } from './RadioImages';

export default {
  component: RadioImages,
} as ComponentMeta<typeof RadioImages>;

export const Default: ComponentStory<typeof RadioImages> = () => (
  <RadioImages
    options={[
      'https://picsum.photos/200',
      'https://picsum.photos/201',
      'https://picsum.photos/202',
    ]}
    onClick={() => {}}
  />
);
