import { ReactNode, Ref } from 'react';

import { Box, Flex, Icon, Text } from '../../../general';
import { contrastAwareBlackOrWhiteHex } from '../../util/colors';
import { BubbleAuthor, BubbleFooter, BubbleStyle } from './Bubble.styles';

type Props = {
  id: string;
  isOur?: boolean;
  ourColor?: string;
  author: string;
  authorNickname?: string;
  authorColor?: string;
  isPrevGrouped?: boolean;
  isNextGrouped?: boolean;
  isEdited?: boolean;
  isEditing?: boolean;
  error?: string;
  expiresAt?: number | null;
  innerRef?: Ref<HTMLDivElement>;
  authorColorDisplay?: string;
  dateDisplay?: string;
  fragmentBlock: ReactNode;
  reactionsDisplay?: ReactNode;
  minBubbleWidth?: number;
  footerHeight: string;
};

// Used by holium.com.
export const BubbleSkeleton = ({
  id,
  isOur,
  ourColor,
  author,
  authorNickname,
  authorColor,
  isPrevGrouped,
  isNextGrouped,
  error,
  expiresAt,
  innerRef,
  authorColorDisplay,
  reactionsDisplay,
  dateDisplay,
  fragmentBlock,
  minBubbleWidth,
  footerHeight,
}: Props) => (
  <Flex
    ref={innerRef}
    key={id}
    display="inline-flex"
    justifyContent={isOur ? 'flex-end' : 'flex-start'}
  >
    <BubbleStyle
      id={id}
      isPrevGrouped={isPrevGrouped}
      isNextGrouped={isNextGrouped}
      ourTextColor={contrastAwareBlackOrWhiteHex(
        ourColor ?? '#ffffff',
        'white'
      )}
      style={
        isOur
          ? {
              background: ourColor,
            }
          : {}
      }
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
      {fragmentBlock}
      <BubbleFooter id={id} height={footerHeight} mt={1}>
        <Box width="70%" id={id}>
          {reactionsDisplay}
        </Box>
        <Flex
          width="30%"
          gap={4}
          id={id}
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
            style={{ whiteSpace: 'nowrap', userSelect: 'none' }}
            pointerEvents="none"
            textAlign="right"
            display="inline-flex"
            alignItems="flex-end"
            justifyContent="flex-end"
            opacity={0.35}
            id={id}
          >
            {dateDisplay}
          </Text.Custom>
        </Flex>
      </BubbleFooter>
    </BubbleStyle>
  </Flex>
);
