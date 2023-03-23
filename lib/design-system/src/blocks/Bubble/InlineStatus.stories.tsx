import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../..';
import { InlineStatus } from './InlineStatus';

export default {
  component: InlineStatus,
} as ComponentMeta<typeof InlineStatus>;

export const Default: ComponentStory<typeof InlineStatus> = () => {
  return (
    <Flex position="relative" height={670} width={400}>
      <InlineStatus text="~sicnum-rocwen joined the chat" />
    </Flex>
  );
};
