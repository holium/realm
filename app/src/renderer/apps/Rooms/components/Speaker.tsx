import { FC, useRef, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
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

interface ISpeaker {
  person: string;
  audio: any;
}

export const Speaker: FC<ISpeaker> = observer((props: ISpeaker) => {
  const { person, audio } = props;
  const { ship, desktop } = useServices();
  const speakerRef = useRef<any>(null);

  const [peerState, setPeerState] = useState<RTCPeerConnectionState>('new');
  // const [peer, setPeer] = useState<RemoteParticipant | undefined>();
  const [isStarted, setIsStarted] = useState(false);
  const metadata = ship?.contacts.getContactAvatarMetadata(person);
  const hasVoice = audio && person === ship?.patp;
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
    if (person === ship?.patp) {
      setPeerState(PeerConnectionState.Connected);
    } else {
      const livePeer = LiveRoom.participants.get(person);
      handleRemoteEvents(setPeerState, livePeer);
    }
  }, [isStarted]);

  if (name.length > 18) name = `${name.substring(0, 18)}...`;

  return (
    <>
      <SpeakerWrapper
        id={`room-speaker-${person}`}
        // data-close-tray="false"
        ref={speakerRef}
        hoverBg={darken(0.04, desktop.theme.windowColor)}
        key={person}
        gap={12}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        width={'100%'}
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
          color={
            peerState !== PeerConnectionState.Failed ? 'initial' : '#FD4E4E'
          }
          alignItems="center"
          height={20}
          fontSize={3}
          fontWeight={500}
        >
          {name}
          {!hasVoice && <Icons ml={1} name="MicOff" size={18} opacity={0.3} />}
        </Text>
        {hasVoice ? (
          <Flex height={30}></Flex>
        ) : (
          <Flex height={30}>
            {/* <Icons name="MicOff" size={18} opacity={0.3} /> */}
          </Flex>
        )}
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
      </SpeakerWrapper>
    </>
  );
});

const handleRemoteEvents = (
  setState: (state: RTCPeerConnectionState) => void,
  participant?: RemoteParticipant
) => {
  console.log('participant, speaker', participant);
  if (!participant) return;
  setState(participant.connectionState);
  console.log('listening for remote events');
  participant.on('connected', () => {
    setState('connected');
  });
  participant.on('disconnected', () => {
    setState('disconnected');
  });
  participant.on('connecting', () => {
    setState('connecting');
  });
  participant.on('failed', () => {
    setState('failed');
  });
};

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
