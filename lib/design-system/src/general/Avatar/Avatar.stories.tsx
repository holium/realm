import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../..';
import { Avatar } from '.';

export default {
  component: Avatar,
} as ComponentMeta<typeof Avatar>;

export const Default: ComponentStory<typeof Avatar> = (args) => (
  <Flex gap={8}>
    <Avatar
      patp="~lomder-librun"
      sigilColor={['black', 'white']}
      simple
      size={48}
    />
    <Avatar
      patp="~lomder-librun"
      sigilColor={['black', 'white']}
      avatar={
        'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/49/4977cbad50d57d5e72acdd57541ccf95e3416061_full.jpg'
      }
      simple
      size={48}
    />
    <Avatar
      patp="~lomder-librun"
      sigilColor={['black', 'white']}
      avatar={
        'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/49/4977cbad50d57d5e72acdd57541ccf95e3416061_full.jpg'
      }
      simple
      size={30}
    />
    <Avatar
      patp="~lomder-librun"
      sigilColor={['black', 'white']}
      borderRadiusOverride="16px"
      // simple
      size={80}
    />
  </Flex>
);

Default.args = {
  patp: '~lomder-librun',
  sigilColor: ['black', 'white'],
  simple: true,
  size: 48,
};
