import { useState, useMemo } from 'react';
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
import { FragmentReactionType } from './Bubble.types';

const ReactionRow = styled(Box)<{ variant: 'overlay' | 'inline' }>`
  display: flex;
  flex-direction: row;
  gap: 4px;
  ${({ variant }) =>
    variant === 'overlay'
      ? css`
          position: absolute;
          left: -4px;
          bottom: -14px;
        `
      : css`
          flex-direction: row;
        `}
`;

const ReactionSizes: { [key: string]: number } = {
  small: 16,
  medium: 24,
  large: 28,
};

const EmojiSizes: { [key: string]: number } = {
  small: 10,
  medium: 16,
  large: 18,
};

const FontSizes: { [key: string]: number } = {
  small: 12,
  medium: 12,
  large: 14,
};

type ReactionButtonProps = {
  hasCount?: boolean;
  size?: keyof typeof ReactionSizes;
  selected?: boolean;
};

const ReactionButton = styled(Box)<ReactionButtonProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background: var(--rlm-input-color);
  ${({ selected }) =>
    selected
      ? css`
          border: 1px solid #efbb92;
          background: #fff6ef;
        `
      : 'border: 1px solid var(--rlm-border-color);'}
  border-radius: 16px;
  transition: var(--transition);
  ${({ size, selected }) =>
    size
      ? css`
          min-width: ${ReactionSizes[size]}px;
          height: ${ReactionSizes[size]}px;
          ${Text.Hint} {
            font-size: ${FontSizes[size]}px;
            ${selected && 'color: #e47a27;'}
          }
        `
      : css`
          min-width: 24px;
          height: 24px;
        `}
  width: auto;
  img {
    user-select: none;
    pointer-events: none;
  }
  div {
    user-select: none;
    pointer-events: none;
  }
  ${({ hasCount }: ReactionButtonProps) =>
    hasCount &&
    css`
      padding: 0 6px 0 4px;
      gap: 4px;
    `}
  ${({ selected }: ReactionButtonProps) =>
    selected
      ? css`
          &:hover {
            transition: var(--transition);
            cursor: pointer;
            background: ${() => darken(0.05, '#fff6ef')};
          }
        `
      : css`
          &:hover {
            transition: var(--transition);
            cursor: pointer;
            background: ${() => darken(0.05, getVar('input'))};
          }
        `}
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
  variant?: 'overlay' | 'inline';
  reactions: FragmentReactionType[];
  size?: keyof typeof ReactionSizes;
  onReaction: (payload: OnReactionPayload) => void;
};

export const Reactions = (props: ReactionProps) => {
  const {
    variant = 'overlay',
    size = 'medium',
    reactions = [],
    onReaction,
  } = props;
  const [reacting, setReacting] = useState<boolean>(false);

  const reactionsAggregated = useMemo(
    () =>
      Object.values<ReactionAggregateType>(
        reactions.reduce((acc, reaction) => {
          if (acc[reaction.emoji]) {
            acc[reaction.emoji].by.push(reaction.author);
            acc[reaction.emoji].count++;
          } else {
            acc[reaction.emoji] = {
              by: [reaction.author],
              emoji: reaction.emoji,
              count: 1,
            };
          }
          return acc;
        }, {} as Record<string, ReactionAggregateType>)
      ).sort((a, b) => b.count - a.count),
    [reactions.length]
  );

  const checkDupe = (emoji: string) => {
    const index = reactionsAggregated.findIndex((r) => r.emoji === emoji);
    if (index > -1) {
      const reaction = reactionsAggregated[index];
      if (reaction.by.includes(window.ship as any)) {
        return true;
      }
    }
    return false;
  };

  const onClick = (emoji: string) => {
    setReacting(false);
    if (checkDupe(emoji)) {
      onReaction({ emoji, action: 'remove', by: window.ship as any });
    } else {
      onReaction({ emoji, action: 'add', by: window.ship as any });
    }
  };

  return (
    <ReactionRow
      variant={variant}
      onHoverEnd={() => {
        setReacting(false);
      }}
    >
      {reactionsAggregated.map((reaction: ReactionAggregateType, index) => {
        return (
          <ReactionButton
            size={size}
            key={`${reaction.emoji}-${index}`}
            hasCount={reaction.count > 1}
            onClick={(evt) => {
              evt.stopPropagation();
              onClick(reaction.emoji);
            }}
            selected={reaction.by.includes(window.ship)}
          >
            <Emoji
              unified={reaction.emoji}
              emojiStyle={EmojiStyle.APPLE}
              size={EmojiSizes[size]}
            />
            {reaction.count > 1 && <Text.Hint>{reaction.count}</Text.Hint>}
          </ReactionButton>
        );
      })}
      <Flex className="bubble-reactions">
        <ReactionButton
          size={size}
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
                // zIndex={4}
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
