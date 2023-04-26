import { motion } from 'framer-motion';
import styled from 'styled-components';

import {
  Flex,
  FlexProps,
  skeletonStyle,
  Text,
  TextProps,
} from '../../../general';
import { ImageBlock } from '../../blocks/ImageBlock/ImageBlock';
import { LinkBlock } from '../../blocks/LinkBlock/LinkBlock';
import { Bookmark } from '../../os/Bookmark/Bookmark';
import { capitalizeFirstLetter } from '../../util/strings';
import { BlockStyle } from '../Block/Block';
import { convertFragmentsToPreview } from '../ChatInput/fragment-parser';
import { BUBBLE_HEIGHT } from './Bubble.constants';
import { BubbleAuthor } from './Bubble.styles';
import {
  FragmentBlockquoteType,
  FragmentBoldItalicsStrikeType,
  FragmentBoldItalicsType,
  FragmentBoldStrikeType,
  FragmentBoldType,
  FragmentCodeType,
  FragmentImageType,
  FragmentInlineCodeType,
  FragmentItalicsStrikeType,
  FragmentItalicsType,
  FragmentKey,
  FragmentLinkType,
  FragmentPlainType,
  FragmentReplyType,
  FragmentShipType,
  FragmentStrikeType,
  FragmentTabType,
  FragmentType,
  FragmentUrLinkType,
  TEXT_TYPES,
} from './Bubble.types';

export const FragmentBase = styled(Text.Custom)<TextProps>`
  display: inline;
  user-select: text;
  margin: 0px 0px;
  line-height: ${BUBBLE_HEIGHT.rem.fragment};
`;

export const BlockWrapper = styled(motion.span)`
  padding: 0px;
  display: inline-block;
  margin-top: 2px;
  height: 100%;
`;

export const FragmentBlock = styled(motion.span)`
  height: 100%;
  width: 100%;
  blockquote {
    margin-bottom: 4px;
  }
`;

export const FragmentPlain = styled(FragmentBase)`
  font-weight: 400;
  margin: 0 0;
  line-height: ${BUBBLE_HEIGHT.rem.fragment};
`;

export const FragmentBold = styled(FragmentBase)`
  font-weight: 800;
`;
export const FragmentItalic = styled(FragmentBase)`
  font-style: italic;
`;
export const FragmentStrike = styled(FragmentBase)`
  text-decoration: line-through;
`;

export const FragmentBoldItalic = styled(FragmentBase)`
  font-weight: 800;
  font-style: italic;
`;

export const FragmentBoldStrike = styled(FragmentBase)`
  font-weight: 800;
  text-decoration: line-through;
`;

export const FragmentItalicsStrike = styled(FragmentBase)`
  font-style: italic;
  text-decoration: line-through;
`;

export const FragmentBoldItalicsStrike = styled(FragmentBase)`
  font-weight: 800;
  font-style: italic;
  text-decoration: line-through;
`;

export const FragmentReplyTo = styled(motion.blockquote)`
  font-style: italic;
  border-radius: 4px;
  display: flex;
  margin: 0px;
  flex-direction: column;
  padding: 4px;
  background: rgba(var(--rlm-card-rgba));
  ${FragmentBase} {
    font-size: 0.86em;
    color: rgba(var(--rlm-text-rgba));
  }
  ${Text.Custom} {
    color: rgba(var(--rlm-text-rgba));
  }
`;

export const FragmentInlineCode = styled(FragmentBase)`
  font-family: 'Fira Code', monospace;
  border-radius: 4px;
  /* padding: 0px 3px; */
`;

export const FragmentShip = styled(FragmentBase)`
  color: rgba(var(--rlm-accent-rgba));
  background: rgba(var(--rlm-accent-rgba), 0.12);
  border-radius: 4px;
  padding: 2px 4px;
  transition: var(--transition);
  &:hover {
    transition: var(--transition);
    background: rgba(var(--rlm-accent-rgba), 0.18);
    cursor: pointer;
  }
`;

export const CodeWrapper = styled(Flex)`
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.08);
  transition: var(--transition);
  &:hover {
    transition: var(--transition);
    background-color: rgba(0, 0, 0, 0.12);
  }
  margin-top: 4px;
  margin-bottom: 4px;
  padding: 6px 8px;
  width: 100%;
  ${Text.Custom} {
    color: rgba(var(--rlm-text-rgba)) !important;
  }
`;

export const FragmentCodeBlock = styled(Text.Custom)`
  font-family: 'Fira Code', monospace;
  border-radius: 4px;
  width: 100%;
  white-space: pre-wrap;
`;

