import { useRef, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import BeatLoader from 'react-spinners/BeatLoader';
import styled from 'styled-components';
import { useServices } from 'renderer/logic/store';
import { PeerConnectionState, RealmProtocol } from '@holium/realm-room';
import { darken } from 'polished';
import { useRooms } from '../Rooms/useRooms';
import {
  ContextMenuOption,
  useContextMenu,
} from 'renderer/components/ContextMenu';
import { Flex, FlexProps, Text, Avatar, Icon } from '@holium/design-system';
import { AudioWave } from '../Rooms/components/AudioWave';

interface ICaller {
  person: string;
  cursors?: boolean;
  type: 'our' | 'caller' | 'listener' | 'creator';
}

const callerType = {
  our: 'You',
  creator: 'Creator',
  caller: 'Caller',
  listener: 'Listener',
};

const CallerPresenter = (props: ICaller) => {
  const { person, type } = props;
  const { ship, theme, friends } = useServices();
  const callerRef = useRef<any>(null);
  const roomsManager = useRooms(ship?.patp);
  const { getOptions, setOptions } = useContextMenu();
  const isOur = person === ship?.patp;
  const metadata = friends.getContactAvatarMetadata(person);

  let name = metadata?.nickname || person;
  const peer = isOur
    ? roomsManager.protocol.local
    : roomsManager.protocol.peers.get(person);

  const contextMenuOptions = useMemo(
    () =>
      [
        {
          id: `room-caller-${person}-reconnect`,
          label: 'Reconnect',
          disabled: peer?.status === PeerConnectionState.Connected,
          onClick: (evt: any) => {
            (roomsManager.protocol as RealmProtocol).retry(person);
            evt.stopPropagation();
          },
        },
        // only the creator can kick people
        ship?.patp === roomsManager.live.room?.creator && {
          style: { color: '#FD4E4E' },
          id: `room-caller-${person}-kick`,
          label: 'Kick',
          loading: false,
          onClick: (evt: any) => {
            evt.stopPropagation();
            roomsManager.protocol.kick(person);
          },
        },
      ].filter(Boolean) as ContextMenuOption[],
    [peer?.status, person, roomsManager.live.room, roomsManager.protocol, ship]
  );

  const peerState = isOur ? PeerConnectionState.Connected : peer?.status;

  if (name.length > 17) name = `${name.substring(0, 17)}...`;

  let sublabel = <Sublabel>{callerType[type]}</Sublabel>;
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
      person !== ship?.patp &&
      contextMenuOptions !== getOptions(`room-caller-${person}`)
    ) {
      setOptions(`room-caller-${person}`, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, person, setOptions, ship?.patp]);

  const callerVideo = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (callerVideo.current) {
      if (peer?.videoTracks && peer?.videoTracks.size > 0) {
        callerVideo.current.srcObject = Array.from(
          peer?.videoTracks.values()
        )[0];
      }
    }
  }, []);

  return (
    <CallerWrapper
      id={`room-caller-${person}`}
      // data-close-tray="false"
      ref={callerRef}
      hoverBg={darken(0.04, theme.currentTheme.windowColor)}
      key={person}
      gap={4}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Flex
        style={{ pointerEvents: 'none' }}
        flexDirection="column"
        alignItems="center"
        gap={10}
      >
        <video ref={callerVideo} autoPlay playsInline></video>
        <Flex
          style={{ pointerEvents: 'none' }}
          flexDirection="column"
          alignItems="center"
          gap={0}
        >
          <Avatar
            clickable={false}
            opacity={peerState === PeerConnectionState.Connected ? 1 : 0.4}
            borderRadiusOverride="6px"
            simple
            size={36}
            avatar={metadata && metadata.avatar}
            patp={person}
            sigilColor={[(metadata && metadata.color) || '#000000', 'white']}
          />
        </Flex>
        <Text.Custom
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

        <Flex position="absolute" style={{ height: 18, pointerEvents: 'none' }}>
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
    </CallerWrapper>
  );
};

export const VideoCaller = observer(CallerPresenter);

type CallerStyle = FlexProps & { hoverBg: string };

const CallerWrapper = styled(Flex)<CallerStyle>`
  padding: 16px 0;
  border-radius: 9px;
  transition: 0.25s ease;
  &:hover {
    transition: 0.25s ease;
    background-color: ${(props: CallerStyle) => props.hoverBg};
  }
`;

const Sublabel = styled(Text.Custom)`
  font-size: 12px;
  font-weight: 400;
  opacity: 0.5;
  pointer-events: none;
`;
