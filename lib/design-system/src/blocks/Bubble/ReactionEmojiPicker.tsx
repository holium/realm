import EmojiPicker, { EmojiClickData, SkinTones } from 'emoji-picker-react';
import { AnimatePresence } from 'framer-motion';

import { Card, Portal } from '../../../general';
import { REACTION_HEIGHT, REACTION_WIDTH } from './Reaction.sizes';
import { ReactionEmojiPickerStyle } from './ReactionEmojiPicker.styles';

type Props = {
  isOpen: boolean;
  position: { x: number; y: number } | null;
  menuRef: React.RefObject<HTMLDivElement>;
  onClickEmoji: (emoji: string) => void;
};

export const ReactionEmojiPicker = ({
  isOpen,
  position,
  menuRef,
  onClickEmoji,
}: Props) => {
  if (!isOpen || !position) return null;

  return (
    <Portal>
      <AnimatePresence>
        <Card
          ref={menuRef}
          p={0}
          elevation={2}
          position="absolute"
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
          onClick={(evt) => {
            evt.stopPropagation();
          }}
        >
          <ReactionEmojiPickerStyle
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
              onEmojiClick={(emojiData: EmojiClickData, evt: MouseEvent) => {
                evt.stopPropagation();
                onClickEmoji(emojiData.unified);
              }}
              autoFocusSearch
            />
          </ReactionEmojiPickerStyle>
        </Card>
      </AnimatePresence>
    </Portal>
  );
};
