import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../general';
import { TextBlock } from './TextBlock';

export default {
  component: TextBlock,
} as ComponentMeta<typeof TextBlock>;

export const Default: ComponentStory<typeof TextBlock> = () => (
  <Flex flexDirection="row" height={600} gap={16} p={1}>
    <Flex
      flexDirection="column"
      width={432}
      height={300}
      p={2}
      background={'#FFFF'}
    >
      <TextBlock
        id="text-block-1"
        mode="display"
        text="The variety of threads allowed here are very flexible and we believe in freedom of speech, but we expect a high level of discourse befitting of the board. Attempts to disrupt the board will not be tolerated, nor will calls to disrupt other boards and sites."
        by="~lomder-librun"
        width={400}
        reference={{
          image: 'https://s.4cdn.org/image/favicon.ico',
          link: 'https://boards.4chan.org/pol/',
        }}
      />
    </Flex>
  </Flex>
);

export const DragExample: ComponentStory<typeof TextBlock> = () => (
  <Flex flexDirection="row" height={600} gap={16} p={1}>
    <Flex
      flexDirection="column"
      width={500}
      height={300}
      p={2}
      background={'#FFFF'}
    >
      <TextBlock
        id="text-block-1"
        mode="display"
        draggable
        text="The variety of threads allowed here are very flexible and we believe in freedom of speech, but we expect a high level of discourse befitting of the board. Attempts to disrupt the board will not be tolerated, nor will calls to disrupt other boards and sites."
        by="~lomder-librun"
        width={400}
        reference={{
          image: 'https://s.4cdn.org/image/favicon.ico',
          link: 'https://boards.4chan.org/pol/',
        }}
      />
    </Flex>
    <Flex
      flexDirection="column"
      width={500}
      height={300}
      p={2}
      background={'#FFFF'}
    ></Flex>
  </Flex>
);
