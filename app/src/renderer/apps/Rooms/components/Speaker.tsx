import { useEffect, useMemo, useRef } from 'react';
import BeatLoader from 'react-spinners/BeatLoader';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Avatar, Flex, FlexProps, Icon, Text } from '@holium/design-system';

import {
  ContextMenuOption,
  useContextMenu,
} from 'renderer/components/ContextMenu';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { PeerConnectionState } from '../store/room.types';
import { PeerClass } from '../store/RoomsStore';
import { useRoomsStore } from '../store/RoomsStoreContext';
import { AudioWave } from './AudioWave';

interface ISpeaker {
  person: string;
  cursors?: boolean;
  type: 'our' | 'speaker' | 'listener' | 'creator';
}

const speakerType = {
  our: 'You',
  creator: 'Creator',
  speaker: 'Speaker',
  listener: 'Listener',
};

const SpeakerPresenter = (props: ISpeaker) => {
  const { person, type } = props;
  const { loggedInAccount } = useAppState();
  const { friends } = useShipStore();
  const roomsStore = useRoomsStore();
  const speakerRef = useRef<any>(null);
  const { getOptions, setOptions } = useContextMenu();
  const isOur = person === loggedInAccount?.serverId;
  const metadata = friends.getContactAvatarMetadata(person);

  let name = metadata?.nickname || person;
  let peer: any;
  if (isOur) {
    peer = roomsStore.ourPeer;
  } else {
    peer = roomsStore.peers.get(person);
  }

  const contextMenuOptions = useMemo(
    () =>
      [
        {
          id: `room-speaker-${person}-reconnect`,
          label: 'Reconnect',
          disabled: peer?.status === PeerConnectionState.Connected,
          onClick: (evt: any) => {
            roomsStore.retryPeer(person);
            evt.stopPropagation();
          },
        },
        // only the creator can kick people
        loggedInAccount?.serverId === roomsStore.currentRoom?.creator && {
          style: { color: '#FD4E4E' },
          id: `room-speaker-${person}-kick`,
          label: 'Kick',
          loading: false,
          onClick: (evt: any) => {
            evt.stopPropagation();
            roomsStore.kickPeer(person);
          },
        },
      ].filter(Boolean) as ContextMenuOption[],
    [peer?.status, person, roomsStore.currentRid, loggedInAccount]
  );

  const peerState = isOur ? PeerConnectionState.Connected : peer?.status;

  if (name.length > 17) name = `${name.substring(0, 17)}...`;

  let sublabel = <Sublabel>{speakerType[type]}</Sublabel>;
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
    sublabel = <Sublabel>Away</Sublabel>;
  }

  useEffect(() => {
    if (
      person !== loggedInAccount?.serverId &&
      contextMenuOptions !== getOptions(`room-speaker-${person}`)
    ) {
      setOptions(`room-speaker-${person}`, contextMenuOptions);
    }
  }, [
    contextMenuOptions,
    getOptions,
    person,
    setOptions,
    loggedInAccount?.serverId,
  ]);

  return (
    <SpeakerWrapper
      id={`room-speaker-${person}`}
      // data-close-tray="false"
      ref={speakerRef}
      key={person}
      gap={4}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      className={(peer as PeerClass)?.hasVideo ? 'speaker-video-on' : ''}
    >
      <>
        <video
          style={{
            zIndex: 0,
            display: 'none',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '6px',
          }}
          id={`peer-video-${person}`}
          autoPlay
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
              borderRadiusOverride="6px"
              simple
              size={(peer as PeerClass)?.hasVideo ? 22 : 32}
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
            // height={20}
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
            {!peer?.isMuted && <AudioWave speaking={peer?.isSpeaking} />}
          </Flex>

          <Flex
            position="absolute"
            style={{ height: 18, pointerEvents: 'none' }}
          >
            {peer?.isMuted && (
              <Icon
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                name="MicOff"
                size={18}
                opacity={0.5}
              />
            )}
          </Flex>
          {!peer?.isMuted && !peer?.isSpeaking && (
            <Flex
              className="speaker-sublabel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
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

const SpeakerWrapper = styled(Flex)<FlexProps>`
  padding: 16px 0;
  border-radius: 9px;
  transition: 0.25s ease;
  position: relative;
  &:hover {
    transition: 0.25s ease;
    background: rgba(var(--rlm-overlay-hover-rgba));
  }
  &.speaker-video-on {
    .speaker-avatar-wrapper {
      position: absolute;
      flex-direction: row;
      align-items: flex-start;
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
