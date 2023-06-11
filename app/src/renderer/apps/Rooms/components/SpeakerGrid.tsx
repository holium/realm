import { observer } from 'mobx-react';
import styled, { css } from 'styled-components';

import { Flex } from '@holium/design-system';

import { Speaker } from './DynamicSpeaker';
import { RoomType } from './rooms.stories';

// props with children
type SpeakerGridProps = {
  ourId: string;
  size?: 'tray' | 'full';
  columns?: number;
  peers: string[];
  activeSpeaker: string | null;
  room: RoomType;
  getPeer: (peerId: string) => any;
  getContactMetadata: (peerId: string) => any;
  kickPeer: (peerId: string) => void;
  retryPeer: (peerId: string) => void;
};

export const SpeakerGridPresenter = ({
  ourId,
  activeSpeaker,
  peers,
  room,
  size = 'tray',
  columns = 2,
  getContactMetadata,
  getPeer,
  retryPeer,
  kickPeer,
}: SpeakerGridProps) => {
  const renderPeer = (peerId: string) => {
    const metadata = getContactMetadata(peerId);
    const peerObj = getPeer(peerId);
    const isOur = peerId === ourId;
    return (
      <Speaker
        // isActive={ourId === peerId}
        isActive={activeSpeaker ? activeSpeaker === peerId : false}
        key={peerId}
        size={size}
        room={room}
        type={room.creator === peerId ? 'creator' : 'speaker'}
        person={peerId}
        isOur={isOur}
        ourId={ourId}
        metadata={metadata}
        peer={peerObj}
        kickPeer={kickPeer}
        retryPeer={retryPeer}
      />
    );
  };

  return (
    <SpeakerGridStyle
      flexDirection={
        activeSpeaker ? (size === 'tray' ? 'column' : 'row') : 'initial'
      }
      size={size}
      activeSpeaker={activeSpeaker}
      // activeSpeaker={ourId}
      peers={peers}
      columns={columns}
    >
      {peers.map((peer: string) => renderPeer(peer))}
    </SpeakerGridStyle>
  );
};

export const SpeakerGrid = observer(SpeakerGridPresenter);

type SpeakerGridStyleProps = {
  size: 'tray' | 'full';
  columns: number;
  peers: string[];
  activeSpeaker: string | null;
};

export const SCROLLBAR_WIDTH = 12;

const SpeakerGridStyle = styled(Flex)<SpeakerGridStyleProps>`
  display: grid;
  flex: 2;
  scrollbar-width: thin;
  grid-auto-flow: dense;
  padding: 2px;
  gap: 8px;
  ::-webkit-scrollbar {
    width: ${SCROLLBAR_WIDTH}px;
    transition: 0.25s ease-in-out;
  }
  transition: 0.25s ease-in-out;

  ::-webkit-scrollbar-thumb {
    border-radius: 20px;
    border: 3px solid transparent;
    background-clip: content-box;
    background-color: transparent;
    transition: 0.25s ease-in-out;
  }

  ::-webkit-scrollbar-track {
    border-radius: 20px;
    border: 3px solid transparent;
    background-clip: content-box;
    background-color: transparent;
    transition: 0.25s ease-in-out;
  }
  ::-webkit-scrollbar-thumb {
    transition: 0.25s ease-in-out;
    background-color: rgba(var(--rlm-text-rgba), 0.3);
  }

  ::-webkit-scrollbar-thumb:hover {
    transition: 0.25s ease-in-out;
    background-color: rgba(var(--rlm-text-rgba), 0.4);
  }

  ::-webkit-scrollbar-track:hover {
    transition: 0.25s ease-in-out;
    background-color: rgba(var(--rlm-input-rgba), 0.3);
  }
  ${({ columns, peers }: SpeakerGridStyleProps) => css`
    ${peers.length + 1
      ? css`
          grid-template-columns: repeat(${columns}, 1fr);
        `
      : css`
          grid-template-columns: ${1 / columns}fr;
        `}
    ${peers.length > 4
      ? css`
          grid-template-rows: repeat(3, 186px);
        `
      : css`
          grid-template-rows: repeat(2, 186px);
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
  `};

  // apply to self and a child class called other-grid
  & {
    ${({ size, columns, activeSpeaker, peers }: SpeakerGridStyleProps) => {
      return activeSpeaker
        ? css`
            grid-template-columns: ${size === 'tray' ? '1fr 1fr ' : '4fr 1fr'};
            grid-template-rows: ${size === 'tray' ? '312px auto' : '1fr'};
            // active and other grid areas

            .active-speaker {
              grid-area: 1 / 1 / 4 / 4;
              width: 100%;
              height: 100%;
              transition: width 0.5s ease-in-out;
              overflow: visible;
            }
          `
        : css`
            .speaker {
              overflow: visible;

              height: 100%;
              transition: width 0.5s ease-in-out;
            }
            /* ${peers.length + 1
              ? css`
                  grid-template-columns: repeat(${columns}, 1fr);
                `
              : css`
                  grid-template-columns: ${1 / columns}fr;
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
                `} */
          `;
    }}
  }
`;
