import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../..';
import { SectionDivider } from './SectionDivider';

export default {
  component: SectionDivider,
} as ComponentMeta<typeof SectionDivider>;

export const Default: ComponentStory<typeof SectionDivider> = () => (
  <Flex gap={12} flexDirection="column">
    <SectionDivider label="My bookmarks" alignment="left" />
    <SectionDivider label="My bookmarks" alignment="center" />
    <SectionDivider label="My bookmarks" alignment="right" />
  </Flex>
);
