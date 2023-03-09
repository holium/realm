import { useState, useMemo, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { Flex, Box, Icon, Text, Menu } from '../..';
import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Emoji,
  SkinTones,
} from 'emoji-picker-react';
import { FragmentReactionType } from './Bubble.types';
import { lighten, darken } from 'polished';
import { getVar } from '../../util/colors';

const WIDTH = 300;
const HEIGHT = 350;
const defaultShip = window.ship ?? 'zod';

// const getAnchorPoint = (e: React.MouseEvent<HTMLDivElement>) => {
//   const menuWidth = WIDTH;
//   const menuHeight = HEIGHT;

//   const willGoOffScreenHorizontally = e.pageX + menuWidth > window.innerWidth;
//   const willGoOffScreenVertically = e.pageY + menuHeight > window.innerHeight;

//   const offset = 3;
//   const x = willGoOffScreenHorizontally ? 0 - menuWidth - offset : 0 + offset;
//   const y = willGoOffScreenVertically ? 0 - menuHeight - offset : 0 + offset;

//   return { x, y };
// };

const ReactionRow = styled(Box)<{ variant: 'overlay' | 'inline' }>`
  display: flex;
  position: relative;
  flex-direction: row;
  gap: 2px;
  z-index: 15;
  .emoji-picker-menu {
    &:hover {
      .bubble-reactions {
        transition: var(--transition);
        opacity: 1;
      }
    }
  }
  ${({ variant }) =>
    variant === 'overlay'
      ? css`
          position: absolute;
          left: -4px;
          bottom: -16px;
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
  isOur?: boolean;
  size?: keyof typeof ReactionSizes;
  ourColor?: string;
  selected?: boolean;
};

export const ReactionButton = styled(Box)<ReactionButtonProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background: ${({ selected }) =>
    selected ? () => lighten(0.3, getVar('accent')) : 'var(--rlm-input-color)'};

  border: ${({ selected }) =>
    selected
      ? '1px solid var(--rlm-accent-color)'
      : '1px solid var(--rlm-window-color)'};
  border-radius: 16px;
  transition: var(--transition);
  ${({ size, selected, ourColor }) =>
    size
      ? css`
          min-width: ${ReactionSizes[size]}px;
          height: ${ReactionSizes[size]}px;
          ${Text.Hint} {
            font-size: ${FontSizes[size]}px;
            ${selected && !ourColor && 'color: var(--rlm-accent-color);'}
            ${selected && ourColor && 'color: #FFF'}
          }
        `
      : css`
          min-width: 24px;
          height: 24px;
        `}

  ${({ isOur, ourColor, selected }) =>
    isOur &&
    ourColor &&
    css`
      background: ${darken(selected ? 0.25 : 0.1, ourColor)};
      border-color: ${darken(0.3, ourColor)};
      transition: var(--transition);
      &:hover {
        transition: var(--transition);
        background: ${darken(selected ? 0.35 : 0.125, ourColor)};
      }
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
  id?: string;
  isOur?: boolean;
  ourColor?: string;
  ourShip?: string;
  variant?: 'overlay' | 'inline';
  defaultIsOpen?: boolean;
  reactions: FragmentReactionType[];
  size?: keyof typeof ReactionSizes;
  onReaction: (payload: OnReactionPayload) => void;
};

export const Reactions = (props: ReactionProps) => {
  const {
    id = 'reaction-menu',
    variant = 'overlay',
    size = 'medium',
    isOur = false,
    ourShip = defaultShip,
    ourColor,
    defaultIsOpen = false,
    reactions = [],
    onReaction,
  } = props;
  const [isReacting, setIsReacting] = useState<boolean>(defaultIsOpen);

  const reactionsAggregated = useMemo(
    () =>
      Object.values<ReactionAggregateType>(
        reactions.reduce((acc, reaction) => {
          if (acc[reaction.emoji]) {
            acc[reaction.emoji].by.push(reaction.by);
            acc[reaction.emoji].count++;
          } else {
            acc[reaction.emoji] = {
              by: [reaction.by],
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
      if (reaction.by.includes(ourShip)) {
        return true;
      }
    }
    return false;
  };

  const onClick = (emoji: string) => {
    setIsReacting(false);
    if (checkDupe(emoji)) {
      onReaction({ emoji, action: 'remove', by: ourShip });
    } else {
      onReaction({ emoji, action: 'add', by: ourShip });
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
    <ReactionRow
      variant={variant}
      onClick={(evt) => {
        evt.stopPropagation();
      }}
    >
      {reactionsAggregated.map((reaction: ReactionAggregateType, index) => {
        return (
          <ReactionButton
            isOur={isOur}
            ourColor={ourColor}
            size={size}
            key={`${reaction.emoji}-${index}`}
            hasCount={reaction.count > 1}
            onClick={(evt) => {
              evt.stopPropagation();
              onClick(reaction.emoji);
            }}
            selected={reaction.by.includes(ourShip)}
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
      <Menu
        id={id}
        orientation="top-left"
        clickPreventClass="epr-category-nav"
        className="emoji-picker-menu"
        dimensions={{ width: WIDTH, height: HEIGHT }}
        offset={{ x: 2, y: 2 }}
        triggerEl={
          <ReactionButton
            isOur={isOur}
            ourColor={ourColor}
            size={size}
            className="bubble-reactions"
          >
            <Icon
              pointerEvents="none"
              size={18}
              opacity={0.5}
              name="Reaction"
            />
          </ReactionButton>
        }
      >
        <ReactionPickerStyle zIndex={20} transition={{ duration: 0.15 }}>
          <EmojiPicker
            emojiVersion="0.6"
            height={HEIGHT}
            width={WIDTH}
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
        </ReactionPickerStyle>
      </Menu>
    </ReactionRow>
  );
};

type ReactionPickerProps = {
  isReacting: boolean;
  anchorPoint: { x: number; y: number } | null;
  onClick: (emoji: string) => void;
};

export const ReactionPickerStyle = styled(Flex)`
  .EmojiPickerReact {
    --epr-category-label-height: 22px;
    --epr-category-navigation-button-size: 24px;
    --epr-emoji-size: 24px;
    --epr-search-input-height: 34px;
    font-size: 12px;
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
  .epr-category-nav > button.epr-cat-btn:focus:before {
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
  }
`;

export const ReactionPicker = ({
  isReacting,
  anchorPoint,
  onClick,
}: ReactionPickerProps) => {
  return (
    <ReactionPickerStyle
      id="emoji-picker"
      data-is-open={isReacting.toString()}
      position="absolute"
      zIndex={4}
      initial={{ x: anchorPoint?.x, y: anchorPoint?.y, opacity: 0 }}
      animate={{ x: anchorPoint?.x, y: anchorPoint?.y, opacity: 1 }}
      exit={{ x: anchorPoint?.x, y: anchorPoint?.y, opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <EmojiPicker
        emojiVersion="0.6"
        height={HEIGHT}
        width={WIDTH}
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
    </ReactionPickerStyle>
  );
};
