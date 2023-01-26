import { FC, useMemo } from 'react';
import { Flex, Text, BoxProps } from '../..';
import { BubbleStyle, BubbleAuthor, BubbleFooter } from './Bubble.styles';
import { FragmentReactionType, FragmentType } from './Bubble.types';
import { FragmentBlock, renderFragment } from './fragment-lib';
import { chatDate } from '../../util/date';

import { Reactions, OnReactionPayload } from './Reaction';

type TemplateProps = {
  author: string;
  authorColor?: string;
  sentAt: string;
  our?: boolean;
  message?: FragmentType[];
  reactions?: FragmentReactionType[];
  onReaction: (payload: OnReactionPayload) => void;
} & BoxProps;

const BLOCK_TYPES = ['image', 'video', 'audio', 'link', 'blockquote', 'code'];
const TEXT_TYPES = [
  'plain',
  'bold',
  'italics',
  'bold-italics',
  'bold-strike',
  'bold-italics-strike',
  'inline-code',
  'ship',
];

export const Bubble: FC<TemplateProps> = (props: TemplateProps) => {
  const {
    id,
    author,
    our,
    sentAt,
    authorColor = '#000',
    message,
    reactions = [],
    onReaction,
  } = props;

  const dateDisplay = chatDate(new Date(sentAt));

  return (
    <Flex
      key={id}
      display="inline-flex"
      justifyContent={our ? 'flex-end' : 'flex-start'}
    >
      <BubbleStyle id={id} our={our}>
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
