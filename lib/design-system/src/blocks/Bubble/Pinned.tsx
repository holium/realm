import styled from 'styled-components';
import { Text, Flex, Box, BoxProps, capitalizeFirstLetter } from '../../index';
import { BubbleAuthor } from './Bubble.styles';
import {
  FragmentBlock,
  FragmentPlain,
  FragmentBlockquote,
  renderFragment,
  FragmentImage,
} from './fragment-lib';
import { FragmentImageType, FragmentType, TEXT_TYPES } from './Bubble.types';

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

export const PinnedMessage = (props: PinnedProps) => {
  const { id, author, authorColor, message, onClick = () => {} } = props;

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
          src={link}
          style={{ display: 'block' }}
          draggable={false}
        />
      </Box>
    );
  } else {
    pinnedContent = renderFragment(id, message[0], 0, author);
  }

  return (
    <Flex id={id} key={id} width="100%" onClick={onClick}>
      <FullWidthFragmentBlock id={id}>
        <FragmentBlockquote
          className="pinned-or-reply-message"
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
