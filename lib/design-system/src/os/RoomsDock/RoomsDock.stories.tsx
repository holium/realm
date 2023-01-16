import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../..';
import { RoomsDock } from '.';
import { BarStyle } from '../Bar';

export default {
  component: RoomsDock,
} as ComponentMeta<typeof RoomsDock>;

export const Base: ComponentStory<typeof RoomsDock> = () => (
  <Flex
    className="wallpaper"
    flexDirection="column"
    justifyContent="flex-end"
    p={2}
    gap={16}
    width="400px"
  >
    <BarStyle px={1} justifyContent="space-between">
      <Flex gap={8} alignItems="center">
        <RoomsDock live={null} />
      </Flex>
    </BarStyle>
    <BarStyle px={1} justifyContent="space-between">
      <Flex gap={8} alignItems="center">
        <RoomsDock
          live={null}
          rooms={[
            {
              rid: 1,
              title: 'Chillin',
              present: [
                {
                  patp: '~fasnut-famden',
                  nickname: '',
                  color: '#000',
                  avatar: '',
                },
              ],
              capacity: 6,
            },
          ]}
        />
      </Flex>
    </BarStyle>
    <BarStyle px={1} justifyContent="space-between">
      <Flex gap={8} alignItems="center">
        <RoomsDock
          live={{
            rid: 1,
            title: 'The Rabbit Hole',
            present: [
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
              {
                patp: '~ravmel-ropdyl',
                nickname: '',
                color: '#F08735',
                avatar:
                  'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/47/47ea775206a03b1ebc329497456f897bdfbac1de_full.jpg',
              },
            ],
            capacity: 6,
          }}
        />
      </Flex>
    </BarStyle>
    <BarStyle px={1} justifyContent="space-between">
      <Flex gap={8} alignItems="center">
        <RoomsDock
          live={{
            rid: 1,
            title: 'The Rabbit Hole',
            present: [
              {
                patp: '~lomder-librun',
                nickname: '',
                color: '#000',
                avatar: '',
              },
            ],
            capacity: 6,
          }}
        />
      </Flex>
    </BarStyle>
    <BarStyle px={1} justifyContent="space-between">
      <Flex gap={8} alignItems="center">
        <RoomsDock
          live={{
            rid: 1,
            title: 'The Rabbit Hole',
            present: [
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
              {
                patp: '~ravmel-ropdyl',
                nickname: '',
                color: '#F08735',
                avatar:
                  'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/47/47ea775206a03b1ebc329497456f897bdfbac1de_full.jpg',
              },
              {
                patp: '~poldec-tonteg',
                nickname: '',
                color: '#35f0a2',
                avatar: '',
              },
              {
                patp: '~fipfep-foslup',
                nickname: '',
                color: '#F08735',
                avatar:
                  'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/00/0032f232b9ff1167ef574ade3ac0c1bf6223df04_full.jpg',
              },
            ],
            capacity: 6,
          }}
        />
      </Flex>
    </BarStyle>
  </Flex>
);
