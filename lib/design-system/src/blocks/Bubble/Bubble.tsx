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
  containerWidth?: number;
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
      containerWidth,
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

    const innerWidth = useMemo(
      () => (containerWidth ? containerWidth - 16 : undefined),
      [containerWidth]
    );

    const footerHeight = useMemo(() => {
      if (reactions.length > 0) {
        return '1.7rem';
      }
      return '1.25rem';
    }, [reactions.length]);

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
          style={
            isOur
              ? {
                  background: ourColor,
                  boxShadow: isEditing
                    ? 'inset 0px 0px 0px 2px var(--rlm-intent-caution-color)'
                    : 'none',
                }
              : {}
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
              // TODO somehow pass in the onReplyClick function
              return (
                <span id={id} key={`${id}-index-${index}`}>
                  {renderFragment(
                    id,
                    fragment,
                    index,
                    author,
                    innerWidth,
                    onLoaded
                  )}
                </span>
              );
            })}
          </FragmentBlock>
          <BubbleFooter id={id} height={footerHeight}>
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
