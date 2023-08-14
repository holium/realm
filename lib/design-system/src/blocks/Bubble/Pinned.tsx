import styled from 'styled-components';

import { Box, BoxProps, Flex, Text } from '../../../general';
import { capitalizeFirstLetter } from '../../util/strings';
import { BubbleAuthor } from './Bubble.styles';
import { FragmentImageType, FragmentType, TEXT_TYPES } from './Bubble.types';
import { renderFragment } from './renderFragment';
import {
  FragmentBlock,
  FragmentBlockquote,
  FragmentImage,
  FragmentPlain,
} from './renderFragment.styles';

const FullWidthFragmentBlock = styled(FragmentBlock)`
  width: 100%;
`;

export type PinnedProps = {
  id: string;
  author: string;
  authorColor?: string;
  sentAt: string;
  message?: FragmentType[];
  onClick?: (msgId: string) => void;
} & BoxProps;

export const PinnedMessage = ({
  id,
  author,
  authorColor,
  message,
  onClick,
}: PinnedProps) => {
  if (!message) return null;
  const fragmentType: string = Object.keys(message[0])[0];
  let pinnedContent = null;
  let mediaContent = null;
  if (
    (!TEXT_TYPES.includes(fragmentType) &&
      fragmentType !== 'image' &&
      fragmentType !== 'reply') ||
    fragmentType === 'code'
  ) {
    pinnedContent = (
      <FragmentPlain mt={0} id={id}>
        {capitalizeFirstLetter(fragmentType)}
      </FragmentPlain>
    );
  } else if (fragmentType === 'image') {
    pinnedContent = (
      <FragmentPlain mt={0} id={id}>
        {capitalizeFirstLetter(fragmentType)}
      </FragmentPlain>
    );
    const link: string = (message[0] as FragmentImageType).image;
    mediaContent = (
      <Box>
        <FragmentImage
          id={'pin-image-preview'}
          className="fragment-image"
          src={link}
          style={{ display: 'block' }}
          draggable={false}
        />
      </Box>
    );
  } else {
    pinnedContent = renderFragment(id, message[0], 0, author, window.ship);
  }

  return (
    <Flex id={id} width="100%" style={{ cursor: 'pointer' }} onClick={onClick}>
      <FullWidthFragmentBlock id={id}>
        <FragmentBlockquote
          className="fragment-blockquote pinned-or-reply-message"
          id={id}
          style={{
            borderLeft: `2px solid ${
              authorColor || 'rgba(var(--rlm-accent-rgba))'
            }`,
            height: 42,
            width: '100%',
          }}
        >
          {mediaContent}
          <Flex
            gap={0}
            flexDirection="column"
            className="fragment-reply pinned"
            maxWidth="100%"
          >
            <BubbleAuthor id={id} authorColor={authorColor}>
              {author}
            </BubbleAuthor>
            <Text.Custom truncate overflow="hidden" maxWidth="100%">
              {pinnedContent}
            </Text.Custom>
          </Flex>
        </FragmentBlockquote>
      </FullWidthFragmentBlock>
    </Flex>
  );
};
