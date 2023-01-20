import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../';
import { TreeView } from './';

export default {
  component: TreeView,
} as ComponentMeta<typeof TreeView>;

export const Default: ComponentStory<typeof TreeView> = () => (
  <Flex flexDirection="column">
    <TreeView />
  </Flex>
);
