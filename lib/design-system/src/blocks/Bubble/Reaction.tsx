import { useMemo } from 'react';

import { Icon } from '../../../general';
import { useMenu } from '../../navigation/Menu/useMenu';
import { FragmentReactionType } from './Bubble.types';
import {
  REACTION_HEIGHT,
  REACTION_WIDTH,
  ReactionSizes,
} from './Reaction.sizes';
import { ReactionButton, ReactionRow } from './Reaction.styles';
import { ReactionCount } from './ReactionCount';
import { ReactionEmojiPicker } from './ReactionEmojiPicker';

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
  const { isOpen, menuRef, position, toggleMenu, closeMenu } = useMenu(
    'top-left',
    { width: REACTION_WIDTH, height: REACTION_HEIGHT },
    { x: 0, y: 2 },
    [], // closeableIds
    [] // closeableClasses
  );

  const reactIds = reactions.map((r) => r.msgId);

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

  // if we have reactions, and we're in overlay mode, switch to inline
  const variantAuto =
    reactions.length > 0 && variant === 'overlay' ? 'inline' : 'overlay';

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

  const onClickEmoji = (emoji: string) => {
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
  };

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
          onClick={onClickEmoji}
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
        <ReactionEmojiPicker
          isOpen={isOpen}
          menuRef={menuRef}
          position={position}
          onClickEmoji={onClickEmoji}
        />
      </>
    </ReactionRow>
  );
};
