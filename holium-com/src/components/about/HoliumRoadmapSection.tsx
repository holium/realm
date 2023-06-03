import {
  DateDot,
  DateText,
  TimelineContainer,
  TobeContinuedBorder,
} from './HoliumRoadmapSection.styles';
import { Milestone } from './Milestone';

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
        description="The Android version of Realm will be released."
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
