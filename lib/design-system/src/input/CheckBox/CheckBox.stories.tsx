import { ComponentStory, ComponentMeta } from '@storybook/react';
import { CheckBox } from './CheckBox';

export default {
  component: CheckBox,
} as ComponentMeta<typeof CheckBox>;

export const Default: ComponentStory<typeof CheckBox> = () => (
  <CheckBox label="Look at me, I am the label now" />
);

export const DefaultChecked: ComponentStory<typeof CheckBox> = () => (
  <CheckBox label="Look at me, I am the label now" defaultChecked />
);

export const Disabled: ComponentStory<typeof CheckBox> = () => (
  <CheckBox label="Look at me, I am the label now" disabled />
);
