import { Emoji, EmojiStyle } from 'emoji-picker-react';

import { Text } from '../../../general';
import { EmojiSizes } from './Reaction.sizes';
import { ReactionButton } from './Reaction.styles';

type Props = {
  id: string;
  reaction: any;
  isOur: boolean;
  ourColor: string | undefined;
  size: string;
  isSelected: boolean;
  onClick: (emoji: string) => void;
};

export const ReactionCount = ({
  id,
  reaction,
  isOur,
  ourColor,
  size,
  isSelected,
  onClick,
}: Props) => (
  <ReactionButton
    id={id}
    isOur={isOur}
    ourColor={ourColor}
    size={size}
    hasCount={reaction.count > 1}
    onClick={(evt) => {
      evt.stopPropagation();
      onClick(reaction.emoji);
    }}
    selected={isSelected}
  >
    <Emoji
      key={`${reaction.emoji}-emoji`}
      unified={reaction.emoji}
      emojiStyle={EmojiStyle.APPLE}
      size={EmojiSizes[size]}
    />
    {reaction.count > 1 && (
      <Text.Hint
        opacity={0.9}
        style={{
          color: isOur ? '#ffffff' : 'rgba(var(--rlm-text-rgba), .7)',
        }}
      >
        {reaction.count}
      </Text.Hint>
    )}
  </ReactionButton>
);
