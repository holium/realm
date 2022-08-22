import { FC, useRef, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import BeatLoader from 'react-spinners/BeatLoader';
import { ThemeModelType } from 'os/services/shell/theme.model';
import styled, { css } from 'styled-components';
import {
  ContextMenu,
  Flex,
  Icons,
  Text,
  Sigil,
  FlexProps,
} from 'renderer/components';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { LiveRoom } from 'renderer/apps/store';
import { RemoteParticipant } from '../lib/participant/remote';
import { PeerConnectionState } from '../lib/participant/events';
import { rgba, darken } from 'polished';
import { handleLocalEvents, handleRemoteEvents } from '../listeners';

interface ISpeaker {
  person: string;
  audio: any;
  type: 'host' | 'speaker' | 'listener';
}

const speakerType = {
  host: 'Host',
  speaker: 'Speaker',
  listener: 'Listener',
};

export const Speaker: FC<ISpeaker> = observer((props: ISpeaker) => {
  const { person, audio, type } = props;
  const { ship, desktop } = useServices();
  const speakerRef = useRef<any>(null);
  const isOur = person === ship?.patp;
  const [peerState, setPeerState] = useState<RTCPeerConnectionState>('new');
  // const [peer, setPeer] = useState<RemoteParticipant | undefined>();
  const [isStarted, setIsStarted] = useState(false);
  const metadata = ship?.contacts.getContactAvatarMetadata(person);

  // const hasVoice = audio && person === ship?.patp;
  const [ourState, setOurState] = useState({
    muted: false,
    cursor: true,
  });

  let name = metadata?.nickname || person;
  const livePeer = LiveRoom.participants.get(person);

  const contextMenuItems = [
    {
      id: `room-speaker-${person}-reconnect`,
      label: 'Reconnect',
      disabled: livePeer?.connectionState === 'connected',
      onClick: (evt: any) => {
        console.log(livePeer);
        livePeer && LiveRoom.connectParticipant(livePeer);
        evt.stopPropagation();
        // DesktopActions.toggleDevTools();
      },
    },
    {
      style: { color: '#FD4E4E' },
      id: `room-speaker-${person}-kick`,
      label: 'Kick',
      loading: false,
      onClick: (evt: any) => {
        LiveRoom.kickParticipant(person);
      },
    },
  ];

  useEffect(() => {
    LiveRoom.on('started', () => {
      setIsStarted(isStarted);
    });
  }, []);

  useEffect(() => {
    if (isOur) {
      setPeerState(PeerConnectionState.Connected);
      handleLocalEvents(setOurState, LiveRoom.our);
    } else {
      const livePeer = LiveRoom.participants.get(person);
      handleRemoteEvents(setPeerState, livePeer);
    }
  }, [isStarted]);

  if (name.length > 17) name = `${name.substring(0, 17)}...`;
  const textColor =
    peerState !== PeerConnectionState.Failed ? 'initial' : '#FD4E4E';

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
        hoverBg={darken(0.04, desktop.theme.windowColor)}
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
            {isOur && ourState.muted && (
              <Icons fill={textColor} name="MicOff" size={15} opacity={0.5} />
            )}
          </Flex>
          {sublabel}
        </Flex>
        {type !== 'host' && (
          <ContextMenu
            isComponentContext
            textColor={desktop.theme.textColor}
            customBg={rgba(desktop.theme.windowColor, 0.9)}
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
