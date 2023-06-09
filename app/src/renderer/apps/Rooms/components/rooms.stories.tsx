import { ComponentMeta, ComponentStory } from '@storybook/react';

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
    color: '#eedfc9',
    nickname: 'lomder-librun',
    avatar: null,
  },
  '~hostyv': {
    color: '#eedfc9',
    nickname: 'hostyv',
    avatar: null,
  },
};

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

export const NoActiveSpeaker: ComponentStory<typeof SpeakerGrid> = () => (
  <SpeakerGrid
    activeSpeaker={null}
    peers={['~lomder-librun', '~hostyv']}
    getContactMetadata={getContactMetadata}
    getPeer={getPeer}
    ourId="~lomder-librun"
    room={room}
    kickPeer={() => {}}
    retryPeer={() => {}}
  />
);
