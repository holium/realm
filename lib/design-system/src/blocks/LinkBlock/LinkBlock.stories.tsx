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
        link={[
          'Spotify is laying off six percent of its global workforce, CEO announces',
          'https://www.theverge.com/2023/1/23/23567333/spotify-layoffs-daniel-ek-cost-cutting',
        ]}
        by="~lomder-librun"
        width={350}
        // reference={{
        //   image: 'https://s.4cdn.org/image/favicon.ico',
        //   link: 'https://boards.4chan.org/pol/',
        // }}
      />
    </Flex>
  </Flex>
);
