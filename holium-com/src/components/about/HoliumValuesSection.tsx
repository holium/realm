import Image from 'next/image';
import styled from 'styled-components';

import { Flex, Text } from '@holium/design-system/general';

import { MOBILE_WIDTH } from '../../constants';

const Values = styled(Flex)`
  gap: 48px;

  @media (max-width: ${MOBILE_WIDTH + 100}px) {
    gap: 32px;
  }

  @media (max-width: ${MOBILE_WIDTH}px) {
    flex-direction: column;
  }
`;

const Value = styled(Flex)`
  flex: 1;
  flex-direction: column;
  gap: 23px;
`;

const ValueTitle = styled(Text.H3)`
  font-weight: 500;
  line-height: 1.2em;
`;

const ValueBody = styled(Text.Body)`
  font-size: 14px;
  font-weight: 300;
  line-height: 1.8em;
`;

const ImageContainer = styled(Flex)`
  height: 160px;
  align-items: center;
`;

export const HoliumValuesSection = () => (
  <Values>
    <Value>
      <ImageContainer>
        <Image
          alt="Maximize sovereignty"
          src="/graphics/handWithKey.png"
          width={160}
          height={160}
        />
      </ImageContainer>
      <ValueTitle>Maximize sovereignty</ValueTitle>
      <ValueBody>
        Everything we build should increase the sovereignty of individuals and
        communities.
      </ValueBody>
    </Value>
    <Value>
      <ImageContainer>
        <Image
          alt="Lower entropy"
          src="/graphics/questionMark.png"
          width={130}
          height={130}
          style={{ transform: 'scale(0.9)' }}
        />
      </ImageContainer>
      <ValueTitle>Lower entropy</ValueTitle>
      <ValueBody>
        In a world of increasing uncertainty and disorder, we take mindful,
        purposeful actions that reduce entropy.
      </ValueBody>
    </Value>
    <Value>
      <ImageContainer>
        <Image
          alt="Build a human future"
          src="/graphics/globe.png"
          width={129}
          height={129}
          style={{ transform: 'scale(0.85)' }}
        />
      </ImageContainer>
      <ValueTitle>Build a human future</ValueTitle>
      <ValueBody>
        Our products should transcend geographical, cultural, and social
        boundaries and enrich the human experience.
      </ValueBody>
    </Value>
  </Values>
);
