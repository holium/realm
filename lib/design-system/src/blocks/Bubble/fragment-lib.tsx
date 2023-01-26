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
} from './Bubble.types';

import styled from 'styled-components';
import { rgba } from 'polished';
import { getVar } from '../../util/colors';
import { Text, TextProps, Flex } from '../..';
import { motion } from 'framer-motion';
import { ImageBlock } from '../ImageBlock/ImageBlock';
import { LinkBlock } from '../LinkBlock/LinkBlock';
import { BubbleAuthor } from './Bubble.styles';

export const FragmentBase = styled(Text.Custom)<TextProps>`
  display: inline;
  margin-left: 2px;
  margin-right: 2px;
`;

export const FragmentBlock = styled(motion.span)`
  line-height: 1.4;
  blockquote {
    margin: 4px 4px;
  }
`;

export const FragmentPlain = styled(FragmentBase)`
  font-weight: 400;
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

export const FragmentBlockquote = styled(motion.blockquote)`
  font-style: italic;
  border-left: 2px solid var(--rlm-accent-color);
  padding-left: 8px;
  .fragment-reply {
    ${FragmentBase} {
      font-size: 0.86em;
    }
  }
`;

export const FragmentInlineCode = styled(FragmentBase)`
  font-family: 'Fira Code', monospace;
  border-radius: 4px;
  padding: 0px 3px;
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
    color: var(--rlm-text-color);
  }
`;

export const FragmentCodeBlock = styled(Text.Custom)`
  font-family: 'Fira Code', monospace;
  border-radius: 4px;
  width: 100%;
  white-space: pre-wrap;
`;

export const FragmentImage = styled(motion.img)`
  width: 100%;
  max-width: 20rem;
  border-radius: 4px;
`;

export const renderFragment = (
  fragment: FragmentType,
  index: number,
  author: string
) => {
  const key = Object.keys(fragment)[0] as FragmentKey;
  switch (key) {
    case 'plain':
      return (
        <FragmentPlain key={index}>
          {(fragment as FragmentPlainType).plain}
        </FragmentPlain>
      );
    case 'bold':
      return (
        <FragmentBold key={index}>
          {(fragment as FragmentBoldType).bold}
        </FragmentBold>
      );
    case 'italics':
      return (
        <FragmentItalic key={index}>
          {(fragment as FragmentItalicsType).italics}
        </FragmentItalic>
      );
    case 'strike':
      return (
        <FragmentStrike key={index}>
          {(fragment as FragmentStrikeType).strike}
        </FragmentStrike>
      );
    case 'bold-italics':
      return (
        <FragmentBoldItalic key={index}>
          {(fragment as FragmentBoldItalicsType)['bold-italics']}
        </FragmentBoldItalic>
      );

    case 'bold-strike':
      return (
        <FragmentBoldStrike key={index}>
          {(fragment as FragmentBoldStrikeType)['bold-strike']}
        </FragmentBoldStrike>
      );
    case 'bold-italics-strike':
      return (
        <FragmentBoldItalicsStrike key={index}>
          {(fragment as FragmentBoldItalicsStrikeType)['bold-italics-strike']}
        </FragmentBoldItalicsStrike>
      );

    case 'blockquote':
      return (
        <FragmentBlockquote key={index}>
          {(fragment as FragmentBlockquoteType).blockquote}
        </FragmentBlockquote>
      );
    case 'inline-code':
      return (
        <FragmentInlineCode key={index}>
          {(fragment as FragmentInlineCodeType)['inline-code']}
        </FragmentInlineCode>
      );
    case 'ship':
      return (
        <FragmentShip key={index}>
          {(fragment as FragmentShipType).ship}
        </FragmentShip>
      );

    case 'code':
      return (
        <CodeWrapper my={1}>
          <FragmentCodeBlock key={index}>
            {(fragment as FragmentCodeType).code}
          </FragmentCodeBlock>
        </CodeWrapper>
      );
    case 'link':
      return (
        <LinkBlock
          my={1}
          draggable={false}
          key={index}
          mode="embed"
          link={(fragment as FragmentLinkType).link}
          id={author + index}
          by={author}
          width={350}
        />
      );

    case 'image':
      return (
        <>
          <ImageBlock
            my={1}
            draggable={false}
            mode="embed"
            variant="content"
            key={index}
            id={author + index}
            image={(fragment as FragmentImageType).image}
            by={author}
          />
        </>
      );

    case 'reply':
      const msg = (fragment as FragmentReplyType).reply.message[0];
      const replyAuthor = (fragment as FragmentReplyType).reply.author;
      return (
        <FragmentBlockquote>
          <Flex flexDirection="column" className="fragment-reply">
            <BubbleAuthor>{replyAuthor}</BubbleAuthor>
            {renderFragment(msg, index, replyAuthor)}
          </Flex>
        </FragmentBlockquote>
      );

    case 'ur-link':
      return `<${(fragment as FragmentUrLinkType)['ur-link']}>`;
    case 'break':
      return '\n';
    default:
      // return fragment[key].data;
      return '';
  }
};

// export const renderFragment = (fragment: Message) => {
//   const key = Object.keys(fragment)[0] as MessageType;
//   switch (key) {
//     case 'plain':
//       return <FragmentPlain>{(fragment as FragmentPlainType).plain}</FragmentPlain>;
//     case 'bold':
//       return `**${(fragment as MessageBold).bold}**`;
//     case 'italics':
//       return `*${(fragment as MessageItalics).italics}*`;
//     case 'strike':
//       return `~~${(fragment as MessageStrike).strike}~~`;
//     case 'bold-italics':
//       return `***${(fragment as MessageBoldItalics)['bold-italics']}***`;
//     case 'bold-strike':
//       return `**~~${(fragment as MessageBoldStrike)['bold-strike']}~~**`;
//     case 'bold-italics-strike':
//       return `***~~${
//         (fragment as MessageBoldItalicsStrike)['bold-italics-strike']
//       }~~***`;
//     case 'blockquote':
//       return `> ${(fragment as MessageBlockquote).blockquote}`;
//     case 'inline-code':
//       return `\`${(fragment as MessageInlineCode)['inline-code']}\``;
//     case 'ship':
//       return `${(fragment as MessageShip).ship}`;
//     case 'code':
//       return `\`\`\`${(fragment as MessageCode).code}\`\`\``;
//     case 'link':
//       return `[${(fragment as MessageLink).link[0]}](${
//         (fragment as MessageLink).link[1]
//       })`;
//     case 'image':
//       return `![${(fragment as MessageImage).image}](${
//         (fragment as MessageImage).image
//       })`;
//     case 'ur-link':
//       return `<${(fragment as MessageUrLink)['ur-link']}>`;
//     case 'break':
//       return '\n';
//     default:
//       // return fragment[key].data;
//       return '';
//   }
// };
