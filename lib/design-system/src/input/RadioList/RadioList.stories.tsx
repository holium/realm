import { ComponentStory, ComponentMeta } from '@storybook/react';
import { RadioList } from './RadioList';

export default {
  component: RadioList,
} as ComponentMeta<typeof RadioList>;

export const Default: ComponentStory<typeof RadioList> = () => (
  <RadioList
    options={[
      { label: 'Option 1', value: 'option-1' },
      { label: 'Option 2', value: 'option-2' },
      { label: 'Option 3', value: 'option-3' },
    ]}
    onClick={(value) => console.log(value)}
  />
);
