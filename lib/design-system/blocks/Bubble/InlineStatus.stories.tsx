import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Flex } from '../../general';
import { InlineStatus } from './InlineStatus';

export default {
  component: InlineStatus,
} as ComponentMeta<typeof InlineStatus>;

export const Default: ComponentStory<typeof InlineStatus> = () => {
  return (
    <Flex position="relative" height={670} width={400}>
      <InlineStatus id="1" text="~sicnum-rocwen joined the chat" />
    </Flex>
  );
};
