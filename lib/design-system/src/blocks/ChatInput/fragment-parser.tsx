import {
  FragmentType,
  FragmentKeyTypes,
  TEXT_TYPES,
} from '../Bubble/Bubble.types';

const detectPlainRegex = /^([^<]+)$/;
const detectBoldRegex = /^\*\*([^*]+)\*\*$/;
const detectItalicRegex = /^\*([^*]+)\*$/;
const detectStrikeRegex = /^~~([^~]+)~~$/;
const detectBoldItalicRegex = /^\*\*\*([^*]+)\*\*\*$/;
const detectBoldStrikeRegex = /^\*\*~~([^*]+)~~\*\*$/;
const detectBoldItalicStrikeRegex = /^\*\*\*~~([^*]+)~~\*\*\*$/;
const detectBlockquoteRegex = /^>([^>]+)$/;
const detectInlineCodeRegex = /^`([^`]+)`$/;
const detectCodeBlockRegex = /^```([^`]+)```$/;
const detectLinkRegex = /^\[([^\]]+)\]\(([^)]+)\)$/;
const detectImageRegex = /^!\[([^\]]+)\]\(([^)]+)\)$/;
const detectLineBreakRegex = /\n/;

// TODO parse blocks and inline elements

const parseFragment = (fragment: string): FragmentType => {
  const bold = detectBoldRegex.exec(fragment);
  if (bold) {
    return { bold: bold[1] };
  }
  const italics = detectItalicRegex.exec(fragment);
  if (italics) {
    return { italics: italics[1] };
  }
  const strike = detectStrikeRegex.exec(fragment);
  if (strike) {
    return { strike: strike[1] };
  }
  const boldItalic = detectBoldItalicRegex.exec(fragment);
  if (boldItalic) {
    return { 'bold-italics': boldItalic[1] };
  }
  const boldStrike = detectBoldStrikeRegex.exec(fragment);
  if (boldStrike) {
    return { 'bold-strike': boldStrike[1] };
  }
  const boldItalicStrike = detectBoldItalicStrikeRegex.exec(fragment);
  if (boldItalicStrike) {
    return { 'bold-italics-strike': boldItalicStrike[1] };
  }
  const blockquote = detectBlockquoteRegex.exec(fragment);
  if (blockquote) {
    return { blockquote: blockquote[1] };
  }
  const code = detectInlineCodeRegex.exec(fragment);
  if (code) {
    return { 'inline-code': code[1] };
  }
  const codeBlock = detectCodeBlockRegex.exec(fragment);
  if (codeBlock) {
    return { code: codeBlock[1] };
  }
  const link = detectLinkRegex.exec(fragment);
  if (link) {
    return { link: link[1] };
  }
  const image = detectImageRegex.exec(fragment);
  if (image) {
    return { image: image[1] };
  }
  const lineBreak = detectLineBreakRegex.exec(fragment);
  if (lineBreak) {
    return { break: null };
  }
  return { plain: fragment };
};

export const parseChatInput = (fragment: string): FragmentType[] => {
  const frags: FragmentType[] = [];
  const consolidatedFragments: FragmentType[] = [];
  // TODO This only works for inline elements, need to add block elements
  const rawFragments = fragment.replaceAll('\n', ' \n ').split(' ');
  rawFragments.forEach((rawFragment: string) => {
    const parsedFragment = parseFragment(rawFragment);
    frags.push(parsedFragment);
  });

  console.log(rawFragments);

  frags.forEach((fragment: FragmentType, index: number) => {
    let previousFragment: FragmentType | null = null;
    let previousFragmentKey: FragmentKeyTypes | null = null;
    let currentFragmentKey: FragmentKeyTypes = Object.keys(
      fragment
    )[0] as FragmentKeyTypes;
    if (index !== 0) {
      previousFragment = frags[index - 1];
      previousFragmentKey = Object.keys(
        previousFragment
      )[0] as FragmentKeyTypes;
    }
    if (
      TEXT_TYPES.includes(currentFragmentKey) &&
      previousFragmentKey === currentFragmentKey
    ) {
      let lastConsolidated =
        consolidatedFragments[consolidatedFragments.length - 1];
      const lastValue = Object.values(lastConsolidated)[0];
      const currentValue = Object.values(fragment)[0];
      lastConsolidated = {
        [currentFragmentKey]: `${lastValue} ${currentValue}`,
      } as FragmentType;
      consolidatedFragments[consolidatedFragments.length - 1] =
        lastConsolidated;
    } else {
      consolidatedFragments.push(fragment);
    }
  });

  return consolidatedFragments;
};
