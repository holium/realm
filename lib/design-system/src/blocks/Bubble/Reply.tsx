import { useMemo } from 'react';
import styled from 'styled-components';

import { Box, BoxProps, Button, Flex, Icon, Text } from '../../../general';
import { flipColorIfLowContrast } from '../../../util';
import { capitalizeFirstLetter } from '../../util/strings';
import { convertFragmentsToPreview } from '../ChatInput/fragment-parser';
import { BubbleAuthor } from './Bubble.styles';
import { FragmentImageType, FragmentType, TEXT_TYPES } from './Bubble.types';
import {
  FragmentBlock,
  FragmentBlockquote,
  FragmentImage,
  FragmentPlain,
} from './renderFragment.styles';

const ReplyContainer = styled(Flex)`
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
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
  containerWidth?: number;
  themeMode?: 'light' | 'dark';
  onClick?: (evt: React.MouseEvent<HTMLButtonElement>) => void;
  onCancel?: () => void;
} & BoxProps;

export const Reply = (props: ReplyProps) => {
  const {
    id,
    author,
    authorColor,
    message,
    containerWidth,
    themeMode,
    onClick = () => {},
    onCancel,
  } = props;

  const authorColorDisplay = useMemo(
    () =>
      (authorColor && flipColorIfLowContrast(authorColor, themeMode)) ||
      'rgba(var(--rlm-text-rgba))',
    [authorColor]
  );
  if (!message) return null;
  const fragmentType: string = Object.keys(message[0])[0];
  let replyContent = (
    <FragmentPlain id={id}>
      {convertFragmentsToPreview(id, message)}
    </FragmentPlain>
  );
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
          className="fragment-image"
          src={link}
          style={{ display: 'block' }}
          // width={100}
          // height={100}
          draggable={false}
        />
      </Box>
    );
  }
  const additionalWidth = mediaContent ? 100 : 0;
  return (
    <ReplyContainer
      id={id}
      key={id}
      animate={{ opacity: 1, height: 46 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      width={containerWidth}
    >
      <FragmentBlock
        id={id}
        style={{
          display: 'inline-flex',
          flexDirection: 'row',
          alignItems: 'center',
          // width: containerWidth,
          gap: 8,
        }}
      >
        <FragmentBlockquote
          id={id}
          className="fragment-blockquote pinned-or-reply-message"
          style={{
            paddingRight: 6,
            borderRadius: 10,
            alignItems: 'center',
            borderLeft: `2px solid ${
              authorColorDisplay || 'rgba(var(--rlm-accent-rgba))'
            }`,
            width: containerWidth ? containerWidth - 16 : '100%',
          }}
        >
          <Icon name="Reply" size={22} iconColor={authorColorDisplay} />
          {mediaContent}
          <Flex
            flex={1}
            flexDirection="column"
            justifyContent="center"
            className="fragment-reply pinned"
            width={containerWidth ? containerWidth - 16 - 22 : '100%'}
          >
            <BubbleAuthor
              id={id}
              fontSize="0.8125rem"
              authorColor={authorColorDisplay}
            >
              {author}
            </BubbleAuthor>
            <Text.Custom
              truncate
              overflow="hidden"
              fontSize="0.8125rem"
              width={
                containerWidth ? containerWidth - 104 - additionalWidth : '100%'
              }
            >
              {replyContent}
            </Text.Custom>
          </Flex>
          {onCancel && (
            <Button.IconButton
              mr="4px"
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
