import { observer } from 'mobx-react';
import styled, { css } from 'styled-components';

import { Speaker } from './DynamicSpeaker';
import { RoomType } from './rooms.stories';

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
      size={size}
      activeSpeaker={activeSpeaker}
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

const SpeakerGridStyle = styled.div<SpeakerGridStyleProps>`
  display: grid;
  width: 100%;
  padding: 2px;
  padding-bottom: 4px;
  gap: 8px;

  ::-webkit-scrollbar {
    width: ${SCROLLBAR_WIDTH}px;
    transition: 0.25s background-color ease-in-out;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 20px;
    border: 3px solid transparent;
    background-clip: content-box;
    background-color: transparent;
    transition: 0.25s background-color ease-in-out;
  }

  ::-webkit-scrollbar-track {
    border-radius: 20px;
    border: 3px solid transparent;
    background-clip: content-box;
    background-color: transparent;
    transition: 0.25s background-color ease-in-out;
  }
  ::-webkit-scrollbar-thumb {
    transition: 0.25s background-color ease-in-out;
    background-color: rgba(var(--rlm-text-rgba), 0.1);
  }

  ::-webkit-scrollbar-thumb:hover {
    transition: 0.25s background-color ease-in-out;
    background-color: rgba(var(--rlm-text-rgba), 0.2);
  }

  ::-webkit-scrollbar-track:hover {
    transition: 0.25s background-color ease-in-out;
    background-color: rgba(var(--rlm-input-rgba), 0.1);
  }

  .active-speaker {
    grid-area: 1 / 1 / 2 / 3;
    width: 100%;
    height: 100%;
    transition: width 0.5s ease-in-out;
    overflow: visible;
  }

  ${({ peers, size }: SpeakerGridStyleProps) => css`
    grid-template-columns: ${size === 'tray' ? '1fr 1fr' : '4fr 1fr'};
    grid-template-rows: ${size === 'tray' ? '240px' : '186px'};
    grid-auto-rows: 156px;

    ${peers.length >= 4 &&
    css`
      overflow-y: scroll;
      width: calc(100% + ${SCROLLBAR_WIDTH}px);
      max-height: 628px;
      margin-right: -${SCROLLBAR_WIDTH - 1}px;
      grid-auto-rows: 182px;
      grid-template-rows: 240px;
    `}
  `};

  & {
    ${({ peers }: SpeakerGridStyleProps) =>
      peers.length > 6 &&
      css`
        overflow-y: scroll;
        max-height: 628px;
        width: calc(100% + ${SCROLLBAR_WIDTH}px);
        margin-right: -${SCROLLBAR_WIDTH - 1}px;
      `}
  }
`;
