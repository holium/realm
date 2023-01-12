import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../';
import { Block } from './';

export default {
  component: Block,
} as ComponentMeta<typeof Block>;

export const Default: ComponentStory<typeof Block> = () => (
  <Flex
    flexDirection="column"
    width={300}
    height={300}
    p={4}
    background={'#FFFF'}
  >
    <Block id="block-1">This is a text block I suppose.</Block>
  </Flex>
);
