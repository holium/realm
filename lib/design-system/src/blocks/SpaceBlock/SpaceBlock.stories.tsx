import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Flex } from '../../../general';
import { SpaceBlock } from './SpaceBlock';

export default {
  component: SpaceBlock,
} as ComponentMeta<typeof SpaceBlock>;

export const Default: ComponentStory<typeof SpaceBlock> = () => (
  <Flex flexDirection="row" height={600} gap={16} p={1}>
    <Flex
      flexDirection="column"
      width={400}
      height={300}
      p={2}
      background={'#FFFF'}
    >
      <SpaceBlock
        id="space-block-1"
        mode="display"
        name="Realm Forerunners"
        members={386}
        hasJoined={false}
        url="/spaces/~lomder-librun/forerunners"
        width={400}
      />
    </Flex>
  </Flex>
);
