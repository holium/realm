import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Skeleton } from './Skeleton';
import { Flex } from '../Flex/Flex';

export default {
  component: Skeleton,
} as ComponentMeta<typeof Skeleton>;

export const SkeletonDemo: ComponentStory<typeof Skeleton> = () => (
  <Skeleton width={250} height={52}>
    <Flex height="full" justifyContent="center" alignItems="center">
      250px X 50px
    </Flex>
  </Skeleton>
);
