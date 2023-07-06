import { RefObject, useMemo } from 'react';

import { Icon } from '../../../general';
import { ReactionButton } from './Reaction.styles';
import { ReactionEmojiPicker } from './ReactionEmojiPicker';

type Props = {
  id: string;
  isOur: boolean;
  ourColor: string | undefined;
  size: string;
  isOpen: boolean;
  menuRef: RefObject<HTMLDivElement>;
  position: { x: number; y: number };
  toggleMenu: (event: React.MouseEvent<HTMLElement>) => void;
  onClickEmoji: (emoji: string) => void;
};

export const ReactionRow = ({
  id,
  isOur,
  ourColor,
  size,
  isOpen,
  menuRef,
  position,
  toggleMenu,
  onClickEmoji,
}: Props) => {
  return useMemo(
    () => (
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
    ),
    [id, isOur, ourColor, size, menuRef, isOpen, position]
  );
};
