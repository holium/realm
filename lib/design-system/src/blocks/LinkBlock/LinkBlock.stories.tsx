import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../..';
import { LinkBlock } from './LinkBlock';

export default {
  component: LinkBlock,
} as ComponentMeta<typeof LinkBlock>;

export const Default: ComponentStory<typeof LinkBlock> = () => (
  <Flex flexDirection="row" height={600} gap={16} p={1}>
    <Flex
      flexDirection="column"
      width={400}
      height={300}
      p={2}
      background={'#FFFF'}
    >
      <LinkBlock
        id="link-block-1"
        mode="display"
        link={
          'https://www.theverge.com/2023/1/23/23567333/spotify-layoffs-daniel-ek-cost-cutting'
        }
        by="~lomder-librun"
        width={350}
      />
    </Flex>
    <Flex
      flexDirection="column"
      width={400}
      height={300}
      p={2}
      background={'#FFFF'}
    >
      <LinkBlock
        id="link-block-1"
        mode="display"
        link={
          'https://www.theverge.com/2023/1/25/23570656/microsoft-windows-11-file-explorer-modern-ui-overhaul'
        }
        by="~lomder-librun"
        width={350}
      />
    </Flex>
    <Flex
      flexDirection="column"
      width={400}
      height={330}
      p={2}
      background={'#FFFF'}
    >
      <LinkBlock
        id="link-block-1"
        mode="display"
        link="https://www.cnn.com/2023/01/25/tech/meta-facebook-trump-decision/index.html"
        by="~lomder-librun"
        width={350}
      />
    </Flex>
    <Flex
      flexDirection="column"
      width={400}
      height={300}
      p={2}
      background={'#FFFF'}
    >
      <LinkBlock
        id="link-block-1"
        mode="display"
        link="https://www.nytimes.com/2023/01/21/style/nikki-finke-hollywood-journalist.html"
        by="~lomder-librun"
        width={350}
      />
    </Flex>
  </Flex>
);
