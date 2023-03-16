import { forwardRef, useMemo } from 'react';
import { Flex, Text, BoxProps, Box, convertDarkText } from '../..';
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
  ourShip?: string;
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
      ourShip,
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
    const authorColorDisplay = useMemo(
      () =>
        (authorColor && convertDarkText(authorColor)) ||
        'var(--rlm-text-color)',
      [authorColor]
    );

    return (
      <Flex
        ref={ref}
        key={id}
        display="inline-flex"
        mx="1px"
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
            <BubbleAuthor
              style={{
                color: authorColorDisplay,
              }}
              authorColor={authorColor}
            >
              {author}
            </BubbleAuthor>
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
            <Box width="70%">
              {onReaction && (
                <Reactions
                  id={`${id}-reactions`}
                  isOur={isOur}
                  ourShip={ourShip}
                  ourColor={ourColor}
                  reactions={reactions}
                  onReaction={onReaction}
                />
              )}
            </Box>
            <Text.Custom
              width="30%"
              style={{ whiteSpace: 'nowrap' }}
              pointerEvents="none"
              textAlign="right"
              display="inline-flex"
              alignItems="flex-end"
              justifyContent="flex-end"
              minWidth="114px"
              flexBasis="114px"
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
