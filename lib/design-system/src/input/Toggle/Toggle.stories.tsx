import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../general/Flex/Flex';
import { Toggle } from './Toggle';

export default {
  component: Toggle,
} as ComponentMeta<typeof Toggle>;

export const Default: ComponentStory<typeof Toggle> = () => (
  <Flex gap={12} p={3}>
    <Toggle
      size="sm"
      onChange={(checked) => {
        console.log('sm checked', checked);
      }}
    />

    <Toggle
      size="md"
      onChange={(checked) => {
        console.log('md checked', checked);
      }}
    />
    <Toggle
      size="lg"
      onChange={(checked) => {
        console.log('lg checked', checked);
      }}
    />

    <Toggle
      disabled
      size="md"
      onChange={(checked) => {
        console.log('md checked', checked);
      }}
    />
  </Flex>
);
