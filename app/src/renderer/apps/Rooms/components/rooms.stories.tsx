import { useState } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Button, Flex, Text } from '@holium/design-system';

import { PeerConnectionState } from '../store/room.types';
import { SpeakerGrid } from './SpeakerGrid';

export default {
  title: 'Rooms/SpeakerGrid',
  component: SpeakerGrid,
} as ComponentMeta<typeof SpeakerGrid>;

export type RoomType = {
  rid: string;
  provider: string;
  creator: string;
  access?: 'public' | 'private';
  title: string;
  whitelist?: string[];
  present?: string[];
  capacity?: number;
  path: string | null;
};

const contacts: any = {
  '~lomder-librun': {
    color: '#f29810',
    nickname: 'lomder-librun',
    avatar: null,
  },
  '~fasnut-famden': {
    color: '#129131',
    nickname: 'Thearellica',
    avatar:
      'https://lomder-librun.sfo3.digitaloceanspaces.com/Images/~fasnut-famden/1683832836-fasnut-famden%20light%20blue%20green.jpg',
  },
  '~lopsyp-doztun': {
    color: '#129131',
    nickname: 'Gus',
    avatar:
      'https://rindux-mocrux.s31.third.earth/~lopsyp-doztun/1683061010-boom.jpeg',
  },
  '~hostyv': {
    color: '#785218',
    nickname: 'hostyv',
    avatar: null,
  },
  '~bus': {
    color: '#3b1878',
    nickname: 'bus',
    avatar: null,
  },
};

const peers1 = Array.from<any>(Object.keys(contacts)).map((id: string) => id);

const getContactMetadata = (ship: string) => contacts[ship];

const getPeer = (ship: string) => {
  return {
    audio: true,
    video: true,
    stream: null,
    volume: 0,
    isMuted: false,
    isSpeaking: false,
    status: PeerConnectionState.Connected,
    name: ship,
    peer: null,
    connected: true,
  };
};

const room: RoomType = {
  rid: 'litzod-dozzod-hostyv.holium.live/rooms/~lomder-librun/video-room',
  title: 'video room',
  creator: '~lomder-librun',
  provider: 'default',
  access: 'public',
  whitelist: ['~lomder-librun', '~hostyv'],
  capacity: 10,
  path: '/~lomder-librun/realm-forerunners',
};

export const Togglable: ComponentStory<typeof SpeakerGrid> = () => {
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);

  return (
    <Flex row align="flex-start" p={3} gap={16}>
      <Flex col>
        <Text.Label>Tray size</Text.Label>
        <Flex
          p={1}
          background="rgba(0, 0, 0, 0.04)"
          borderRadius={6}
          height={400}
          width={380}
        >
          <SpeakerGrid
            activeSpeaker={activeSpeaker}
            peers={peers1}
            getContactMetadata={getContactMetadata}
            getPeer={getPeer}
            ourId="~lomder-librun"
            room={room}
            kickPeer={() => {}}
            retryPeer={() => {}}
          />
        </Flex>
      </Flex>
      <Flex col>
        <Text.Label>Full size</Text.Label>
        <Flex
          p={1}
          background="rgba(0, 0, 0, 0.04)"
          borderRadius={6}
          height={600}
          width={900}
        >
          <SpeakerGrid
            columns={3}
            activeSpeaker={activeSpeaker}
            peers={peers1}
            getContactMetadata={getContactMetadata}
            getPeer={getPeer}
            ourId="~lomder-librun"
            room={room}
            kickPeer={() => {}}
            retryPeer={() => {}}
          />
        </Flex>
        <Button.Primary
          mt={3}
          onClick={() => {
            setActiveSpeaker(activeSpeaker ? null : '~lomder-librun');
          }}
        >
          Toggle active
        </Button.Primary>
      </Flex>
    </Flex>
  );
};

export const NoActiveSpeaker: ComponentStory<typeof SpeakerGrid> = () => {
  return (
    <Flex row align="flex-start" p={3} gap={16}>
      <Flex col>
        <Text.Label>Tray size</Text.Label>
        <Flex
          p={1}
          background="rgba(0, 0, 0, 0.04)"
          borderRadius={6}
          height={400}
          width={380}
        >
          <SpeakerGrid
            activeSpeaker={null}
            peers={peers1}
            getContactMetadata={getContactMetadata}
            getPeer={getPeer}
            ourId="~lomder-librun"
            room={room}
            kickPeer={() => {}}
            retryPeer={() => {}}
          />
        </Flex>
      </Flex>
      <Flex col>
        <Text.Label>Full size</Text.Label>
        <Flex
          p={1}
          background="rgba(0, 0, 0, 0.04)"
          borderRadius={6}
          height={600}
          width={900}
        >
          <SpeakerGrid
            columns={4}
            activeSpeaker={null}
            peers={peers1}
            getContactMetadata={getContactMetadata}
            getPeer={getPeer}
            ourId="~lomder-librun"
            room={room}
            kickPeer={() => {}}
            retryPeer={() => {}}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export const ActiveSpeaker: ComponentStory<typeof SpeakerGrid> = () => (
  <Flex row align="flex-start" p={3} gap={16}>
    <Flex col>
      <Text.Label>Tray size</Text.Label>
      <Flex
        p={1}
        background="rgba(0, 0, 0, 0.04)"
        borderRadius={6}
        height={400}
        width={380}
      >
        <SpeakerGrid
          activeSpeaker={'~lomder-librun'}
          peers={peers1}
          getContactMetadata={getContactMetadata}
          getPeer={getPeer}
          ourId="~lomder-librun"
          room={room}
          kickPeer={() => {}}
          retryPeer={() => {}}
        />
      </Flex>
    </Flex>
    <Flex col>
      <Text.Label>Full size</Text.Label>
      <Flex
        p={1}
        background="rgba(0, 0, 0, 0.04)"
        borderRadius={6}
        height={600}
        width={900}
      >
        <SpeakerGrid
          columns={4}
          activeSpeaker={'~lomder-librun'}
          peers={peers1}
          getContactMetadata={getContactMetadata}
          getPeer={getPeer}
          ourId="~lomder-librun"
          room={room}
          kickPeer={() => {}}
          retryPeer={() => {}}
        />
      </Flex>
    </Flex>
  </Flex>
);