type FragmentImageProps = {
  isSkeleton?: boolean;
};

export const FragmentImage = styled(motion.img)<FragmentImageProps>`
  width: 100%;
  max-width: 20rem;
  border-radius: 4px;
  ${({ isSkeleton }) => isSkeleton && skeletonStyle}
`;

const TabWrapper = styled(Flex)<FlexProps>`
  border-radius: 6px;
  background: rgba(var(--rlm-card-rgba));
  ${Text.Custom} {
    color: rgba(var(--rlm-text-rgba));
  }
`;

export const FragmentBlockquote = styled(motion.blockquote)`
  font-style: italic;
  border-left: 2px solid rgba(var(--rlm-accent-rgba));
  padding-left: 6px;
  padding-right: 8px;
  border-radius: 6px;
  padding-top: 6px;
  padding-bottom: 6px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.1);

  .fragment-reply {
    border-radius: 4px;

    ${FragmentBase} {
      font-size: 0.82rem;
    }
    ${Text.Custom} {
      line-height: 1rem;
    }
    .block-author {
      display: none !important;
    }
    ${BlockWrapper} {
      height: 32px !important;
      width: fit-content !important;
    }
    ${BlockStyle} {
      padding: 0px;
      margin: 0px;
      height: 32px !important;
      width: fit-content !important;
    }
    ${FragmentImage} {
      width: fit-content !important;
      height: 32px !important;
    }
    &.pinned {
      gap: 0px;
      ${Text.Custom} {
        /* line-height: inherit; */
        /* font-size: 0.8em; */
      }
    }
  }
  &.pinned-or-reply-message {
    padding-top: 4px;
    padding-bottom: 4px;
    padding-left: 6px;
    padding-right: 4px;
    border-radius: 3px;
    height: 46px;
    width: 100%;
    gap: 12px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin: 0;
    background: rgba(var(--rlm-overlay-hover-rgba));
    ${FragmentImage} {
      border-radius: 2px;
      height: 36px !important;
    }
  }
  &:hover:not([disabled]) {
    transition: var(--transition);
    background-color: rgba(var(--rlm-overlay-active-rgba));
    cursor: pointer;
  }
`;

export const LineBreak = styled.div`
  width: 100%;
  height: 4px;
  margin: 0;
  padding: 0;
`;

