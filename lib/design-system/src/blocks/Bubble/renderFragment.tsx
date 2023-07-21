import { Flex, Text } from '../../../general';
import { Bookmark } from '../../os/Bookmark/Bookmark';
import { parseMediaType } from '../../util/links';
import { capitalizeFirstLetter } from '../../util/strings';
import { convertFragmentsToPreview } from '../ChatInput/fragment-parser';
import { ImageBlock } from '../ImageBlock/ImageBlock';
import { LinkBlock } from '../LinkBlock/LinkBlock';
import { MediaBlock } from '../MediaBlock/MediaBlock';
import { SpaceBlock } from '../SpaceBlock/SpaceBlock';
import { BubbleAuthor } from './Bubble.styles';
import {
  FragmentBlockquoteType,
  FragmentBoldItalicsStrikeType,
  FragmentBoldItalicsType,
  FragmentBoldStrikeType,
  FragmentBoldType,
  FragmentCodeType,
  FragmentCustomType,
  FragmentImageType,
  FragmentInlineCodeType,
  FragmentItalicsStrikeType,
  FragmentItalicsType,
  FragmentKey,
  FragmentLinkType,
  FragmentMarkdownType,
  FragmentPlainType,
  FragmentReplyType,
  FragmentShipType,
  FragmentStrikeType,
  FragmentTabType,
  FragmentType,
  FragmentUrLinkType,
  TEXT_TYPES,
} from './Bubble.types';
import {
  BlockWrapper,
  CodeWrapper,
  FragmentBlockquote,
  FragmentBold,
  FragmentBoldItalic,
  FragmentBoldItalicsStrike,
  FragmentBoldStrike,
  FragmentCodeBlock,
  FragmentInlineCode,
  FragmentItalic,
  FragmentItalicsStrike,
  FragmentPlain,
  FragmentShip,
  FragmentStrike,
  LineBreak,
  TabWrapper,
} from './renderFragment.styles';

export const renderFragment = (
  id: string,
  fragment: FragmentType,
  index: number,
  author: string,
  onReplyClick?: (id: string) => void,
  onJoinSpaceClick?: (path: string) => void,
  allSpacePaths?: string[]
) => {
  const key = Object.keys(fragment)[0] as FragmentKey;
  switch (key) {
    case 'markdown':
      return (
        <FragmentPlain id={id} key={index}>
          {(fragment as FragmentMarkdownType).markdown}
        </FragmentPlain>
      );
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
        <FragmentBlockquote id={id} key={index} className="fragment-blockquote">
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
        <FragmentShip id={id} key={index} className="fragment-ship">
          {(fragment as FragmentShipType).ship}
        </FragmentShip>
      );

    case 'code':
      return (
        <CodeWrapper py={1} minWidth={150} className="code-wrapper">
          <FragmentCodeBlock id={id} key={index}>
            {(fragment as FragmentCodeType).code}
          </FragmentCodeBlock>
        </CodeWrapper>
      );
    case 'link': {
      const link = (fragment as FragmentLinkType).link;
      const { linkType } = parseMediaType(link);
      if (linkType === 'media') {
        return (
          <MediaBlock
            id={`media-${link}`}
            mode="embed"
            variant="content"
            width={320}
            url={link}
            onLoaded={() => {}}
          />
        );
      }
      return (
        <BlockWrapper id={id} key={author + index} className="block-wrapper">
          <LinkBlock
            draggable={false}
            mode="embed"
            metadata={(fragment as FragmentLinkType).metadata}
            link={(fragment as FragmentLinkType).link}
            id={id}
            by={author}
            onLinkLoaded={() => {}}
            minWidth={320}
          />
        </BlockWrapper>
      );
    }
    case 'image': {
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
    }
    case 'reply': {
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
            maxWidth="100%"
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
          className="fragment-blockquote"
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
              maxWidth="100%"
            >
              {replyContent}
            </Text.Custom>
          </Flex>
        </FragmentBlockquote>
      );
    }
    case 'tab': {
      const { url, favicon, title } = (fragment as FragmentTabType).tab;
      return (
        <TabWrapper width="100%" id={url} p={0}>
          <Bookmark
            url={url}
            favicon={favicon}
            title={title}
            onNavigate={(url) => window.open(url, '_blank')}
          />
        </TabWrapper>
      );
    }
    case 'custom': {
      const cust = (fragment as FragmentCustomType).custom;
      switch (cust.name) {
        case 'space': {
          const mtd = (fragment as FragmentCustomType).metadata;
          const space: any = mtd && mtd.space && JSON.parse(mtd.space);
          if (space) {
            return (
              <SpaceBlock
                id={id}
                mt={1}
                name={space.name}
                members={Object.keys(space.members.all).length}
                url={cust.value}
                image={space.theme.wallpaper}
                onClick={onJoinSpaceClick}
                hasJoined={
                  !!(
                    allSpacePaths &&
                    allSpacePaths.includes('/spaces' + space.path)
                  )
                }
                minWidth={320}
              />
            );
          } else {
            console.log(cust);
            return (
              <SpaceBlock
                id={id}
                name={cust.value.split('/')[3]}
                members={0}
                url={cust.value}
                onClick={onJoinSpaceClick}
                hasJoined={false}
              />
            );
          }
        }
        default:
          return (
            <span>
              UNKNOWN CUSTOM TYPE. name: {cust.name} value: {cust.value}
            </span>
          );
      }
    }
    case 'ur-link':
      return `<${(fragment as FragmentUrLinkType)['ur-link']}>`;
    case 'break':
      return <LineBreak />;
    default:
      // return fragment[key].data;
      return '';
  }
};
