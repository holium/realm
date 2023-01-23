import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import styled, { css } from 'styled-components';
import { darken } from 'polished';
import { Flex, Box, Icon, Text } from '../..';
import { getVar } from '../../util/colors';
import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Emoji,
  SkinTones,
} from 'emoji-picker-react';

const ReactionRow = styled(Box)`
  position: absolute;
  display: flex;
  flex-direction: row;
  gap: 4px;
  left: -4px;
  bottom: -14px;
`;

const ReactionButton = styled(Box)<{ hasCount?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background: var(--rlm-input-color);
  border: 1px solid var(--rlm-border-color);
  border-radius: 12px;
  transition: var(--transition);
  min-width: 24px;
  height: 24px;
  width: auto;
  img {
    user-select: none;
    pointer-events: none;
  }
  div {
    user-select: none;
    pointer-events: none;
  }
  ${({ hasCount }) =>
    hasCount &&
    css`
      padding: 0 4px;
      gap: 4px;
    `}
  &:hover {
    transition: var(--transition);
    cursor: pointer;
    background: ${() => darken(0.05, getVar('input'))};
  }
`;

export type ReactionAggregateType = {
  emoji: string;
  count: number;
  by: string[];
};

export type OnReactionPayload = {
  emoji: string;
  action: 'remove' | 'add';
  by: string;
};

type ReactionProps = {
  reactions: ReactionAggregateType[];
  onReaction: (payload: OnReactionPayload) => void;
};

export const Reactions = (props: ReactionProps) => {
  const { reactions = [], onReaction } = props;
  const [reacting, setReacting] = useState<boolean>(false);

  const checkDupe = (emoji: string) => {
    const index = reactions.findIndex((r) => r.emoji === emoji);
    if (index > -1) {
      const reaction = reactions[index];
      if (reaction.by.includes(window.ship)) {
        return true;
      }
    }
    return false;
  };

  const onClick = (emoji: string) => {
    setReacting(false);
    if (checkDupe(emoji)) {
      onReaction({ emoji, action: 'remove', by: window.ship });
    } else {
      onReaction({ emoji, action: 'add', by: window.ship });
    }
  };

  return (
    <ReactionRow
      onHoverEnd={() => {
        setReacting(false);
      }}
    >
      {reactions.map((reaction: ReactionAggregateType, index) => {
        return (
          <ReactionButton
            key={`${reaction.emoji}-${index}`}
            hasCount={reaction.count > 1}
            onClick={(evt) => {
              evt.stopPropagation();
              onClick(reaction.emoji);
            }}
          >
            <Emoji
              unified={reaction.emoji}
              emojiStyle={EmojiStyle.APPLE}
              size={16}
            />
            {reaction.count > 1 && (
              <Text.Hint fontSize={12}>{reaction.count}</Text.Hint>
            )}
          </ReactionButton>
        );
      })}
      <Flex className="bubble-reactions">
        <ReactionButton
          onClick={(evt: React.MouseEvent<HTMLDivElement>) => {
            evt.stopPropagation();
            setReacting(!reacting);
          }}
        >
          <Icon size={18} opacity={0.5} name="Plus" pointerEvents="none" />
        </ReactionButton>
        <AnimatePresence>
          {reacting && (
            <Flex position="absolute" zIndex={4}>
              <EmojiPicker
                emojiVersion="0.6"
                defaultSkinTone={SkinTones.NEUTRAL}
                onEmojiClick={(emojiData: EmojiClickData, evt: MouseEvent) => {
                  evt.stopPropagation();
                  onClick(emojiData.unified);
                }}
                autoFocusSearch={false}
              />
            </Flex>
          )}
        </AnimatePresence>
      </Flex>
    </ReactionRow>
  );
};
