import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../..';
import { Tab, TabProps } from '.';

export default {
  component: Tab,
} as ComponentMeta<typeof Tab>;

const tab1: TabProps = {
  url: 'https://boards.4chan.org/pol/',
  favicon: 'https://s.4cdn.org/image/favicon.ico',
  title:
    "/pol/ - Politically Incorrect is 4chan's board for discussing and debating politics and current events.",
  onNavigate(url) {
    console.log('Navigating to', url);
  },
  onClose(url) {
    console.log('Closing tab', url);
  },
};

const tab2: TabProps = {
  url: 'https://twitter.com/home',
  favicon: 'https://abs.twimg.com/favicons/twitter.2.ico',
  title: 'Home / Twitter',
  onNavigate(url) {
    console.log('Navigating to', url);
  },
  onClose(url) {
    console.log('Closing tab', url);
  },
};

const tab3: TabProps = {
  url: 'https://urblt.org',
  favicon: 'https://urbit.org/images/favicon.ico',
  title: 'Urbit',
  multiplayer: {
    host: '~lomder-librun',
    peers: [
      {
        patp: '~lomder-librun',
        nickname: '',
        color: '#F08735',
        avatar: '',
      },
      {
        patp: '~hoppub-dirtux',
        nickname: '',
        color: '#000',
        avatar:
          'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/b7/b7885f2e51c32923a5e3c121d9ca18a19b157ad0_full.jpg',
      },
      {
        patp: '~ronseg-hacsym',
        nickname: 'Vapor Dave',
        color: '#F08735',
        avatar:
          'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/76/7633fd373ba0c2d36c6e9d3a39fd85f9d9c3fbb0_full.jpg',
      },
    ],
  },
  onNavigate(url) {
    console.log('Navigating to', url);
  },
  onClose(url) {
    console.log('Closing tab', url);
  },
};

export const Default: ComponentStory<typeof Tab> = () => (
  <Flex gap={4} flexDirection="column" width={300}>
    <Tab {...tab1} />
    <Tab {...tab2} />
    <Tab {...tab3} />
  </Flex>
);

export const Collapsed: ComponentStory<typeof Tab> = () => (
  <Flex gap={4} flexDirection="column" width={300}>
    <Tab collapsed {...tab1} />
    <Tab collapsed {...tab2} />
    <Tab collapsed {...tab3} />
  </Flex>
);
