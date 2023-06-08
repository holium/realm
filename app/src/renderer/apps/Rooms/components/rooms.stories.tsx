import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Text } from '@holium/design-system';

import { SpeakerGrid } from './SpeakerGrid';

export default {
  component: SpeakerGrid,
} as ComponentMeta<typeof SpeakerGrid>;

export const NoActiveSpeaker: ComponentStory<typeof SpeakerGrid> = () => (
  <SpeakerGrid activeSpeaker={null} peers={['~lomder-librun', '~hostyv']}>
    <Text.Default>System bar</Text.Default>
  </SpeakerGrid>
);
