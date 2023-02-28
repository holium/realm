import { Flex, Text, BoxProps } from '../..';
import { BubbleStyle, BubbleAuthor, BubbleFooter } from './Bubble.styles';
import { FragmentBlock, renderFragment } from './fragment-lib';
import { Reactions, OnReactionPayload } from './Reaction';
import {
  FragmentReactionType,
  FragmentType,
  TEXT_TYPES,
  BLOCK_TYPES,
} from './Bubble.types';
import { chatDate } from '../../util/date';

export type BubbleProps = {
  author: string;
  authorColor?: string;
  sentAt: string;
  isOur?: boolean;
  message?: FragmentType[];
  reactions?: FragmentReactionType[];
  onReaction?: (payload: OnReactionPayload) => void;
  onReplyClick?: (msgId: string) => void;
  onLoaded?: () => void;
} & BoxProps;

export const Bubble = (props: BubbleProps) => {
  const {
    id,
    author,
    isOur,
    sentAt,
    authorColor,
    message,
    reactions = [],
    onLoaded,
    onReaction,
    // onReplyClick = () => {},
  } = props;

  const dateDisplay = chatDate(new Date(sentAt));

  return (
    <Flex
      key={id}
      display="inline-flex"
      mx="1px"
      justifyContent={isOur ? 'flex-end' : 'flex-start'}
    >
      <BubbleStyle id={id} className={isOur ? 'bubble-our' : ''}>
        {!isOur && (
          <BubbleAuthor authorColor={authorColor}>{author}</BubbleAuthor>
        )}
        <FragmentBlock id={id}>
          {message?.map((fragment, index) => {
            let lineBreak = false;
            // Detect line break between text and block
            if (index > 0) {
              const lastFragmentType = Object.keys(message[index - 1])[0];
              const currentFragmentType = Object.keys(fragment)[0];
              if (
                TEXT_TYPES.includes(lastFragmentType) &&
                BLOCK_TYPES.includes(currentFragmentType)
              ) {
                lineBreak = true;
              }
            }

            // TODO somehow pass in the onReplyClick function

            return (
              <span key={`${id}-index-${index}`}>
                {lineBreak && <br />}
                {renderFragment(fragment, index, author, onLoaded)}
              </span>
            );
          })}
        </FragmentBlock>
        <BubbleFooter id={id}>
          {onReaction && (
            <Reactions reactions={reactions} onReaction={onReaction} />
          )}
          <Text.Custom pointerEvents="none" alignSelf="flex-end" opacity={0.5}>
            {dateDisplay}
          </Text.Custom>
        </BubbleFooter>
      </BubbleStyle>
    </Flex>
  );
};
