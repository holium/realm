import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../';
import { Template } from './name';

export default {
  component: Template,
} as ComponentMeta<typeof Template>;

export const Default: ComponentStory<typeof Template> = () => (
  <Flex flexDirection="column">
    <Template />
  </Flex>
);
