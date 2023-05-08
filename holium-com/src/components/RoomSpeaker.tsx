import { useMemo } from 'react';
import styled from 'styled-components';

import {
  Avatar,
  Flex,
  FlexProps,
  Icon,
  Text,
} from '@holium/design-system/general';

interface ISpeaker {
  metadata: {
    nickname: string;
    avatar: string;
    color: string;
    patp: string;
    sublabel: string;
    muted: boolean;
  };
  type: 'our' | 'speaker' | 'listener' | 'creator';
}

export const RoomSpeaker = ({ metadata }: ISpeaker) => {
  const person = metadata.patp;

  return useMemo(
    () => (
      <SpeakerWrapper id={`room-speaker-${person}`} key={person} gap={4}>
        <Flex
          style={{ pointerEvents: 'none' }}
          flexDirection="column"
          alignItems="center"
          gap={10}
        >
          <Avatar
            clickable={false}
            borderRadiusOverride="6px"
            simple
            size={36}
            avatar={metadata && metadata.avatar}
            patp={person}
            sigilColor={[(metadata && metadata.color) || '#000000', 'white']}
          />
          <Text.Custom
            style={{ pointerEvents: 'none' }}
            alignItems="center"
            fontSize={1}
            fontWeight={500}
          >
            {metadata.nickname || person}
          </Text.Custom>
        </Flex>
        <Flex
          gap={4}
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          style={{ pointerEvents: 'none' }}
        >
          <Flex
            alignItems="center"
            style={{ height: 18, pointerEvents: 'none' }}
          >
            {metadata.muted ? (
              <Icon name="MicOff" size={16} opacity={0.5} />
            ) : (
              <Icon name="MicOn" size={16} opacity={0.5} />
            )}
          </Flex>
          <Text.Custom fontSize="12px" opacity={0.5}>
            {metadata.sublabel}
          </Text.Custom>
        </Flex>
      </SpeakerWrapper>
    ),
    [person, metadata]
  );
};

type SpeakerStyle = FlexProps;

const SpeakerWrapper = styled(Flex)<SpeakerStyle>`
  padding: 16px 0;
  border-radius: 9px;
  transition: 0.25s ease;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  &:hover {
    transition: 0.25s ease;
  }
`;
