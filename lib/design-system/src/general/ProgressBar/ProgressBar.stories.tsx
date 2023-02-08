import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../';
import { ProgressBar } from './ProgressBar';

export default {
  component: ProgressBar,
} as ComponentMeta<typeof ProgressBar>;

export const Default: ComponentStory<typeof ProgressBar> = () => (
  <Flex flexDirection="column" width="300px">
    <ProgressBar percentage={50} />
  </Flex>
);
