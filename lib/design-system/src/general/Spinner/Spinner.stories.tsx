import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Spinner } from './Spinner';

export default {
  component: Spinner,
} as ComponentMeta<typeof Spinner>;

export const Default: ComponentStory<typeof Spinner> = () => (
  <Spinner size={1} />
);
