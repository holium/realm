import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../';
import { Bookmark } from './';

export default {
  component: Bookmark,
} as ComponentMeta<typeof Bookmark>;

export const Default: ComponentStory<typeof Bookmark> = () => (
  <Flex flexDirection="column">
    <Bookmark />
  </Flex>
);
