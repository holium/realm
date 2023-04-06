import { ComponentStory, ComponentMeta } from '@storybook/react';
import { CopyButton } from './CopyButton';

export default {
  component: CopyButton,
} as ComponentMeta<typeof CopyButton>;

export const CopyButtonDemo: ComponentStory<typeof CopyButton> = () => (
  <CopyButton content="test1234" label="Copy" />
);
