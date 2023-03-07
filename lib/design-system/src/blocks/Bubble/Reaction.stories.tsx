import { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../..';
import {
  OnReactionPayload,
  Reactions,
  ReactionPicker,
  ReactionPickerStyle,
} from './Reaction';
import { FragmentReactionType } from '../Bubble/Bubble.types';

export default {
  component: Reactions,
} as ComponentMeta<typeof Reactions>;

export const Default: ComponentStory<typeof Reactions> = () => {
  const [reacts, setReacts] = useState<FragmentReactionType[]>([]);
  const isOurPatp = '~lomder-librun';
  window.ship = isOurPatp;
  const onReaction = (payload: OnReactionPayload) => {
    if (payload.action === 'add') {
      setReacts([...reacts, { author: isOurPatp, emoji: payload.emoji }]);
    } else {
      const removeIdx = reacts.findIndex(
        (r) => r.emoji === payload.emoji && r.author === isOurPatp
      );
      if (removeIdx === -1) {
        return;
      }
      setReacts(reacts.filter((_, idx) => idx !== removeIdx));
    }
  };
  return (
    <Flex position="relative" height={670} width={400}>
      <Reactions
        defaultIsOpen={true}
        reactions={reacts}
        onReaction={onReaction}
      />
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
