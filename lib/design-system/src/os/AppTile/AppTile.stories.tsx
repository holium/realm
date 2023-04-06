import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex, Text } from '../../general';
import { AppTile, AppTileType } from './AppTile';

export default {
  component: AppTile,
} as ComponentMeta<typeof AppTile>;

const lexicon: AppTileType = {
  id: 'lexicon',
  title: 'Lexicon',
  href: {
    glob: {
      'glob-reference': {
        location: {
          ames: '~dister-dozzod-niblyx-malnus',
        },
        hash: '0v7.s97eq.2226c.6vk5f.nb4je.a2upu',
      },
      base: 'lexicon',
    },
  },
  favicon: null,
  type: 'urbit',
  config: {
    size: [3, 7],
    showTitlebar: true,
    titlebarBorder: false,
  },
  installStatus: 'suspended',
  info: 'urbit dictionary',
  color: '#eedfc9',
  image: 'https://lomder-librun.sfo3.digitaloceanspaces.com/tiles/lexicon.svg',
  version: '1.0.0',
  website: 'https://www.holium.com',
  license: 'MIT',
  host: '~hostyv',
  icon: null,
  gridIndex: 9,
};

export const Base: ComponentStory<typeof AppTile> = () => (
  <Flex col p={2}>
    <Text.Custom>animated</Text.Custom>
    <Flex gap={16} row p={2} width="500px">
      <AppTile tileId="lexicon" tileSize="sm" app={lexicon} />
      <AppTile tileId="lexicon" tileSize="md" app={lexicon} />
      <AppTile tileId="lexicon" tileSize="lg" app={lexicon} />
      <AppTile tileId="lexicon" tileSize="xl" app={lexicon} />
      <AppTile tileId="lexicon" tileSize="xl1" app={lexicon} />
      <AppTile tileId="lexicon" tileSize="xl2" app={lexicon} />
      <AppTile tileId="lexicon" tileSize="xxl" app={lexicon} />
    </Flex>
    <Text.Custom>not animated</Text.Custom>
    <Flex gap={16} row p={2} width="500px">
      <AppTile
        tileId="lexicon"
        tileSize="sm"
        app={lexicon}
        isAnimated={false}
      />
      <AppTile
        tileId="lexicon"
        tileSize="md"
        app={lexicon}
        isAnimated={false}
      />
      <AppTile
        tileId="lexicon"
        tileSize="lg"
        app={lexicon}
        isAnimated={false}
      />
      <AppTile
        tileId="lexicon"
        tileSize="xl"
        app={lexicon}
        isAnimated={false}
      />
      <AppTile
        tileId="lexicon"
        tileSize="xl1"
        app={lexicon}
        isAnimated={false}
      />
      <AppTile
        tileId="lexicon"
        tileSize="xl2"
        app={lexicon}
        isAnimated={false}
      />
      <AppTile
        tileId="lexicon"
        tileSize="xxl"
        app={lexicon}
        isAnimated={false}
      />
    </Flex>
  </Flex>
);
