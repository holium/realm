import { ComponentStory, ComponentMeta } from '@storybook/react';
import { CheckBox } from './CheckBox';

export default {
  component: CheckBox,
} as ComponentMeta<typeof CheckBox>;

export const Default: ComponentStory<typeof CheckBox> = () => (
  <CheckBox label="Look at me, I am the label now" />
);

export const Error: ComponentStory<typeof CheckBox> = () => (
  <CheckBox label="Look at me, I am the label now" isError />
);
