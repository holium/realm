import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Flex } from '../Flex/Flex';

import { Skeleton } from './Skeleton';

export default {
  component: Skeleton,
} as ComponentMeta<typeof Skeleton>;

export const SkeletonDemo: ComponentStory<typeof Skeleton> = () => (
  <Skeleton width={250} height={50}>
    <Flex height="100%" justifyContent="center" alignItems="center">
      250px X 50px
    </Flex>
  </Skeleton>
);
