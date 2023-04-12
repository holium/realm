import { ComponentMeta, ComponentStory } from '@storybook/react';
import { ErrorBox, SuccessBox } from './IntentBox';

export default {
  component: ErrorBox,
} as ComponentMeta<typeof ErrorBox>;

export const Error: ComponentStory<typeof ErrorBox> = () => (
  <ErrorBox>I'm an error</ErrorBox>
);

export const Success: ComponentStory<typeof SuccessBox> = () => (
  <SuccessBox>I'm a success</SuccessBox>
);
