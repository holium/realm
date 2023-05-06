import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Flex } from '../../general/Flex/Flex';
import { InlineEdit } from './InlineEdit';

export default {
  component: InlineEdit,
} as ComponentMeta<typeof InlineEdit>;

export const InlineEditBase: ComponentStory<typeof InlineEdit> = () => (
  <Flex flexDirection="column" width={300} p={4} gap={20}>
    <InlineEdit
      id="input-1"
      type="text"
      placeholder="Placeholder here"
      value="My text here"
    />
    <InlineEdit
      id="input-1"
      type="text"
      textAlign="center"
      fontSize={20}
      fontWeight={500}
      placeholder="Placeholder here"
      value="My text here"
    />
  </Flex>
);
