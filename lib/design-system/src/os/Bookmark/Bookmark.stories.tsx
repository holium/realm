import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../general/Flex/Flex';
import { Bookmark, BookmarkProps } from './Bookmark';

export default {
  component: Bookmark,
} as ComponentMeta<typeof Bookmark>;

const tab1: BookmarkProps = {
  url: 'https://boards.4chan.org/pol/',
  favicon: 'https://s.4cdn.org/image/favicon.ico',
  title:
    "/pol/ - Politically Incorrect is 4chan's board for discussing and debating politics and current events.",
  onNavigate(url) {
    console.log('Navigating to', url);
  },
};

const tab2: BookmarkProps = {
  url: 'https://urbit.org',
  favicon: 'https://urbit.org/images/favicon.ico',
  title: 'Urbit',
  member: '~fasnut-famden',
  onNavigate(url) {
    console.log('Navigating to', url);
  },
};
export const Default: ComponentStory<typeof Bookmark> = () => (
  <Flex gap={4} flexDirection="column" width={300}>
    <Bookmark {...tab1} />
    <Bookmark {...tab2} />
    <Bookmark {...tab1} member="~lomder-librun" />
    <Bookmark {...tab1} member="~novdus-fidlys-dozzod-hostyv" />
  </Flex>
);
