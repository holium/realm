import { useCallback, useMemo } from 'react';
import EmojiPicker, { EmojiClickData, SkinTones } from 'emoji-picker-react';
import { AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

import { Card, Flex, Icon, Portal } from '../../../general';
import { useMenu } from '../../navigation/Menu/useMenu';
import { FragmentReactionType } from './Bubble.types';
import {
  REACTION_HEIGHT,
  REACTION_WIDTH,
  ReactionSizes,
} from './Reaction.sizes';
import { ReactionButton, ReactionRow } from './Reaction.styles';
import { ReactionCount } from './ReactionCount';

const defaultShip =
  typeof window !== 'undefined' ? (window as any)?.ship ?? 'zod' : 'zod';

type ReactionAggregateType = {
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
    { width: REACTION_WIDTH, height: REACTION_HEIGHT },
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
      {reactionsAggregated.map((reaction: ReactionAggregateType) => (
        <ReactionCount
          id={id}
          key={reaction.count}
          reaction={reaction}
          isOur={isOur}
          isSelected={reaction.by.includes(ourShip)}
          ourColor={ourColor}
          size={size}
          onClick={onClick}
        />
      ))}
      <>
        <ReactionButton
          id={id}
          isOur={isOur}
          ourColor={ourColor}
          size={size}
          className="bubble-reactions"
          onClick={(evt) => {
            toggleMenu(evt);
          }}
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
                  width: REACTION_WIDTH,
                  height: REACTION_HEIGHT,
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
                    width={REACTION_WIDTH}
                    height={REACTION_HEIGHT}
                    lazyLoadEmojis
                    previewConfig={{
                      showPreview: false,
                    }}
                    defaultSkinTone={SkinTones.NEUTRAL}
                    onEmojiClick={(
                      emojiData: EmojiClickData,
                      evt: MouseEvent
                    ) => {
                      onClick(emojiData.unified);
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
        width={REACTION_WIDTH}
        height={REACTION_HEIGHT}
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
