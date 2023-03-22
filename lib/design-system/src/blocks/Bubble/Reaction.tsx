import { useState, useMemo, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { Flex, Box, Icon, Text } from '../..';
import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Emoji,
  SkinTones,
} from 'emoji-picker-react';
import { FragmentReactionType } from './Bubble.types';
import { AnimatePresence } from 'framer-motion';
import { Position } from '@holium/shared';

const WIDTH = 350;
const ship = window.ship ?? 'zod';

const getAnchorPoint = (e: React.MouseEvent<HTMLDivElement>) => {
  const menuWidth = WIDTH;
  const menuHeight = 450;

  const willGoOffScreenHorizontally = e.pageX + menuWidth > window.innerWidth;
  const willGoOffScreenVertically = e.pageY + menuHeight > window.innerHeight;

  const offset = 3;
  const x = willGoOffScreenHorizontally ? 0 - menuWidth - offset : 0 + offset;
  const y = willGoOffScreenVertically ? 0 - menuHeight - offset : 0 + offset;

  return { x, y };
};

const ReactionRow = styled(Box)<{ variant: 'overlay' | 'inline' }>`
  display: flex;
  position: relative;
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
  background: ${({ selected }) =>
    selected ? 'rgba(var(--rlm-accent-rgba))' : 'rgba(var(--rlm-input-rgba))'};
  backdrop-filter: ${({ selected }) =>
    selected ? 'brightness(1.3)' : 'brightness(1)'};
  border: ${({ selected }) =>
    selected
      ? '1px solid rgba(var(--rlm-accent-rgba))'
      : '1px solid rgba(var(--rlm-window-rgba))'};

  border-radius: 16px;
  transition: var(--transition);
  ${({ size, selected }) =>
    size
      ? css`
          min-width: ${ReactionSizes[size]}px;
          height: ${ReactionSizes[size]}px;
          ${Text.Hint} {
            font-size: ${FontSizes[size]}px;
            ${selected && 'color: rgba(var(--rlm-accent-rgba));'}
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

  &:hover {
    transition: var(--transition);
    cursor: pointer;
    filter: brightness(0.96);
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
  const [isReacting, setIsReacting] = useState<boolean>(false);
  const [anchorPoint, setAnchorPoint] = useState<Position | null>(null);

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
      if (reaction.by.includes(ship)) {
        return true;
      }
    }
    return false;
  };

  const onClick = (emoji: string) => {
    setIsReacting(false);
    if (checkDupe(emoji)) {
      onReaction({ emoji, action: 'remove', by: ship });
    } else {
      onReaction({ emoji, action: 'add', by: ship });
    }
  };

  const root = document.getElementById('root');
  useEffect(() => {
    if (!root) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (isReacting) {
        const addButton = document.getElementById('reaction-add-button');
        const dropdownNode = document.getElementById('emoji-picker');
        const isVisible = dropdownNode
          ? dropdownNode.getAttribute('data-is-open') === 'true'
          : false; // get if the picker is visible currently

        if (
          addButton?.contains(event.target as Node) ||
          dropdownNode?.contains(event.target as Node) ||
          !isVisible
        ) {
          return;
        }
        // You are clicking outside
        if (isVisible) {
          setIsReacting(false);
        }
      }
    };
    root.addEventListener('mousedown', handleClickOutside);
    return () => {
      root.removeEventListener('mousedown', handleClickOutside);
    };
  }, [root, isReacting]);

  return (
    <ReactionRow variant={variant}>
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
            selected={reaction.by.includes(ship)}
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
          id="reaction-add-button"
          size={size}
          onClick={(evt: React.MouseEvent<HTMLDivElement>) => {
            evt.stopPropagation();
            const { x, y } = getAnchorPoint(evt);
            setAnchorPoint({ x, y });
            setIsReacting(!isReacting);
          }}
        >
          <Icon size={18} opacity={0.5} name="Plus" pointerEvents="none" />
        </ReactionButton>
        <AnimatePresence>
          {isReacting && anchorPoint && (
            <Flex
              id="emoji-picker"
              data-is-open={isReacting.toString()}
              position="absolute"
              zIndex={4}
              initial={{ x: anchorPoint?.x, y: anchorPoint.y, opacity: 0 }}
              animate={{ x: anchorPoint?.x, y: anchorPoint.y, opacity: 1 }}
              exit={{ x: anchorPoint?.x, y: anchorPoint.y, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <EmojiPicker
                emojiVersion="0.6"
                previewConfig={{
                  showPreview: false,
                }}
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
