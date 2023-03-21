import {
  FragmentType,
  FragmentBlockquoteType,
  FragmentBoldType,
  FragmentBoldItalicsType,
  FragmentBoldItalicsStrikeType,
  FragmentItalicsStrikeType,
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
  margin: 0px 0px;
`;

export const BlockWrapper = styled(motion.span)`
  padding: 0px;
  display: inline-block;
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
  line-height: 1.1rem;
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
  padding-left: 6px;
  padding-right: 8px;
  border-radius: 3px;
  padding-top: 6px;
  padding-bottom: 6px;
  background-color: rgba(0, 0, 0, 0.12);

  .fragment-reply {
    border-radius: 4px;
    gap: 2px;

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
    &.pinned {
      gap: 0px;
      ${Text.Custom} {
        line-height: inherit;
        font-size: 0.8em;
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
    background: var(--rlm-overlay-hover);
    ${FragmentImage} {
      border-radius: 2px;
      height: 36px !important;
    }
  }
  &:hover:not([disabled]) {
    transition: var(--transition);
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
            link={(fragment as FragmentLinkType).link}
            id={id}
            by={author}
            onLinkLoaded={onLoaded}
            minWidth={320}
          />
        </BlockWrapper>
      );

    case 'image':
      return (
        <BlockWrapper id={id} key={author + index}>
          <ImageBlock
            draggable={false}
            mode="embed"
            variant="content"
            id={id}
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
        replyContent = renderFragment(
          id,
          msg,
          index,
          replyAuthor,
          containerWidth
        );
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
      return <LineBreak />;
    default:
      // return fragment[key].data;
      return '';
  }
};
