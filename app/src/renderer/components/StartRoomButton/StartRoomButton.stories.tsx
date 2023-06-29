import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Flex } from '@holium/design-system/general';

import { StartRoomButtonView } from './StartRoomButtonView';

const mockParticipants = [
  {
    patp: '~lomder-librun',
    nickname: 'lomder-librun',
    color: '#000000',
    avatar: 'https://picsum.photos/200',
  },
  {
    patp: '~lopsyp-doztun',
    nickname: 'Gus',
    color: '#000000',
    avatar: 'https://picsum.photos/201',
  },
  {
    patp: '~hosryc-matbel',
    nickname: '~hosryc-GPT',
    color: '#000000',
    avatar: 'https://picsum.photos/203',
  },
  {
    patp: '~zod',
    nickname: 'zod',
    color: '#000000',
    avatar: 'https://picsum.photos/204',
  },
  {
    patp: '~bus',
    nickname: 'bus',
    color: '#000000',
    avatar: 'https://picsum.photos/205',
  },
];

export default {
  component: StartRoomButtonView,
} as ComponentMeta<typeof StartRoomButtonView>;

export const StartRoomStory: ComponentStory<
  typeof StartRoomButtonView
> = () => (
  <Flex p="32px">
    <StartRoomButtonView state="start" participants={[]} onClick={() => {}} />
  </Flex>
);

StartRoomStory.storyName = 'Start room';

export const JoinRoomStory: ComponentStory<typeof StartRoomButtonView> = () => (
  <Flex p="32px">
    <StartRoomButtonView
      state="join"
      participants={mockParticipants}
      onClick={() => {}}
    />
  </Flex>
);

JoinRoomStory.storyName = 'Join room';

export const LeaveRoomStory: ComponentStory<
  typeof StartRoomButtonView
> = () => (
  <Flex p="32px">
    <StartRoomButtonView
      state="leave"
      participants={mockParticipants}
      onClick={() => {}}
    />
  </Flex>
);

LeaveRoomStory.storyName = 'Leave room';
