import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../';
import { Block } from './';

export default {
  component: Block,
} as ComponentMeta<typeof Block>;

export const Default: ComponentStory<typeof Block> = () => (
  <Flex
    flexDirection="column"
    gap={8}
    width={500}
    height={300}
    p={4}
    background={'#FFFF'}
  >
    <Block id="block-1" mode="embed">
      This is an embed block.
    </Block>
    <Block id="block-2" mode="display">
      This is a display block.
    </Block>
  </Flex>
);
