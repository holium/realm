import { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../..';
import { OnReactionPayload, Reactions, ReactionPicker } from './Reaction';
import { FragmentReactionType } from '../Bubble/Bubble.types';
import styled from 'styled-components';

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

const ReactionPickerStyle = styled.div`
  .EmojiPickerReact {
    --epr-category-label-height: 30px;
    --epr-category-navigation-button-size: 24px;
    --epr-emoji-size: 24px;
    --epr-search-input-height: 34px;
    font-size: 14px;
  }
  .epr-header-overlay {
    padding: 8px !important;
  }
  .epr-skin-tones {
    padding-left: 0px !important;
    padding-right: 2px !important;
  }
  .epr-category-nav {
    padding: 0px 8px !important;
    padding-bottom: 4px !important;
    --epr-category-navigation-button-size: 24px;
  }
  .ul.epr-emoji-list {
    padding-bottom: 8px !important;
  }

  /* .epr-category-nav {

  } */
`;

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
