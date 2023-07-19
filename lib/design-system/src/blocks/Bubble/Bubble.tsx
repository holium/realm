import { Ref, useEffect, useMemo, useState } from 'react';

import { Box, BoxProps, Flex, Icon, Text } from '../../../general';
import {
  contrastAwareBlackOrWhiteHex,
  flipColorIfLowContrast,
} from '../../../util';
import { chatDate } from '../../util/date';
import { BUBBLE_HEIGHT, STATUS_HEIGHT } from './Bubble.constants';
import { BubbleAuthor, BubbleFooter, BubbleStyle } from './Bubble.styles';
import {
  FragmentReactionType,
  FragmentStatusType,
  FragmentType,
} from './Bubble.types';
import { InlineStatus } from './InlineStatus';
import { OnReactionPayload, Reactions } from './Reaction';
import { renderFragment } from './renderFragment';
import { FragmentBlock, LineBreak } from './renderFragment.styles';

export type BubbleProps = {
  id: string;
  author: string;
  authorColor?: string;
  themeMode?: 'dark' | 'light';
  authorNickname?: string;
  isEdited?: boolean;
  isEditing?: boolean;
  isDeleting?: boolean;
  expiresAt?: number | null;
  updatedAt?: number | null;
  sentAt: string;
  isOur?: boolean;
  ourShip?: string;
  ourColor?: string;
  message?: FragmentType[];
  reactions?: FragmentReactionType[];
  isPrevGrouped?: boolean; // should we show the author if multiple messages by same author?
  isNextGrouped?: boolean; // should we show the author if multiple messages by same author?
  innerRef?: Ref<HTMLDivElement>;
  onReaction?: (payload: OnReactionPayload) => void;
  onReplyClick?: (msgId: string) => void;
  onJoinSpaceClick?: (spacePath: string) => void;
  allSpacePaths?: string[];
  error?: string;
  forwardedFrom?: string;
} & BoxProps;

