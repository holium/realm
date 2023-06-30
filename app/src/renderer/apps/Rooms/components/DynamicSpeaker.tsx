import { useEffect, useMemo, useRef } from 'react';
import BeatLoader from 'react-spinners/BeatLoader';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Avatar, Flex, FlexProps, Icon, Text } from '@holium/design-system';

import { ContextMenuOption, useContextMenu } from 'renderer/components';

import { LocalPeer } from '../store/LocalPeer';
import { PeerClass } from '../store/Peer';
import { PeerConnectionState } from '../store/room.types';
import { AudioWave } from './AudioWave';
import { RoomType } from './rooms.stories';

interface ISpeaker {
  isActive?: boolean;
  person: string;
  cursors?: boolean;
  height?: string;
  type: 'speaker' | 'listener' | 'creator';
  isOur: boolean;
  ourId: string;
  metadata: any;
  peer: PeerClass | LocalPeer | any;
  kickPeer: (person: string) => void;
  retryPeer: (person: string) => void;
  room: RoomType;
}

const speakerType = {
  our: 'You',
  creator: 'Creator',
  speaker: 'Speaker',
  listener: 'Listener',
};

const SpeakerPresenter = ({
  height = 'auto',
  person,
  type,
  isOur,
  ourId,
  metadata,
  isActive = false,
  peer,
  kickPeer,
  retryPeer,
  room,
}: ISpeaker) => {
  const speakerRef = useRef<any>(null);
  const videoRef = useRef<any>(null);
  const { getOptions, setOptions } = useContextMenu();

  let name = metadata?.nickname || person;

  // if navigating away and back, we need to reattach the video
  useEffect(() => {
    if (!videoRef.current) return;
    if (!peer || !peer?.hasVideo) return;

    if (!videoRef.current.srcObject) {
      videoRef.current.srcObject = peer.videoStream;
      videoRef.current.style.display = 'inline-block';
      videoRef.current.playsInline = true;
      // videoRef.current.muted = true;
    }
  }, [peer?.hasVideo, videoRef.current]);

  if (name.length > 17) name = `${name.substring(0, 17)}...`;

  let sublabel = <Sublabel>{speakerType[type]}</Sublabel>;
  const peerState = isOur ? PeerConnectionState.Connected : peer?.status;
  if (peerState === PeerConnectionState.Failed)
    sublabel = <Sublabel color="intent-alert">Failed</Sublabel>;
  if (
    peerState === PeerConnectionState.New ||
    peerState === PeerConnectionState.Connecting
  )
    sublabel = <BeatLoader size={6} speedMultiplier={0.65} />;

  if (peerState === PeerConnectionState.Disconnected)
    sublabel = <Sublabel>Disconnected</Sublabel>;

  if (peerState === PeerConnectionState.Closed) {
    sublabel = <Sublabel>Disconnected</Sublabel>;
  }

  const contextMenuOptions = useMemo(
    () =>
      [
        {
          id: `room-speaker-${person}-reconnect`,
          label: 'Reconnect',
          disabled: peer?.status === PeerConnectionState.Connected,
          onClick: (evt: any) => {
            retryPeer(person);
            evt.stopPropagation();
          },
        },
        {
          id: `room-speaker-${person}-mute`,
          label: peer?.isForceMuted ? 'Unmute' : 'Mute',
          // disabled: peer?.status === PeerConnectionState.,
          onClick: (evt: any) => {
            if (peer?.isForceMuted) {
              peer.forceUnmute();
            } else {
              peer.forceMute();
            }
            evt.stopPropagation();
          },
        },
        // only the creator can kick people
        room.creator === ourId && {
          style: { color: '#FD4E4E' },
          id: `room-speaker-${person}-kick`,
          label: 'Kick',
          loading: false,
          onClick: (evt: any) => {
            evt.stopPropagation();
            kickPeer(person);
          },
        },
      ].filter(Boolean) as ContextMenuOption[],
    [peer?.status, peer?.isForceMuted, person, room.rid, type]
  );

  useEffect(() => {
    if (!isOur && contextMenuOptions !== getOptions(`room-speaker-${person}`)) {
      setOptions(`room-speaker-${person}`, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, person, setOptions, isOur]);

  const hasVideo = (peer as PeerClass)?.hasVideo;
  const isSpeaking =
    (peer as PeerClass)?.isSpeaking && !(peer as PeerClass)?.isMuted;

  const showMuteIcon = peer?.isMuted || peer?.isForceMuted;

  return (
    <SpeakerWrapper
      id={`room-speaker-${person}`}
      height={height}
      ref={speakerRef}
      key={person}
      gap={4}
      transition={{ width: { duration: 0.5 } }}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      className={`speaker ${isActive ? 'active-speaker' : ''} ${
        hasVideo && peerState !== PeerConnectionState.Closed
          ? 'speaker-video-on'
          : ''
      } ${isSpeaking ? 'speaker-speaking' : ''}`}
    >
      <>
        <video
          ref={videoRef}
          style={{
            zIndex: 0,
            display: 'none',
            position: 'absolute',
            pointerEvents: 'none',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '9px',
          }}
          id={`peer-video-${person}`}
          autoPlay
          playsInline
          muted
        />
        <Flex
          zIndex={2}
          className="speaker-avatar-wrapper"
          style={{ pointerEvents: 'none' }}
          flexDirection="column"
          alignItems="center"
          gap={10}
        >
          <Flex
            className="speaker-avatar"
            style={{ pointerEvents: 'none' }}
            flexDirection="column"
            alignItems="center"
            gap={0}
          >
            <Avatar
              clickable={false}
              borderRadiusOverride={hasVideo ? '3px' : '6px'}
              simple
              size={hasVideo ? 22 : 32}
              avatar={metadata && metadata.avatar}
              patp={person}
              sigilColor={[(metadata && metadata.color) || '#000000', 'white']}
            />
          </Flex>
          <Text.Custom
            className="speaker-name"
            style={{ pointerEvents: 'none' }}
            opacity={peerState === PeerConnectionState.Connected ? 1 : 0.4}
            alignItems="center"
            fontSize={2}
            fontWeight={500}
          >
            {name}
          </Text.Custom>
        </Flex>
        <Flex
          className="speaker-audio-indicator"
          position="relative"
          opacity={peerState === PeerConnectionState.Connected ? 1 : 0.4}
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          style={{ pointerEvents: 'none' }}
        >
          <Flex height={26} mt="1px">
            {!showMuteIcon && <AudioWave speaking={isSpeaking} />}
          </Flex>

          <Flex
            position="absolute"
            style={{ height: 18, pointerEvents: 'none' }}
          >
            {showMuteIcon && (
              <Icon
                initial={{ opacity: 0 }}
                animate={{ opacity: hasVideo ? 1.0 : 0.7 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                iconColor={
                  peer?.isForceMuted
                    ? '#ff6240'
                    : hasVideo
                    ? 'white'
                    : undefined
                }
                name="MicOff"
                size={18}
                opacity={0.5}
              />
            )}
          </Flex>
          {!showMuteIcon && !isSpeaking && (
            <Flex
              className="speaker-sublabel"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              position="absolute"
            >
              {sublabel}
            </Flex>
          )}
        </Flex>
      </>
    </SpeakerWrapper>
  );
};

export const Speaker = observer(SpeakerPresenter);

type SpeakerWrapperProps = {
  height: string;
};

const SpeakerWrapper = styled(Flex)<FlexProps & SpeakerWrapperProps>`
  padding: 16px 0;
  border-radius: 9px;
  transition: 0.25s ease;
  position: relative;
  border: 2px solid transparent;
  box-sizing: border-box;

  ${({ height }) =>
    height &&
    `
    height: ${height};
  `}

  &:hover {
    transition: 0.25s ease;
    background: rgba(var(--rlm-overlay-hover-rgba));
  }
  &.speaker-speaking {
    transition: 0.25s ease;
    z-index: 2;
    border: 2px solid rgba(var(--rlm-accent-rgba));
  }
  background: transparent;
  &.speaker-video-on {
    background: black;
    transition: 0.25s ease;
    .speaker-name {
      color: #fff;
    }
    .speaker-avatar-wrapper {
      position: absolute;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      left: 8px;
      bottom: 8px;
    }
    .speaker-audio-indicator {
      position: absolute;
      flex-direction: row;
      align-items: flex-end;
      justify-content: flex-end;
      right: 8px;
      bottom: 8px;
    }
    .speaker-sublabel {
      display: none;
    }
  }
`;

const Sublabel = styled(Text.Custom)`
  font-size: 12px;
  font-weight: 400;
  opacity: 0.5;
  pointer-events: none;
`;
