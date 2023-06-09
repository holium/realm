import styled, { css } from 'styled-components';

import { Flex } from '@holium/design-system';

import { Speaker } from './DynamicSpeaker';
import { RoomType } from './rooms.stories';

// props with children
type SpeakerGridProps = {
  ourId: string;
  peers: string[];
  activeSpeaker: string | null;
  room: RoomType;
  getPeer: (peerId: string) => any;
  getContactMetadata: (peerId: string) => any;
  kickPeer: (peerId: string) => void;
  retryPeer: (peerId: string) => void;
};

export const SpeakerGrid = ({
  ourId,
  activeSpeaker,
  peers,
  room,
  getContactMetadata,
  getPeer,
  retryPeer,
  kickPeer,
}: SpeakerGridProps) => {
  return (
    <SpeakerGridStyle activeSpeaker={activeSpeaker} peers={peers}>
      {peers.map((peer: string) => {
        const metadata = getContactMetadata(peer);
        const peerObj = getPeer(peer);
        const isOur = peer === ourId;
        return (
          <Speaker
            key={peer}
            room={room}
            type="speaker"
            person={peer}
            isOur={isOur}
            metadata={metadata}
            peer={peerObj}
            kickPeer={kickPeer}
            retryPeer={retryPeer}
          />
        );
      })}
    </SpeakerGridStyle>
  );
};

type SpeakerGridStyleProps = {
  peers: string[];
  activeSpeaker: string | null;
};

const SpeakerGridStyle = styled(Flex)<SpeakerGridStyleProps>`
  display: grid;
  flex: 2;
  gap: 12px;
  padding: 4px 2px;
  scrollbar-width: thin;

  ${({ activeSpeaker, peers }: SpeakerGridStyleProps) =>
    activeSpeaker
      ? css`
          grid-template-columns: 1fr;
          grid-template-rows: 70% 30%;
          grid-template-areas:
            'active'
            'others';
        `
      : css`
          ${peers.length + 1
            ? css`
                grid-template-columns: repeat(2, 1fr);
              `
            : css`
                grid-template-columns: 0.5fr;
              `}
          ${peers.length > 4
            ? css`
                grid-template-rows: repeat(3, 1fr);
              `
            : css`
                grid-template-rows: repeat(2, 1fr);
              `}
      ${peers.length > 5
            ? css`
                overflow-y: scroll;
                max-height: 593px;
                margin-right: -8px;
              `
            : css`
                overflow-y: visible;
                max-height: 100%;
                margin-right: 0px;
              `}
        `}

  .active-speaker {
    grid-area: active;
    height: 100% !important;
  }

  // TODO in progress
  .others-container {
    grid-area: others;
    display: flex;
    flex-direction: row;
    width: 100%;
    overflow: auto; // Scroll if there are more than 4 speakers
  }

  .other-speaker {
    width: 120px;
    height: 100%;
  }
`;
