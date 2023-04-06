import styled from 'styled-components';
import { Text, Flex, Box, BoxProps, Button, Icon } from '../../general';
import { capitalizeFirstLetter } from '../../util/strings';
import { BubbleAuthor } from './Bubble.styles';
import {
  FragmentBlock,
  FragmentPlain,
  FragmentBlockquote,
  renderFragment,
  FragmentImage,
} from './fragment-lib';
import { FragmentType, FragmentImageType, TEXT_TYPES } from './Bubble.types';

const ReplyContainer = styled(Flex)`
  flex-direction: column;
  justify-content: flex-end;
  blockquote {
    margin: 0px 0px;
  }
  width: 100%;
`;

export type ReplyProps = {
  id: string;
  author: string;
  authorColor?: string;
  sentAt: string;
  message?: FragmentType[];
  onClick?: (evt: React.MouseEvent<HTMLButtonElement>) => void;
  onCancel?: () => void;
} & BoxProps;

export const Reply = (props: ReplyProps) => {
  const {
    id,
    author,
    authorColor,
    message,
    onClick = () => {},
    onCancel,
  } = props;

  if (!message) return null;
  const fragmentType: string = Object.keys(message[0])[0];
  let replyContent = null;
  let mediaContent = null;
  if (
    (!TEXT_TYPES.includes(fragmentType) &&
      fragmentType !== 'image' &&
      fragmentType !== 'reply') ||
    fragmentType === 'code'
  ) {
    replyContent = (
      <FragmentPlain id={id}>
        {capitalizeFirstLetter(fragmentType)}
      </FragmentPlain>
    );
  } else if (fragmentType === 'image') {
    replyContent = (
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
    replyContent = renderFragment(id, message[0], 0, author);
  }
  return (
    <ReplyContainer
      id={id}
      key={id}
      initial={{ opacity: 0, height: 25 }}
      animate={{ opacity: 1, height: 46 }}
      exit={{ opacity: 0, height: 25 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      <FragmentBlock
        id={id}
        style={{
          display: 'inline-flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          gap: 8,
        }}
      >
        <Icon name="Reply" size={22} color="accent" />
        <FragmentBlockquote
          id={id}
          className="pinned-or-reply-message"
          style={{
            paddingRight: 6,
            borderLeft: `2px solid ${
              authorColor || 'rgba(var(--rlm-accent-rgba))'
            }`,
            width: 'calc(100% - 60px)',
          }}
        >
          {mediaContent}
          <Flex
            flex={1}
            flexDirection="column"
            className="fragment-reply pinned"
            maxWidth="100%"
          >
            <BubbleAuthor id={id} authorColor={authorColor}>
              {author}
            </BubbleAuthor>
            <Text.Custom truncate overflow="hidden" maxWidth="100%">
              {replyContent}
            </Text.Custom>
          </Flex>
          {onCancel && (
            <Button.IconButton
              onClick={(evt: React.MouseEvent<HTMLButtonElement>) => {
                evt.stopPropagation();
                onCancel();
              }}
            >
              <Icon name="Close" size={20} opacity={0.5} />
            </Button.IconButton>
          )}
        </FragmentBlockquote>
      </FragmentBlock>
    </ReplyContainer>
  );
};
