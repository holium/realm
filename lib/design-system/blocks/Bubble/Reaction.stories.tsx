import { useState } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Box, Flex } from '../../general';
import { FragmentReactionType } from './Bubble.types';
import {
  OnReactionPayload,
  ReactionPicker,
  ReactionPickerStyle,
  Reactions,
} from './Reaction';

export default {
  component: Reactions,
} as ComponentMeta<typeof Reactions>;

export const Default: ComponentStory<typeof Reactions> = () => {
  const [reacts, setReacts] = useState<FragmentReactionType[]>([]);
  const isOurPatp = '~lomder-librun';
  window.ship = isOurPatp;
  const onReaction = (payload: OnReactionPayload) => {
    if (payload.action === 'add') {
      setReacts([
        ...reacts,
        { msgId: '1', by: isOurPatp, emoji: payload.emoji },
      ]);
    } else {
      const removeIdx = reacts.findIndex(
        (r) => r.emoji === payload.emoji && r.by === isOurPatp
      );
      if (removeIdx === -1) {
        return;
      }
      setReacts(reacts.filter((_, idx) => idx !== removeIdx));
    }
  };
  return (
    <Flex position="relative" height={670} width={400}>
      <Box position="absolute" left={400} top={600}>
        <Reactions reactions={reacts} onReaction={onReaction} />
      </Box>
    </Flex>
  );
};

export const Picker: ComponentStory<typeof ReactionPicker> = () => {
  return (
    <ReactionPickerStyle>
      <ReactionPicker
        isReacting
        anchorPoint={{ x: 12, y: 12 }}
        onClick={(react) => console.log(react)}
      />
    </ReactionPickerStyle>
  );
};
