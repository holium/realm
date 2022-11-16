import { FC, useRef, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import BeatLoader from 'react-spinners/BeatLoader';
import styled from 'styled-components';
import {
  ContextMenu,
  Flex,
  Icons,
  Text,
  Sigil,
  FlexProps,
} from 'renderer/components';
import { useTrayApps, LiveRoom } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { PeerConnectionState } from '@holium/realm-room';
import { rgba, darken } from 'polished';
import { RoomsActions } from 'renderer/logic/actions/rooms';

interface ISpeaker {
  person: string;
  audio: any;
  cursors?: boolean;
  type: 'host' | 'speaker' | 'listener';
}

const speakerType = {
  host: 'Host',
  speaker: 'Speaker',
  listener: 'Listener',
};

export const Speaker: FC<ISpeaker> = observer((props: ISpeaker) => {
  const { person, audio, type } = props;
  const { ship, theme, contacts } = useServices();
  const { roomsApp } = useTrayApps();
  const speakerRef = useRef<any>(null);
  const isOur = person === ship?.patp;
  // const [peer, setPeer] = useState<RemoteParticipant | undefined>();
  const [isStarted, setIsStarted] = useState(false);
  const metadata = contacts.getContactAvatarMetadata(person);

  let name = metadata?.nickname || person;
  const livePeer = LiveRoom.participants.get(person);
  const muted = isOur ? LiveRoom.our?.isMuted : livePeer?.isMuted;

  const contextMenuItems = [
    {
      id: `room-speaker-${person}-reconnect`,
      label: 'Reconnect',
      disabled: livePeer?.connectionState === 'connected',
      onClick: (evt: any) => {
        livePeer && LiveRoom.reconnectPeer(livePeer.patp);
        evt.stopPropagation();
      },
    },
  ];

  // only the creator can kick people
  if (ship!.patp === roomsApp.liveRoom!.creator) {
    contextMenuItems.push({
      // @ts-expect-error
      style: { color: '#FD4E4E' },
      id: `room-speaker-${person}-kick`,
      label: 'Kick',
      loading: false,
      onClick: (evt: any) => {
        if (!roomsApp.liveRoom) return;
        console.log('kicking user?');
        RoomsActions.kickUser(roomsApp.liveRoom.id, person);
        LiveRoom.kickParticipant(person);
        evt.stopPropagation();
      },
    });
  }

  useEffect(() => {
    // this is getting set every 0th frame that <Speaker/> is rendered.
    // meaning: whenever the room voice view is opened, it does this logic over again
    // as a result, electron produces a warning for too many eventlisteners.
    // MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 started listeners added. Use emitter.setMaxListeners() to increase limit
    LiveRoom.on('started', () => {
      console.log('setting isstarted!');
      setIsStarted(true);
    });
  }, []);

  const peerState = isOur ? 'connected' : livePeer?.connectionState;

  if (name.length > 17) name = `${name.substring(0, 17)}...`;
  const textColor =
    livePeer?.connectionState !== PeerConnectionState.Failed
      ? theme.currentTheme.textColor
      : '#FD4E4E';

  const textProps = {
    color: textColor,
  };

  let sublabel = <Sublabel {...textProps}>{speakerType[type]}</Sublabel>;
  if (peerState === PeerConnectionState.Failed)
    sublabel = <Sublabel {...textProps}>Failed</Sublabel>;
  if (
    peerState === PeerConnectionState.New ||
    peerState === PeerConnectionState.Connecting
  )
    sublabel = <BeatLoader size={6} speedMultiplier={0.65} />;

  if (peerState === PeerConnectionState.Disconnected)
    sublabel = <Sublabel {...textProps}>Bad connection</Sublabel>;

  return (
    <>
      <SpeakerWrapper
        id={`room-speaker-${person}`}
        // data-close-tray="false"
        ref={speakerRef}
        hoverBg={darken(0.04, theme.currentTheme.windowColor)}
        key={person}
        gap={4}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        width={'100%'}
      >
        <Flex
          style={{ pointerEvents: 'none' }}
          flexDirection="column"
          alignItems="center"
          gap={10}
        >
          <Sigil
            clickable={false}
            opacity={peerState === PeerConnectionState.Connected ? 1 : 0.4}
            borderRadiusOverride="6px"
            simple
            size={36}
            avatar={metadata && metadata.avatar}
            patp={person}
            color={[(metadata && metadata.color) || '#000000', 'white']}
          />
          <Text
            style={{ pointerEvents: 'none' }}
            opacity={peerState === PeerConnectionState.Connected ? 1 : 0.4}
            color={textColor}
            alignItems="center"
            // height={20}
            fontSize={2}
            fontWeight={500}
          >
            {name}
          </Text>
        </Flex>
        <Flex
          opacity={peerState === PeerConnectionState.Connected ? 1 : 0.4}
          gap={4}
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          style={{ pointerEvents: 'none' }}
        >
          <Flex style={{ pointerEvents: 'none' }}>
            {isOur
              ? muted && (
                  <Icons
                    fill={textColor}
                    name="MicOff"
                    size={15}
                    opacity={0.5}
                  />
                )
              : livePeer?.isMuted && (
                  <Icons
                    fill={textColor}
                    name="MicOff"
                    size={15}
                    opacity={0.5}
                  />
                )}
          </Flex>
          {sublabel}
        </Flex>
        {person !== ship?.patp && (
          <ContextMenu
            isComponentContext
            textColor={theme.currentTheme.textColor}
            customBg={rgba(theme.currentTheme.windowColor, 0.9)}
            containerId={`room-speaker-${person}`}
            parentRef={speakerRef}
            style={{ minWidth: 180 }}
            position="below"
            menu={contextMenuItems}
          />
        )}
      </SpeakerWrapper>
    </>
  );
});

type SpeakerStyle = FlexProps & { hoverBg: string };

const SpeakerWrapper = styled(Flex)<SpeakerStyle>`
  padding: 16px 0;
  border-radius: 9px;
  transition: 0.25s ease;
  &:hover {
    transition: 0.25s ease;
    background-color: ${(props: SpeakerStyle) => props.hoverBg};
  }
`;

const Sublabel = styled(Text)`
  font-size: 12px;
  font-weight: 400;
  opacity: 0.5;
  pointer-events: none;
`;
