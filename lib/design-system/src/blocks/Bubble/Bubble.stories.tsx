import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../..';
import { Bubble } from './Bubble';

export default {
  component: Bubble,
} as ComponentMeta<typeof Bubble>;

export const Default: ComponentStory<typeof Bubble> = () => (
  <Flex flexDirection="column">
    <Bubble
      author="~fasnut-famden"
      authorColor="#FF0000"
      message={[{ text: 'Yo we should do XYZ in bold and italics' }]}
    />
  </Flex>
);
