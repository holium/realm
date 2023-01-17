import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../';
import { Folder } from './';

export default {
  component: Folder,
} as ComponentMeta<typeof Folder>;

export const Default: ComponentStory<typeof Folder> = () => (
  <Flex flexDirection="column">
    <Folder />
  </Flex>
);
