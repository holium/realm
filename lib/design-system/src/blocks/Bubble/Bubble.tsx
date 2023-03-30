import { forwardRef, useCallback, useLayoutEffect, useMemo } from 'react';
import { Flex, Text, BoxProps, Box, convertDarkText, Icon } from '../..';
import { BubbleStyle, BubbleAuthor, BubbleFooter } from './Bubble.styles';
import { FragmentBlock, LineBreak, renderFragment } from './fragment-lib';
import { Reactions, OnReactionPayload } from './Reaction';
import {
  FragmentImageType,
  FragmentReactionType,
  FragmentStatusType,
  FragmentType,
  TEXT_TYPES,
} from './Bubble.types';
import { chatDate } from '../../util/date';
import { InlineStatus } from './InlineStatus';
import { BUBBLE_HEIGHT, STATUS_HEIGHT } from './Bubble.constants';

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
        return BUBBLE_HEIGHT.rem.footerReactions;
      }
      return BUBBLE_HEIGHT.rem.footer;
    }, [reactions.length]);

    const handleOnReaction = useCallback(
      (payload: OnReactionPayload) => {
        if (!onReaction) return;
        if (reactions.length === 0 && payload.action === 'add') {
          onMeasure();
        } else if (reactions.length === 1 && payload.action === 'remove') {
          onMeasure();
        }
        onReaction(payload);
      },
      [onReaction, reactions.length]
    );

    const fragments = useMemo(() => {
      if (!message) return [];
      return message?.map((fragment, index) => {
        let prevLineBreak, nextLineBreak;
        if (index > 0) {
          const previousType = Object.keys(message[index - 1])[0];
          if (previousType === 'image') {
            prevLineBreak = <LineBreak />;
          }
        }
        if (index < message.length - 1) {
          const nextType = Object.keys(message[index + 1])[0];
          if (nextType === 'image') {
            nextLineBreak = <LineBreak />;
          }
        }

        return (
          <span id={id} key={`${id}-index-${index}`}>
            {prevLineBreak}
            {renderFragment(id, fragment, index, author, innerWidth, onMeasure)}
            {nextLineBreak}
          </span>
        );
      });
    }, [message]);

    useLayoutEffect(() => {
      // only measure if all fragments are text
      let allTextTypes = true;
      let hasCalculatedImage = false;
      if (!message) return;
      message.forEach((fragment) => {
        const fragmentType = Object.keys(fragment)[0];
        if (!TEXT_TYPES.includes(fragmentType)) {
          allTextTypes = false;
        }
        if (
          fragmentType === 'image' &&
          (fragment as FragmentImageType).metadata?.height &&
          (fragment as FragmentImageType).metadata?.width
        ) {
          // if we have an image, we need to measure it
          hasCalculatedImage = true;
        }
      });
      if (allTextTypes) {
        onMeasure();
        return;
      }
      if (hasCalculatedImage) {
        onMeasure();
        return;
      }
    }, []);

    const minBubbleWidth = useMemo(() => (isEdited ? 164 : 114), [isEdited]);

    const reactionsDisplay = useMemo(() => {
      return (
        <Reactions
          id={`${id}-reactions`}
          isOur={isOur}
          ourShip={ourShip}
          ourColor={ourColor}
          reactions={reactions}
          onReaction={handleOnReaction}
        />
      );
    }, [reactions.length, isOur, ourShip, ourColor, handleOnReaction]);

    if (message?.length === 1) {
      const contentType = Object.keys(message[0])[0];
      if (contentType === 'status') {
        return (
          <Flex
            ref={ref}
            key={id}
            display="inline-flex"
            height={STATUS_HEIGHT}
            justifyContent={isOur ? 'flex-end' : 'flex-start'}
            onLoad={onMeasure}
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
            <Box width="70%">{reactionsDisplay}</Box>
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
