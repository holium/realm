import { useState } from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import { Flex, Box, Icon } from '../..';
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

const ReactionButton = styled(Box)`
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
  &:hover {
    transition: var(--transition);
    cursor: pointer;
    background: ${() => darken(0.05, getVar('input'))};
  }
`;

type ReactionProps = {
  reactions: any[];
  onReaction: (emoji: string) => void;
};

export const Reactions = (props: ReactionProps) => {
  const { reactions = [] } = props;
  const [reacting, setReacting] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiClickData | null>(
    null
  );

  function onClick(emojiData: EmojiClickData, event: MouseEvent) {
    console.log(emojiData);
    setSelectedEmoji(emojiData);
    setReacting(false);
  }
  let reactionRow = reactions;
  if (selectedEmoji) {
    reactionRow = [selectedEmoji];
  }
  return (
    <ReactionRow
      onHoverEnd={() => {
        setReacting(false);
      }}
    >
      {reactionRow.map((reaction, index) => {
        console.log(reaction);
        return (
          <ReactionButton
            key={`${reaction.emoji}-${index}`}
            onClick={(evt: React.MouseEvent<HTMLDivElement>) => {
              evt.stopPropagation();
              props.onReaction(reaction.emoji);
            }}
          >
            <Emoji
              unified={reaction.unified}
              emojiStyle={EmojiStyle.APPLE}
              size={16}
            />
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
        {reacting && (
          // <EmojiPicker onEmojiClick={onClick} autoFocusSearch={false} />
          <Flex position="absolute" zIndex={4}>
            <EmojiPicker
              skinTonesDisabled
              emojiVersion="0.6"
              defaultSkinTone={SkinTones.LIGHT}
              onEmojiClick={onClick}
              autoFocusSearch={false}
            />
          </Flex>
        )}
      </Flex>
    </ReactionRow>
  );
};
