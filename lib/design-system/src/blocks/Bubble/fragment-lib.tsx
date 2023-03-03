import {
  FragmentType,
  FragmentBlockquoteType,
  FragmentBoldType,
  FragmentBoldItalicsType,
  FragmentBoldItalicsStrikeType,
  FragmentBoldStrikeType,
  FragmentCodeType,
  FragmentImageType,
  FragmentInlineCodeType,
  FragmentItalicsType,
  FragmentLinkType,
  FragmentPlainType,
  FragmentShipType,
  FragmentStrikeType,
  FragmentKey,
  FragmentUrLinkType,
  FragmentReplyType,
  FragmentTabType,
  TEXT_TYPES,
} from './Bubble.types';

import styled from 'styled-components';
import { rgba } from 'polished';
import { getVar } from '../../util/colors';
import { capitalizeFirstLetter } from '../../util/strings';
import { Text, TextProps, Flex, FlexProps, skeletonStyle } from '../..';
import { motion } from 'framer-motion';
import { ImageBlock } from '../ImageBlock/ImageBlock';
import { LinkBlock } from '../LinkBlock/LinkBlock';
import { BubbleAuthor } from './Bubble.styles';
import { Bookmark } from '../../os/Bookmark/Bookmark';

export const FragmentBase = styled(Text.Custom)<TextProps>`
  display: inline;
  user-select: text;
  margin: 0 3px;
`;

const BlockWrapper = styled(motion.span)`
  padding: 8px 0px;
  display: inline-block;
  height: 100%;
`;

export const FragmentBlock = styled(motion.span)`
  /* line-height: 1.4; */
  height: 100%;
  width: 100%;
  blockquote {
    margin: 4px 4px;
  }
`;

export const FragmentPlain = styled(FragmentBase)`
  font-weight: 400;
  margin: 0 0;
`;

export const FragmentBold = styled(FragmentBase)`
  font-weight: 500;
`;
export const FragmentItalic = styled(FragmentBase)`
  font-style: italic;
`;
export const FragmentStrike = styled(FragmentBase)`
  text-decoration: line-through;
`;

export const FragmentBoldItalic = styled(FragmentBase)`
  font-weight: 500;
  font-style: italic;
`;

export const FragmentBoldStrike = styled(FragmentBase)`
  font-weight: 500;
  text-decoration: line-through;
`;

export const FragmentBoldItalicsStrike = styled(FragmentBase)`
  font-weight: 500;
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
  background: var(--rlm-card-color);
  ${FragmentBase} {
    font-size: 0.86em;
    color: var(--rlm-text-color);
  }
  ${Text.Custom} {
    color: var(--rlm-text-color);
  }
`;

export const FragmentInlineCode = styled(FragmentBase)`
  font-family: 'Fira Code', monospace;
  border-radius: 4px;
  /* padding: 0px 3px; */
`;

export const FragmentShip = styled(FragmentBase)`
  color: var(--rlm-accent-color);
  background: ${() => rgba(getVar('accent'), 0.12)};
  border-radius: 4px;
  padding: 2px 4px;
  transition: var(--transition);
  &:hover {
    transition: var(--transition);
    background: ${() => rgba(getVar('accent'), 0.18)};
    cursor: pointer;
  }
`;

const CodeWrapper = styled(Flex)`
  border-radius: 4px;
  background: var(--rlm-card-color);
  padding: 4px 8px;
  width: 100%;
  ${Text.Custom} {
    color: var(--rlm-text-color) !important;
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
  background: var(--rlm-card-color);
  ${Text.Custom} {
    color: var(--rlm-text-color);
  }
`;

export const FragmentBlockquote = styled(motion.blockquote)`
  font-style: italic;
  border-left: 2px solid var(--rlm-accent-color);
  padding-left: 8px;
  padding-right: 8px;
  border-radius: 0px 3px 3px 0px;
  .fragment-reply {
    border-radius: 4px;
    ${FragmentBase} {
      font-size: 0.86em;
    }
    .block-author {
      display: none !important;
    }
    ${FragmentImage} {
      width: fit-content;
      height: 40px;
    }
  }
  &:active:not([disabled]) {
    transition: var(--transition);
    background-color: var(--rlm-overlay-active);
  }
  &:hover:not([disabled]) {
    transition: var(--transition);
    background-color: var(--rlm-overlay-hover);
    cursor: pointer;
  }
`;

export const renderFragment = (
  id: string,
  fragment: FragmentType,
  index: number,
  author: string,
  onLoaded?: () => void // used in the case where async data is loaded
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
        <CodeWrapper py={1}>
          <FragmentCodeBlock id={id} key={index}>
            {(fragment as FragmentCodeType).code}
          </FragmentCodeBlock>
        </CodeWrapper>
      );
    case 'link':
      return (
        <BlockWrapper>
          <LinkBlock
            draggable={false}
            key={index}
            mode="embed"
            link={(fragment as FragmentLinkType).link}
            id={author + index}
            by={author}
            onLoaded={onLoaded}
            minWidth={320}
          />
        </BlockWrapper>
      );

    case 'image':
      return (
        <BlockWrapper>
          <ImageBlock
            draggable={false}
            mode="embed"
            variant="content"
            key={index}
            id={author + index}
            image={(fragment as FragmentImageType).image}
            by={author}
            onLoaded={onLoaded}
          />
        </BlockWrapper>
      );

    case 'reply':
      const msg = (fragment as FragmentReplyType).reply.message[0];
      const replyAuthor = (fragment as FragmentReplyType).reply.author;
      const fragmentType: string = Object.keys(msg)[0];
      let replyContent = null;
      if (
        !TEXT_TYPES.includes(fragmentType) &&
        fragmentType !== 'image' &&
        fragmentType !== 'reply'
      ) {
        replyContent = (
          <FragmentPlain id={id}>
            {capitalizeFirstLetter(fragmentType)}
          </FragmentPlain>
        );
      } else {
        replyContent = renderFragment(id, msg, index, replyAuthor);
      }
      return (
        <FragmentBlockquote id={id}>
          <Flex flexDirection="column" className="fragment-reply">
            <BubbleAuthor>{replyAuthor}</BubbleAuthor>
            {replyContent}
          </Flex>
        </FragmentBlockquote>
      );
    case 'tab':
      const { url, favicon, title } = (fragment as FragmentTabType).tab;
      return (
        <TabWrapper width={340} id={url} p={0}>
          <Bookmark
            url={url}
            favicon={favicon}
            title={title}
            width={320}
            onNavigate={(url: string) => {
              window.open(url, '_blank');
            }}
          />
        </TabWrapper>
      );

    case 'ur-link':
      return `<${(fragment as FragmentUrLinkType)['ur-link']}>`;
    case 'break':
      return <br />;
    default:
      // return fragment[key].data;
      return '';
  }
};