export const renderFragment = (
  id: string,
  fragment: FragmentType,
  index: number,
  author: string,
  containerWidth?: number,
  onReplyClick?: (id: string) => void
) => {
  const key = Object.keys(fragment)[0] as FragmentKey;
  switch (key) {
    case 'plain':
      return (
        <FragmentPlain id={id} key={index}>
          {(fragment as FragmentPlainType).plain}
        </FragmentPlain>
      );
    case 'bold':
      return (
        <FragmentBold id={id} key={index}>
          {(fragment as FragmentBoldType).bold}
        </FragmentBold>
      );
    case 'italics':
      return (
        <FragmentItalic id={id} key={index}>
          {(fragment as FragmentItalicsType).italics}
        </FragmentItalic>
      );
    case 'strike':
      return (
        <FragmentStrike id={id} key={index}>
          {(fragment as FragmentStrikeType).strike}
        </FragmentStrike>
      );
    case 'bold-italics':
      return (
        <FragmentBoldItalic id={id} key={index}>
          {(fragment as FragmentBoldItalicsType)['bold-italics']}
        </FragmentBoldItalic>
      );

    case 'bold-strike':
      return (
        <FragmentBoldStrike id={id} key={index}>
          {(fragment as FragmentBoldStrikeType)['bold-strike']}
        </FragmentBoldStrike>
      );
    case 'italics-strike':
      return (
        <FragmentItalicsStrike id={id} key={index}>
          {(fragment as FragmentItalicsStrikeType)['italics-strike']}
        </FragmentItalicsStrike>
      );
    case 'bold-italics-strike':
      return (
        <FragmentBoldItalicsStrike id={id} key={index}>
          {(fragment as FragmentBoldItalicsStrikeType)['bold-italics-strike']}
        </FragmentBoldItalicsStrike>
      );

    case 'blockquote':
      return (
        <FragmentBlockquote id={id} key={index}>
          {(fragment as FragmentBlockquoteType).blockquote}
        </FragmentBlockquote>
      );
    case 'inline-code':
      return (
        <FragmentInlineCode id={id} key={index}>
          {(fragment as FragmentInlineCodeType)['inline-code']}
        </FragmentInlineCode>
      );
    case 'ship':
      return (
        <FragmentShip id={id} key={index}>
          {(fragment as FragmentShipType).ship}
        </FragmentShip>
      );

    case 'code':
      return (
        <CodeWrapper
          py={1}
          minWidth={containerWidth ? containerWidth / 1.25 : 150}
        >
          <FragmentCodeBlock id={id} key={index}>
            {(fragment as FragmentCodeType).code}
          </FragmentCodeBlock>
        </CodeWrapper>
      );
    case 'link':
      return (
        <BlockWrapper id={id} key={author + index}>
          <LinkBlock
            draggable={false}
            mode="embed"
            containerWidth={containerWidth}
            metadata={(fragment as FragmentLinkType).metadata}
            link={(fragment as FragmentLinkType).link}
            id={id}
            by={author}
            onLinkLoaded={
              // onMeasure
              //   ? onMeasure
              //   : () => {
              //       // do nothing
              //     }
              () => {
                // do nothing
              }
            }
            minWidth={320}
          />
        </BlockWrapper>
      );

    case 'image':
      const imageFrag = fragment as FragmentImageType;
      return (
        <BlockWrapper id={id} key={author + index}>
          <ImageBlock
            draggable={false}
            mode="embed"
            variant="content"
            id={id}
            image={imageFrag.image}
            width={imageFrag.metadata?.width}
            height={imageFrag.metadata?.height}
            by={author}
          />
        </BlockWrapper>
      );

    case 'reply':
      const msg = (fragment as FragmentReplyType).reply.message[0];
      const fullmessage = (fragment as FragmentReplyType).reply.message;
      const replyAuthor = (fragment as FragmentReplyType).reply.author;
      const replyId = (fragment as FragmentReplyType).reply.msgId;
      const fragmentType = Object.keys(msg)[0];
      let replyContent: any = (
        <FragmentPlain id={id}>
          {convertFragmentsToPreview(id, fullmessage)}
        </FragmentPlain>
      );
      if (
        !TEXT_TYPES.includes(fragmentType) &&
        fragmentType !== 'image' &&
        fragmentType !== 'reply'
      ) {
        replyContent = (
          <FragmentPlain
            maxWidth={containerWidth && containerWidth - 16}
            truncate
            id={id}
            key={`${author + index}-reply`}
          >
            {capitalizeFirstLetter(fragmentType)}
          </FragmentPlain>
        );
      } else if (fragmentType === 'image') {
        // take out precalculated height and width
        (msg as FragmentImageType).metadata = {};
        replyContent = renderFragment(id, msg, index, replyAuthor);
      }

      return (
        <FragmentBlockquote
          style={{ height: 46 }}
          id={id}
          key={`${author + index}-reply`}
          onClick={() => onReplyClick?.(replyId)}
        >
          <Flex
            gap={fragmentType === 'image' ? 6 : 0}
            flexDirection={fragmentType === 'image' ? 'row-reverse' : 'column'}
            justifyContent={
              fragmentType === 'image' ? 'flex-end' : 'flex-start'
            }
            alignItems={fragmentType === 'image' ? 'center' : 'flex-start'}
            className="fragment-reply"
          >
            <Flex
              flexDirection="column"
              height={fragmentType === 'image' ? 30 : 'auto'}
            >
              <BubbleAuthor height={fragmentType === 'image' ? 30 : 'auto'}>
                {replyAuthor}
              </BubbleAuthor>
              {fragmentType === 'image' && (
                <Text.Custom fontSize={1}>Image</Text.Custom>
              )}
            </Flex>
            <Text.Custom
              truncate
              overflow="hidden"
              width="fit-content"
              maxWidth={containerWidth && containerWidth - 16}
            >
              {replyContent}
            </Text.Custom>
          </Flex>
        </FragmentBlockquote>
      );
    case 'tab':
      const { url, favicon, title } = (fragment as FragmentTabType).tab;
      return (
        <TabWrapper
          width={containerWidth && containerWidth - 16}
          id={url}
          p={0}
        >
          <Bookmark
            url={url}
            favicon={favicon}
            title={title}
            width={containerWidth && containerWidth - 36}
            onNavigate={(url: string) => {
              window.open(url, '_blank');
            }}
          />
        </TabWrapper>
      );

    case 'ur-link':
      return `<${(fragment as FragmentUrLinkType)['ur-link']}>`;
    case 'break':
      return <LineBreak />;
    default:
      // return fragment[key].data;
      return '';
  }
};