export const Bubble = ({
  innerRef,
  id,
  author,
  authorNickname,
  themeMode,
  isOur,
  ourColor,
  ourShip,
  sentAt,
  authorColor,
  message,
  isEdited,
  isEditing,
  isDeleting,
  reactions = [],
  isPrevGrouped,
  isNextGrouped,
  updatedAt,
  expiresAt,
  onReaction,
  onReplyClick,
  onJoinSpaceClick,
  allSpacePaths,
  error,
  forwardedFrom,
}: BubbleProps) => {
  const [dateDisplay, setDateDisplay] = useState(chatDate(new Date(sentAt)));
  useEffect(() => {
    let timer: NodeJS.Timeout;
    function initClock() {
      clearTimeout(timer);
      const sentDate = new Date(sentAt);
      const interval: number = (60 - sentDate.getSeconds()) * 1000 + 5;
      setDateDisplay(chatDate(sentDate));
      timer = setTimeout(initClock, interval);
    }
    initClock();
    return () => {
      clearTimeout(timer);
    };
  }, [sentAt]);

  const authorColorDisplay = useMemo(
    () =>
      (authorColor && flipColorIfLowContrast(authorColor, themeMode)) ||
      'rgba(var(--rlm-text-rgba))',
    [authorColor]
  );

  const footerHeight = useMemo(() => {
    if (reactions.length > 0) {
      return BUBBLE_HEIGHT.rem.footerReactions;
    }
    return BUBBLE_HEIGHT.rem.footer;
  }, [reactions.length]);

  const fragments = useMemo(() => {
    if (!message) return [];
    return message?.map((fragment, index) => {
      let prevLineBreak, nextLineBreak;
      if (index > 0) {
        if (message[index - 1]) {
          const previousType = Object.keys(message[index - 1])[0];
          if (previousType === 'image') {
            prevLineBreak = <LineBreak />;
          }
        } else {
          console.warn(
            'expected a non-null message at ',
            index - 1,
            message[index - 1]
          );
        }
      }
      if (index < message.length - 1) {
        if (message[index + 1]) {
          const nextType = Object.keys(message[index + 1])[0];
          if (nextType === 'image') {
            nextLineBreak = <LineBreak />;
          }
        } else {
          console.warn(
            'expected a non-null message at ',
            index + 1,
            message[index + 1]
          );
        }
      }

      const key = `${id}-${index}-fragments`;

      return (
        <span id={key} key={key} className="bubble-fragment">
          {prevLineBreak}
          {renderFragment(
            id,
            fragment,
            index,
            author,
            onReplyClick,
            onJoinSpaceClick,
            allSpacePaths
          )}
          {nextLineBreak}
        </span>
      );
    });
  }, [message, updatedAt]);

  const minBubbleWidth = useMemo(() => (isEdited ? 164 : 114), [isEdited]);

  if (message?.length === 1) {
    const contentType = Object.keys(message[0])[0];

    if (contentType === 'status') {
      return (
        <Flex
          key={`${id}-${contentType}-inline-status-container`}
          ref={innerRef}
          display="inline-flex"
          height={STATUS_HEIGHT}
          justifyContent={isOur ? 'flex-end' : 'flex-start'}
        >
          <InlineStatus
            id={`${id}-${contentType}-inline-status`}
            text={(message[0] as FragmentStatusType).status}
          />
        </Flex>
      );
    }
  }

  return (
    <Flex
      ref={innerRef}
      key={`${id}-${fragments.join('-')}`}
      id={id}
      display="inline-flex"
      justifyContent={isOur ? 'flex-end' : 'flex-start'}
      position="relative"
    >
      <BubbleStyle
        id={id}
        isPrevGrouped={isPrevGrouped}
        isNextGrouped={isNextGrouped}
        ourTextColor={contrastAwareBlackOrWhiteHex(
          ourColor ?? '#ffffff',
          'white'
        )}
        style={{
          opacity: isDeleting ? 0.5 : 1,
          ...(isOur && {
            background: ourColor,
            boxShadow: isEditing
              ? 'inset 0px 0px 0px 2px rgba(var(--rlm-intent-caution-rgba))'
              : 'none',
          }),
        }}
        className={isOur ? 'bubble-our' : ''}
      >
        {!isOur && !isPrevGrouped && (
          <BubbleAuthor
            id={id}
            style={{
              color: authorColorDisplay,
            }}
            authorColor={authorColor}
          >
            {authorNickname || author}
          </BubbleAuthor>
        )}
        {forwardedFrom && (
          <Text.Custom
            style={{ color: 'rgba(var(--rlm-icon-rgba), 0.60)', fontSize: 11 }}
            id={id}
          >
            Forwarded from: {forwardedFrom}
          </Text.Custom>
        )}
        <FragmentBlock id={id}>{fragments}</FragmentBlock>
        <BubbleFooter height={footerHeight} mt={1}>
          <Box width="70%">
            {((reactions && reactions.length > 0) || onReaction) && (
              <Reactions
                isOur={isOur}
                ourShip={ourShip}
                ourColor={ourColor}
                reactions={reactions}
                onReaction={onReaction}
              />
            )}
          </Box>
          <Flex
            id={id}
            width="30%"
            gap={4}
            alignItems="flex-end"
            justifyContent="flex-end"
            minWidth={minBubbleWidth}
            flexBasis={minBubbleWidth}
          >
            {error && (
              <Text.Custom
                style={{ whiteSpace: 'nowrap', userSelect: 'none' }}
                pointerEvents="none"
                textAlign="right"
                display="inline-flex"
                alignItems="flex-end"
                justifyContent="flex-end"
                opacity={0.35}
                id={id}
              >
                {error}
              </Text.Custom>
            )}
            {expiresAt && (
              // TODO tooltip with time remaining
              <Icon
                mb="1px"
                id={id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                transition={{ opacity: 0.2 }}
                name="ClockSlash"
                size={12}
              />
            )}
            <Text.Custom
              id={id}
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
};
