import { forwardRef, useLayoutEffect, useMemo } from 'react';
import { Flex, Text, BoxProps, Box, convertDarkText, Icon } from '../..';
import { BubbleStyle, BubbleAuthor, BubbleFooter } from './Bubble.styles';
import { FragmentBlock, LineBreak, renderFragment } from './fragment-lib';
import { Reactions, OnReactionPayload } from './Reaction';
import {
  FragmentReactionType,
  FragmentStatusType,
  FragmentType,
  TEXT_TYPES,
} from './Bubble.types';
import { chatDate } from '../../util/date';
import { InlineStatus } from './InlineStatus';

export type BubbleProps = {
  ref: any;
  id: string;
  author: string;
  authorColor?: string;
  authorNickname?: string;
  isEdited?: boolean;
  isEditing?: boolean;
  expiresAt?: number | null;
  sentAt: string;
  isOur?: boolean;
  ourShip?: string;
  ourColor?: string;
  message?: FragmentType[];
  reactions?: FragmentReactionType[];
  containerWidth?: number;
  isPrevGrouped?: boolean; // should we show the author if multiple messages by same author?
  isNextGrouped?: boolean; // should we show the author if multiple messages by same author?
  onReaction?: (payload: OnReactionPayload) => void;
  onReplyClick?: (msgId: string) => void;
  onMeasure: () => void;
} & BoxProps;

export const Bubble = forwardRef<HTMLDivElement, BubbleProps>(
  (props: BubbleProps, ref) => {
    const {
      id,
      author,
      authorNickname,
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
      isPrevGrouped,
      isNextGrouped,
      expiresAt,
      onMeasure,
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

    const fragments = useMemo(() => {
      if (!message) return [];
      return message?.map((fragment, index) => {
        // if the previous fragment was a link or a code block, we need to add a space
        // to the beginning of this fragment
        let lineBreak;
        if (index > 0) {
          const previousType = Object.keys(message[index - 1])[0];
          if (
            // previousType === 'link' ||
            // previousType === 'code' ||
            previousType === 'image'
          ) {
            lineBreak = <LineBreak />;
          }
        }

        return (
          <span id={id} key={`${id}-index-${index}`}>
            {lineBreak}
            {renderFragment(id, fragment, index, author, innerWidth, onMeasure)}
          </span>
        );
      });
    }, [message]);

    useLayoutEffect(() => {
      // only measure if all fragments are text
      let allTextTypes = true;
      if (!message) return;
      message.forEach((fragment) => {
        const fragmentType = Object.keys(fragment)[0];
        if (!TEXT_TYPES.includes(fragmentType)) {
          allTextTypes = false;
        }
      });
      if (allTextTypes) {
        onMeasure();
      }
    }, []);

    const minBubbleWidth = useMemo(() => (isEdited ? 164 : 114), [isEdited]);

    if (message?.length === 1) {
      const contentType = Object.keys(message[0])[0];
      if (contentType === 'status') {
        return (
          <Flex
            ref={ref}
            key={id}
            display="inline-flex"
            mx="1px"
            justifyContent={isOur ? 'flex-end' : 'flex-start'}
          >
            <InlineStatus text={(message[0] as FragmentStatusType).status} />
          </Flex>
        );
      }
    }
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
          isPrevGrouped={isPrevGrouped}
          isNextGrouped={isNextGrouped}
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
          {!isOur && !isPrevGrouped && (
            <BubbleAuthor
              style={{
                color: authorColorDisplay,
              }}
              authorColor={authorColor}
            >
              {authorNickname || author}
            </BubbleAuthor>
          )}
          <FragmentBlock id={id}>{fragments}</FragmentBlock>
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
            <Flex
              width="30%"
              gap={4}
              alignItems="flex-end"
              justifyContent="flex-end"
              minWidth={minBubbleWidth}
              flexBasis={minBubbleWidth}
            >
              {expiresAt && (
                // TODO tooltip with time remaining
                <Icon
                  mb="1px"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.35 }}
                  transition={{ opacity: 0.2 }}
                  name="ClockSlash"
                  size={12}
                />
              )}
              <Text.Custom
                style={{ whiteSpace: 'nowrap', userSelect: 'none' }}
                pointerEvents="none"
                textAlign="right"
                display="inline-flex"
                alignItems="flex-end"
                justifyContent="flex-end"
                opacity={0.35}
              >
                {isEditing && 'Editing... · '}
                {isEdited && !isEditing && 'Edited · '}
                {dateDisplay}
              </Text.Custom>
            </Flex>
          </BubbleFooter>
        </BubbleStyle>
      </Flex>
    );
  }
);
