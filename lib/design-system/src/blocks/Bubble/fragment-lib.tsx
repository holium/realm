import {
  Message,
  MessageBlockquote,
  MessageBold,
  MessageBoldItalics,
  MessageBoldItalicsStrike,
  MessageBoldStrike,
  MessageCode,
  MessageImage,
  MessageInlineCode,
  MessageItalics,
  MessageLink,
  MessagePlain,
  MessageShip,
  MessageStrike,
  MessageType,
  MessageUrLink,
} from './Bubble.types';

import styled from 'styled-components';
import { rgba } from 'polished';
import { getVar } from '../../util/colors';
import { Text } from '../..';
import { motion } from 'framer-motion';
import { ImageBlock } from '../ImageBlock/ImageBlock';

export const FragmentBase = styled(Text.Custom)`
  display: inline;
  margin-left: 2px;
  margin-right: 2px;
`;

export const FragmentBlock = styled(motion.span)`
  line-height: 1.4;
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

export const FragmentBlockquote = styled(FragmentBase)`
  font-style: italic;
  border-left: 2px solid var(--rlm-accent-color);
  padding-left: 8px;
`;

export const FragmentInlineCode = styled(FragmentBase)`
  font-family: 'Fira Code', monospace;
  border-radius: 4px;
  padding: 2px 4px;
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

export const FragmentCodeBlock = styled(FragmentBase)`
  font-family: 'Fira Code', monospace;
  border-radius: 4px;
  padding: 2px 4px;
  white-space: pre-wrap;
`;

export const FragmentImage = styled(motion.img)`
  width: 100%;
  max-width: 20rem;
  border-radius: 3px;
`;

export const renderFragment = (
  fragment: Message,
  index: number,
  author: string
) => {
  const key = Object.keys(fragment)[0] as MessageType;
  switch (key) {
    case 'plain':
      return (
        <FragmentPlain key={index}>
          {(fragment as MessagePlain).plain}
        </FragmentPlain>
      );
    case 'bold':
      return (
        <FragmentBold key={index}>
          {(fragment as MessageBold).bold}
        </FragmentBold>
      );
    case 'italics':
      return (
        <FragmentItalic key={index}>
          {(fragment as MessageItalics).italics}
        </FragmentItalic>
      );
    case 'strike':
      return (
        <FragmentStrike key={index}>
          {(fragment as MessageStrike).strike}
        </FragmentStrike>
      );
    case 'bold-italics':
      return (
        <FragmentBoldItalic key={index}>
          {(fragment as MessageBoldItalics)['bold-italics']}
        </FragmentBoldItalic>
      );

    case 'bold-strike':
      return (
        <FragmentBoldStrike key={index}>
          {(fragment as MessageBoldStrike)['bold-strike']}
        </FragmentBoldStrike>
      );
    case 'bold-italics-strike':
      return (
        <FragmentBoldItalicsStrike key={index}>
          {(fragment as MessageBoldItalicsStrike)['bold-italics-strike']}
        </FragmentBoldItalicsStrike>
      );

    case 'blockquote':
      return (
        <FragmentBlockquote key={index}>
          {(fragment as MessageBlockquote).blockquote}
        </FragmentBlockquote>
      );
    case 'inline-code':
      return (
        <FragmentInlineCode key={index}>
          {(fragment as MessageInlineCode)['inline-code']}
        </FragmentInlineCode>
      );
    case 'ship':
      return (
        <FragmentShip key={index}>
          {(fragment as MessageShip).ship}
        </FragmentShip>
      );

    case 'code':
      return (
        <FragmentCodeBlock key={index}>
          {(fragment as MessageCode).code}
        </FragmentCodeBlock>
      );
    case 'link':
      return `[${(fragment as MessageLink).link[0]}](${
        (fragment as MessageLink).link[1]
      })`;
    case 'image':
      return (
        <>
          <ImageBlock
            draggable={false}
            mode="embed"
            key={index}
            id={author + index}
            image={(fragment as MessageImage).image}
            by={author}
          />
        </>
      );

    case 'ur-link':
      return `<${(fragment as MessageUrLink)['ur-link']}>`;
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
//       return <FragmentPlain>{(fragment as MessagePlain).plain}</FragmentPlain>;
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
