import { FC } from 'react';
import { BarStyle } from '../Bar/Bar';
import { Avatar, Flex, Icon } from '../..';
import { HoliumButton } from './HoliumButton';
import { BarButton } from './BarButton';
import { RoomsDock } from '../RoomsDock/RoomsDock';

type SystemBarProps = {};

export const SystemBar: FC<SystemBarProps> = (props: SystemBarProps) => {
  return (
    <Flex flexDirection="row" width="auto" gap={8}>
      <BarStyle justifyContent="center" width={40}>
        <HoliumButton />
      </BarStyle>
      <BarStyle flex={1} px={1} pr={2} justifyContent="space-between">
        CommunityBar
        <BarButton height={26} width={26}>
          <Icon name="Messages" size={22} />
        </BarButton>
      </BarStyle>
      <BarStyle pl="3px" pr={1} justifyContent="space-between">
        <Flex gap={8} alignItems="center">
          <RoomsDock
            participants={[
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
            ]}
            live={{
              rid: 1,
              title: 'The Rabbit Hole that is deep',
              present: [
                '~lomder-librun',
                '~hoppub-dirtux',
                '~ronseg-hacsym',
                '~ravmel-ropdyl',
                '~poldec-tonteg',
                '~fipfep-foslup',
              ],
              capacity: 6,
            }}
            onCreate={() => {}}
            onOpen={() => {}}
            onMute={() => {}}
            onCursor={() => {}}
            onLeave={() => {}}
          />
          <BarButton height={26} width={26}>
            <Icon name="WalletTray" size={22} />
          </BarButton>

          <Avatar
            simple
            clickable
            patp="~lomder-librun"
            size={26}
            borderRadiusOverride="4px"
            sigilColor={['#F08735', '#FFF']}
          />
        </Flex>
      </BarStyle>
    </Flex>
  );
};
