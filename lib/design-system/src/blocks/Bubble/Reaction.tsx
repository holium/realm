import { useMemo, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import { Flex, Box, Icon, Text, Portal, Card } from '../../../general';
import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Emoji,
  SkinTones,
} from 'emoji-picker-react';
import { FragmentReactionType } from './Bubble.types';
import { opacifyHexColor } from '../../util/colors';
import { useMenu } from '../../navigation/Menu/useMenu';

export const DEFAULT_EMOJI_PICKER_WIDTH = 300;
export const DEFAULT_EMOJI_PICKER_HEIGHT = 350;
const defaultShip =
  typeof window !== 'undefined' ? (window as any)?.ship ?? 'zod' : 'zod';

const ReactionRow = styled(Box)<{ variant: 'overlay' | 'inline' }>`
  display: flex;
  position: relative;
  flex-direction: row;
  width: 100%;
  max-width: ${DEFAULT_EMOJI_PICKER_WIDTH}px;
  flex-wrap: wrap;
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
          left: 0px;
          bottom: -8px;
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
  color: rgba(var(--rlm-text-rgba));
  background: ${({ selected, ourColor }) =>
    selected
      ? ourColor
        ? opacifyHexColor(ourColor, 0.3)
        : 'gba(var(--rlm-accent-rgba))'
      : 'rgba(0, 0, 0, 0.08)'};
  box-shadow: ${({ selected }) =>
    selected
      ? 'inset 0px 0px 0px 1px rgba(0, 0, 0, 0.1)'
      : 'inset 0px 0px 0px 1px rgba(0, 0, 0, 0.15)'};

  /* TODO merged from master */
  /* background: ${({ selected }) =>
    selected ? 'rgba(var(--rlm-accent-rgba))' : 'rgba(var(--rlm-input-rgba))'};
  filter: ${({ selected }) => (selected ? 'brightness(1.3)' : 'brightness(1)')};
  border: ${({ selected }) =>
    selected
      ? '1px solid rgba(var(--rlm-accent-rgba))'
      : '1px solid rgba(var(--rlm-window-rgba))'}; */

  border-radius: 16px;
  transition: var(--transition);
  ${({ size, selected, isOur }) =>
    size
      ? css`
          min-width: ${ReactionSizes[size]}px;
          height: ${ReactionSizes[size]}px;
          ${Text.Hint} {
            font-size: ${FontSizes[size]}px;
            ${selected && !isOur && 'color: rgba(var(--rlm-text-rgba));'}
            ${selected && isOur && 'color: #FFF;'}
            /* ${selected && 'color: rgba(var(--rlm-accent-rgba));'} */
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
  ${({ hasCount, size }: ReactionButtonProps) =>
    hasCount &&
    size &&
    css`
      min-width: ${ReactionSizes[size]}px;
      transition: 0.01s ease-in-out;
      padding: 0 6px 0 4px;
      gap: 4px;
    `}

  &:hover {
    transition: var(--transition);
    cursor: pointer;
    filter: brightness(0.96);
  }
  ${({ isOur, ourColor, selected }) =>
    isOur &&
    ourColor &&
    css`
      background: ${ourColor};
      filter: brightness(0.9);
      border-color: rgba(var(--rlm-accent-rgba));
      transition: var(--transition);
      &:hover {
        transition: var(--transition);
        filter: brightness(0.875);
      }

        ${
          selected &&
          css`
            filter: brightness(0.8);
            &:hover {
              filter: brightness(0.775);
            }
          `
        }}
    `}
`;

export type ReactionAggregateType = {
  emoji: string;
  count: number;
  by: string[];
};

export type OnReactionPayload = {
  reactId?: string;
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
  reactions: FragmentReactionType[];
  size?: keyof typeof ReactionSizes;
  onReaction?: (payload: OnReactionPayload) => void;
};

export const Reactions = ({
  id = 'reaction-menu',
  variant = 'overlay',
  size = 'medium',
  isOur = false,
  ourShip = defaultShip,
  ourColor,
  reactions = [],
  onReaction,
}: ReactionProps) => {
  const reactIds = reactions.map((r) => r.msgId);
  const { isOpen, menuRef, position, toggleMenu, closeMenu } = useMenu(
    'top-left',
    { width: DEFAULT_EMOJI_PICKER_WIDTH, height: DEFAULT_EMOJI_PICKER_HEIGHT },
    { x: 0, y: 2 },
    [], // closeableIds
    [] // closeableClasses
  );
  const reactionsAggregated = useMemo(() => {
    if (reactions.length === 0) {
      return [];
    }
    return Object.values<ReactionAggregateType>(
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
    ).sort((a, b) => b.count - a.count);
  }, [reactIds, reactions.length]);

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

  const onClick = useCallback(
    (emoji: string) => {
      if (!onReaction) return;
      closeMenu();

      if (checkDupe(emoji)) {
        const reactToRemove = reactions.find(
          (r) => r.by === ourShip && r.emoji === emoji
        );
        if (!reactToRemove) return;
        onReaction({
          reactId: reactToRemove.msgId,
          emoji,
          action: 'remove',
          by: ourShip,
        });
      } else {
        onReaction({ emoji, action: 'add', by: ourShip });
      }
    },
    [reactionsAggregated, ourShip, onReaction]
  );

  // if we have reactions, and we're in overlay mode, switch to inline
  const variantAuto = useMemo(
    () =>
      reactions.length > 0 && variant === 'overlay' ? 'inline' : 'overlay',
    [reactions.length, variant]
  );

  const memoizedRow = useMemo(() => {
    return reactionsAggregated.map((reaction: ReactionAggregateType, index) => {
      const selected = reaction.by.includes(ourShip);
      return (
        <ReactionButton
          id={id}
          key={`${reaction.emoji}-by-${reaction.by}-${index}`}
          isOur={isOur}
          ourColor={ourColor}
          size={size}
          hasCount={reaction.count > 1}
          onClick={(evt) => {
            evt.stopPropagation();
            onClick(reaction.emoji);
          }}
          selected={selected}
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
    });
  }, [reactionsAggregated, isOur, ourColor, size, onClick, ourShip]);

  return (
    <ReactionRow
      id={id}
      style={{
        width: 'max-content',
      }}
      variant={variantAuto}
      onClick={(evt) => {
        evt.stopPropagation();
      }}
    >
      {memoizedRow}
      <AnimatedReactionPicker
        id={id}
        isOur={isOur}
        isOpen={isOpen}
        ourColor={ourColor}
        position={position}
        size={size}
        onClick={onClick}
        toggleMenu={toggleMenu}
        menuRef={menuRef}
      />
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
        height={DEFAULT_EMOJI_PICKER_HEIGHT}
        width={DEFAULT_EMOJI_PICKER_WIDTH}
        previewConfig={{
          showPreview: false,
        }}
        defaultSkinTone={SkinTones.NEUTRAL}
        onEmojiClick={(emojiData: EmojiClickData, evt: MouseEvent) => {
          evt.stopPropagation();
          // evt.preventDefault();
          onClick(emojiData.unified);
        }}
        autoFocusSearch={false}
      />
    </ReactionPickerStyle>
  );
};

type AnimatedReactionPickerProps = {
  onClick: (emoji: string) => void;
  toggleMenu: (evt: any) => void;
  id?: string;
  isOur?: boolean;
  isOpen?: boolean;
  ourColor?: string;
  position?: any;
  size?: keyof typeof ReactionSizes;
  menuRef?: any;
};

export const AnimatedReactionPicker = ({
  id = 'reaction-menu',
  size = 'medium',
  isOur = false,
  isOpen = false,
  position,
  ourColor,
  onClick,
  toggleMenu,
  menuRef,
}: AnimatedReactionPickerProps) => {
  return (
    <>
      <ReactionButton
        id={id}
        isOur={isOur}
        ourColor={ourColor}
        size={size}
        className="bubble-reactions"
        onClick={toggleMenu}
      >
        <Icon pointerEvents="none" size={18} opacity={0.5} name="Reaction" />
      </ReactionButton>
      <Portal>
        <AnimatePresence>
          {isOpen && position && (
            <Card
              ref={menuRef}
              p={0}
              elevation={2}
              position="absolute"
              id={id}
              zIndex={100}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
                transition: {
                  duration: 0.1,
                },
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.1,
                },
              }}
              gap={0}
              style={{
                y: position.y,
                x: position.x,
                border: 'none',
                width: DEFAULT_EMOJI_PICKER_WIDTH,
                height: DEFAULT_EMOJI_PICKER_HEIGHT,
                overflowY: 'hidden',
              }}
            >
              <ReactionPickerStyle
                zIndex={20}
                transition={{ duration: 0.15 }}
                onClick={(evt) => {
                  evt.stopPropagation();
                }}
              >
                <EmojiPicker
                  emojiVersion="0.6"
                  height={DEFAULT_EMOJI_PICKER_HEIGHT}
                  width={DEFAULT_EMOJI_PICKER_WIDTH}
                  lazyLoadEmojis
                  previewConfig={{
                    showPreview: false,
                  }}
                  defaultSkinTone={SkinTones.NEUTRAL}
                  onEmojiClick={(
                    emojiData: EmojiClickData,
                    evt: MouseEvent
                  ) => {
                    onClick(emojiData?.unified);
                    evt.stopPropagation();
                  }}
                  autoFocusSearch
                />
              </ReactionPickerStyle>
            </Card>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
};
