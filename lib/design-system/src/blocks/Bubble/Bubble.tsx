import { FC, useMemo } from 'react';
import { Flex, Text, BoxProps } from '../..';
import { BubbleStyle, BubbleAuthor, BubbleFooter } from './Bubble.styles';
import { FragmentReactionType, FragmentType } from './Bubble.types';
import { FragmentBlock, renderFragment } from './fragment-lib';
import {
  Reactions,
  ReactionAggregateType,
  OnReactionPayload,
} from './Reaction';

type TemplateProps = {
  author: string;
  authorColor?: string;
  our?: boolean;
  message?: FragmentType[];
  reactions?: FragmentReactionType[];
  onReaction: (payload: OnReactionPayload) => void;
} & BoxProps;

export const Bubble: FC<TemplateProps> = (props: TemplateProps) => {
  const {
    id,
    author,
    our,
    authorColor = '#000',
    message,
    reactions = [],
    onReaction,
  } = props;

  const reactionsAggregated = useMemo(
    () =>
      Object.values(
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
      ),
    [reactions]
  );

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
            if (index > 0) {
              const fragmentType = Object.keys(fragment)[0];
              lineBreak =
                fragmentType === 'image' ||
                fragmentType === 'video' ||
                fragmentType === 'audio' ||
                fragmentType === 'link'
                  ? true
                  : false;
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
          <Reactions reactions={reactionsAggregated} onReaction={onReaction} />
          <Text.Custom pointerEvents="none" alignSelf="flex-end" opacity={0.5}>
            6:07 AM
          </Text.Custom>
        </BubbleFooter>
      </BubbleStyle>
    </Flex>
  );
};
