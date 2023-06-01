import { MOBILE_WIDTH } from 'consts';
import styled from 'styled-components';

import { Flex, Text } from '@holium/design-system/general';

import { Milestone } from './Milestone';

const TimelineContainer = styled(Flex)`
  position: relative;
  width: 100%;
  max-width: 390px;
  padding: 24px;
  gap: 32px;
  flex-direction: column;
  border-right: 1px solid var(--rlm-icon-color);

  @media (min-width: ${MOBILE_WIDTH}px) {
    transform: translateX(calc(-50%));
  }
`;

const TobeContinuedBorder = styled.div`
  width: 100%;
  max-width: 390px;
  padding: 24px;
  border-right: 1px dashed var(--rlm-icon-color);

  @media (min-width: ${MOBILE_WIDTH}px) {
    transform: translateX(calc(-50%));
  }
`;

const DateText = styled(Text.Body)`
  text-align: right;
  color: var(--rlm-icon-color);
`;

const DateDot = styled.div`
  position: absolute;
  top: 0;
  right: ${-10 - 24}px;
  width: 19px;
  height: 19px;
  background: #6e6e6d;
  border-radius: 50%;
`;

type Props = {
  date: string;
};

const Date = ({ date }: Props) => (
  <div style={{ position: 'relative' }}>
    <DateText>{date}</DateText>
    <DateDot />
  </div>
);

export const HoliumRoadmapSection = () => (
  <>
    <TimelineContainer>
      <Date date="06/2023" />
      <Milestone
        index={1}
        title="Realm iOS"
        description="We’ve been working on the mobile app for months and are finally ready to launch the alpha."
      />
      <Date date="07/2023" />
      <Milestone
        index={2}
        title="Relic Browser 2.0"
        description="Browser tabs, shared bookmarks, and more."
        rightSide
      />
      <Milestone
        index={3}
        title="Developer preview"
        description="Libraries for building on Realm will be released, starting with rooms and then wallet."
      />
      <Milestone
        index={4}
        title="Mobile rooms in Realm iOS"
        description="Drop into voice chat with friends in your space while on the move."
        rightSide
      />
      <Date date="08/2023" />
      <Milestone
        index={5}
        title="Realm Android"
        description="An identity system that makes onboarding and NFT gating simple and robust."
      />
      <Date date="09/2023" />
      <Milestone
        index={6}
        title="Bedrock SDK"
        description="A data primitives layer that makes application data much more composable."
        rightSide
      />
      <Date date="10/2023" />
    </TimelineContainer>
    <TobeContinuedBorder />
  </>
);
