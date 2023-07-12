import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Flex } from '../../../general';
import { ProgressBar } from './ProgressBar';

export default {
  component: ProgressBar,
} as ComponentMeta<typeof ProgressBar>;

export const Default: ComponentStory<typeof ProgressBar> = () => (
  <Flex flexDirection="column" width="300px">
    <ProgressBar percentages={[50]} />
  </Flex>
);
