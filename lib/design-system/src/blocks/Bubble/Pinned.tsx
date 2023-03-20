import { Flex, Box, BoxProps, capitalizeFirstLetter } from '../..';
import { BubbleAuthor } from './Bubble.styles';
import {
  FragmentBlock,
  FragmentPlain,
  FragmentBlockquote,
  renderFragment,
  FragmentImage,
} from './fragment-lib';
import { FragmentImageType, FragmentType, TEXT_TYPES } from './Bubble.types';
// import { chatDate } from '../../util/date';

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
      <FragmentBlock id={id}>
        <FragmentBlockquote
          className="pinned-message"
          id={id}
          style={{
            paddingTop: 4,
            paddingBottom: 4,
            paddingRight: 6,
            borderRadius: 4,
            marginLeft: 0,
            marginRight: 0,
            marginBottom: 0,
            height: 44,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderLeft: `2px solid ${authorColor || 'var(--rlm-accent-color)'}`,
            background: 'var(--rlm-overlay-hover)',
          }}
        >
          <Flex
            gap={0}
            flexDirection="column"
            className="fragment-reply pinned"
          >
            <BubbleAuthor id={id} authorColor={authorColor}>
              {author}
            </BubbleAuthor>
            {pinnedContent}
          </Flex>
          {mediaContent}
        </FragmentBlockquote>
      </FragmentBlock>
    </Flex>
  );
};
