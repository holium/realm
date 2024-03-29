import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Flex } from '../../../general';
import { TreeView } from './';

export default {
  component: TreeView,
} as ComponentMeta<typeof TreeView>;

export const Default: ComponentStory<typeof TreeView> = () => (
  <Flex flexDirection="column">
    <TreeView />
  </Flex>
);
