import { FC } from 'react';
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

type TemplateProps = {
  author: string;
  authorColor?: string;
  sentAt: string;
  our?: boolean;
  message?: FragmentType[];
  reactions?: FragmentReactionType[];
  onReaction: (payload: OnReactionPayload) => void;
  onReplyClick?: (msgId: string) => void;
} & BoxProps;

export const Bubble: FC<TemplateProps> = (props: TemplateProps) => {
  const {
    id,
    author,
    our,
    sentAt,
    authorColor,
    message,
    reactions = [],
    onReaction,
    // onReplyClick = () => {},
  } = props;

  const dateDisplay = chatDate(new Date(sentAt));

  return (
    <Flex
      key={id}
      display="inline-flex"
      justifyContent={our ? 'flex-end' : 'flex-start'}
    >
      <BubbleStyle id={id} className={our ? 'bubble-our' : ''}>
        {!our && (
          <BubbleAuthor authorColor={authorColor}>{author}</BubbleAuthor>
        )}
        <FragmentBlock>
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
              <>
                {lineBreak && <br />}
                {renderFragment(fragment, index, author)}
              </>
            );
          })}
        </FragmentBlock>
        <BubbleFooter>
          <Reactions reactions={reactions} onReaction={onReaction} />
          <Text.Custom pointerEvents="none" alignSelf="flex-end" opacity={0.5}>
            {dateDisplay}
          </Text.Custom>
        </BubbleFooter>
      </BubbleStyle>
    </Flex>
  );
};
