import { forwardRef } from 'react';
import { Flex, Text, BoxProps } from '../..';
import styled from 'styled-components';
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

const LineBreak = styled.div`
  display: block;
  content: '';
  width: 100%;
  height: 0;
  margin: 0;
  padding: 0;
`;

export type BubbleProps = {
  ref: any;
  id: string;
  author: string;
  authorColor?: string;
  isEdited?: boolean;
  isEditing?: boolean;
  sentAt: string;
  isOur?: boolean;
  ourColor?: string;
  message?: FragmentType[];
  reactions?: FragmentReactionType[];
  onReaction?: (payload: OnReactionPayload) => void;
  onReplyClick?: (msgId: string) => void;
  onLoaded?: () => void;
} & BoxProps;

export const Bubble = forwardRef<HTMLDivElement, BubbleProps>(
  (props: BubbleProps, ref) => {
    const {
      id,
      author,
      isOur,
      ourColor,
      sentAt,
      authorColor,
      message,
      isEdited,
      isEditing,
      reactions = [],
      onLoaded,
      onReaction,
      // onReplyClick = () => {},
    } = props;

    const dateDisplay = chatDate(new Date(sentAt));

    return (
      <Flex
        ref={ref}
        key={id}
        display="inline-flex"
        mx="1px"
        // background={isEditing ? 'var(--rlm-overlay-hover)' : 'transparent'}
        justifyContent={isOur ? 'flex-end' : 'flex-start'}
      >
        <BubbleStyle
          id={id}
          style={isOur ? { background: ourColor } : {}}
          border={
            isEditing
              ? '2px solid var(--rlm-intent-caution-color)'
              : '2px solid transparent'
          }
          className={isOur ? 'bubble-our' : ''}
        >
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
                <span id={id} key={`${id}-index-${index}`}>
                  {lineBreak && <LineBreak />}
                  {renderFragment(id, fragment, index, author, onLoaded)}
                </span>
              );
            })}
          </FragmentBlock>
          <BubbleFooter id={id}>
            {onReaction && (
              <Reactions reactions={reactions} onReaction={onReaction} />
            )}
            <Text.Custom
              pointerEvents="none"
              alignSelf="flex-end"
              opacity={0.5}
            >
              {isEditing && 'Editing... · '}
              {isEdited && !isEditing && 'Edited · '}
              {dateDisplay}
            </Text.Custom>
          </BubbleFooter>
        </BubbleStyle>
      </Flex>
    );
  }
);
