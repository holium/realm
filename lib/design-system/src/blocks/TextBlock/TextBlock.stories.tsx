import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../..';
import { TextBlock } from './';

export default {
  component: TextBlock,
} as ComponentMeta<typeof TextBlock>;

export const Default: ComponentStory<typeof TextBlock> = () => (
  <Flex
    flexDirection="column"
    width={300}
    height={300}
    p={4}
    background={'#FFFF'}
  >
    <TextBlock
      id="text-block-1"
      mode="display"
      text="The variety of threads allowed here are very flexible and we believe in freedom of speech, but we expect a high level of discourse befitting of the board. Attempts to disrupt the board will not be tolerated, nor will calls to disrupt other boards and sites."
      by="~lomder-librun"
      reference={{
        image: 'https://s.4cdn.org/image/favicon.ico',
        link: 'https://boards.4chan.org/pol/',
      }}
    />
  </Flex>
);
