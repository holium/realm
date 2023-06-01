import { SectionTitle } from 'pages/about.styles';
import styled from 'styled-components';

import { Flex, Text } from '@holium/design-system/general';

import { RenaissanceHead } from 'components/about/RenaissanceHead';

const RenaissanceHeadContainer = styled(Flex)`
  flex: 1;
  align-items: center;
  justify-content: center;

  svg {
    width: 100%;
    max-width: 210px;
  }
`;

const HeroContainer = styled(Flex)`
  flex: 2;
  flex-direction: column;
  gap: 16px;
`;

export const HoliumMissionSection = () => (
  <Flex alignItems="center" gap="32px">
    <HeroContainer>
      <SectionTitle>Our Mission</SectionTitle>
      <Text.H1 fontWeight={500} style={{ lineHeight: '1.2em' }}>
        Build a sovereign future for humanity.
      </Text.H1>
    </HeroContainer>
    <RenaissanceHeadContainer>
      <RenaissanceHead />
    </RenaissanceHeadContainer>
  </Flex>
);
