import {
  FragmentType,
  FragmentKeyTypes,
  TEXT_TYPES,
} from '../Bubble/Bubble.types';

const boldToken = '**';
const italicsToken = '*';
const strikeToken = '~~';
const boldItalicsToken = '***';
const boldStrikeToken = '**~~';
const boldItalicsStrikeToken = '***~~';
const blockquoteToken = '>';
const inlineCodeToken = '`';
const codeBlockToken = '```';
const lineBreakToken = '\n';

export const convertFragmentsToText = (fragments: FragmentType[]): string => {
  return fragments.map((fragment) => fragmentToText(fragment)).join('');
};

export const fragmentToText = (fragment: FragmentType): string => {
  const [type, text] = Object.entries(fragment)[0];
  if (type === 'plain') return text;
  if (type === 'bold') return `${boldToken}${text}${boldToken}`;
  if (type === 'italics') return `${italicsToken}${text}${italicsToken}`;
  if (type === 'strike') return `${strikeToken}${text}${strikeToken}`;
  if (type === 'boldItalics')
    return `${boldItalicsToken}${text}${boldItalicsToken}`;
  if (type === 'boldStrike')
    return `${boldStrikeToken}${text}${boldStrikeToken}`;
  if (type === 'boldItalicsStrike')
    return `${boldItalicsStrikeToken}${text}${boldItalicsStrikeToken}`;
  if (type === 'blockquote') return `${blockquoteToken}${text}`;
  if (type === 'inlineCode')
    return `${inlineCodeToken}${text}${inlineCodeToken}`;
  if (type === 'codeBlock') return `${codeBlockToken}${text}${codeBlockToken}`;
  if (type === 'lineBreak') return lineBreakToken;
  return text;
};

// const plainRegex = /^[a-zA-Z]+(([\'\,\.\- ][a-zA-Z ])?[a-zA-Z]*)*$/g;
const boldRegex = /\*\*([^*]+)\*\*/g;
const italicsRegex = /\*([^*]+)\*/g;
const strikeRegex = /~~([^*]+)~~/g;
const boldItalicsRegex = /\*\*\*([^*]+)\*\*\*/g;
const boldStrikeRegex = /\*\*~~([^*]+)~~\*\*/g;
const boldItalicsStrikeRegex = /\*\*\*~~([^*]+)~~\*\*\*/g;
const blockquoteRegex = />([^>]+)$/g;
const inlineCodeRegex = /`([^`]+)`/g;
const codeBlockRegex = /```([^`]*)```/g;
const linkRegex = /^\[([^\]]+)\]\(([^)]+)\)/g;
const imageRegex = /^!\[([^\]]+)\]\(([^)]+)\)/g;
const lineBreakRegex = /\n/g;

const START_TOKEN = '[%%';
const END_TOKEN = '%%]';

const splitTextType = (text: string, type: string): FragmentType[] => {
  const fragments = text.split(lineBreakRegex);
  const parsedFragments: FragmentType[] = [];
  fragments.forEach((fragment, index) => {
    if (index > 0) parsedFragments.push({ break: null });
    parsedFragments.push({ [type]: fragment } as FragmentType);
  });

  return parsedFragments.filter(
    // @ts-ignore
    (fragment) => fragment[type] !== ''
  );
};

const parseFragment = (fragment: string): FragmentType[] => {
  if (fragment?.includes(`%bold-italics-strike${START_TOKEN}`)) {
    let sanitizedBoldItalicsStrike = fragment.replace(
      `%bold-italics-strike${START_TOKEN}`,
      ''
    );
    sanitizedBoldItalicsStrike = sanitizedBoldItalicsStrike.replace(
      END_TOKEN,
      ''
    );
    return splitTextType(sanitizedBoldItalicsStrike, 'bold-italics-strike');
  }
  if (fragment?.includes(`%bold-italics${START_TOKEN}`)) {
    console.log(fragment);
    let sanitizedBoldItalic = fragment.replace(
      `%bold-italics${START_TOKEN}`,
      ''
    );
    sanitizedBoldItalic = sanitizedBoldItalic.replaceAll(END_TOKEN, '');
    return splitTextType(sanitizedBoldItalic, 'bold-italics');
  }
  if (fragment?.includes(`%bold-strike${START_TOKEN}`)) {
    let sanitizedBoldStrike = fragment.replace(
      `%bold-strike${START_TOKEN}`,
      ''
    );
    sanitizedBoldStrike = sanitizedBoldStrike.replace(END_TOKEN, '');
    return splitTextType(sanitizedBoldStrike, 'bold-strike');
  }
  if (fragment?.includes(`%bold${START_TOKEN}`)) {
    let sanitizedBold = fragment.replace(`%bold${START_TOKEN}`, '');
    sanitizedBold = sanitizedBold.replace(END_TOKEN, '');
    return splitTextType(sanitizedBold, 'bold');
  }
  if (fragment?.includes(`%italics${START_TOKEN}`)) {
    let sanitizedItalics = fragment.replace(`%italics${START_TOKEN}`, '');
    sanitizedItalics = sanitizedItalics.replace(END_TOKEN, '');
    return splitTextType(sanitizedItalics, 'italics');
  }
  if (fragment?.includes(`%strike${START_TOKEN}`)) {
    let sanitizedStrike = fragment.replace(`%strike${START_TOKEN}`, '');
    sanitizedStrike = sanitizedStrike.replace(END_TOKEN, '');
    return splitTextType(sanitizedStrike, 'strike');
  }

  if (fragment?.includes('%blockquote')) {
    let sanitizedBlockquote = fragment.replace(`%blockquote${START_TOKEN}`, '');
    sanitizedBlockquote = sanitizedBlockquote.replace(END_TOKEN, '');
    return splitTextType(sanitizedBlockquote, 'blockquote');
  }

  if (fragment?.includes(`%inline-code${START_TOKEN}`)) {
    let sanitizedInlineCode = fragment.replace(
      `%inline-code${START_TOKEN}`,
      ''
    );
    sanitizedInlineCode = sanitizedInlineCode.replace(END_TOKEN, '');

    return [{ 'inline-code': sanitizedInlineCode }];
  }

  if (fragment?.includes(`%code${START_TOKEN}`)) {
    let sanitizedCode = fragment.replaceAll('%% \n', '%%');
    sanitizedCode = sanitizedCode.replaceAll('\n %%', '%%');
    sanitizedCode = sanitizedCode.replaceAll('%%\n', '%%');
    sanitizedCode = sanitizedCode.replaceAll('\n%%', '%%');
    sanitizedCode = sanitizedCode.replace(`%code${START_TOKEN}`, '');
    sanitizedCode = sanitizedCode.replace(END_TOKEN, '');
    return [
      {
        code: sanitizedCode,
      },
    ];
  }
  const link = linkRegex.exec(fragment);
  if (link) {
    return [{ link: link[1].replace('%link', '') }];
  }
  const image = imageRegex.exec(fragment);
  if (image) {
    return [{ image: image[1].replace('%image', '') }];
  }
  // const lineBreak = lineBreakRegex.exec(fragment);
  // if (lineBreak) {
  //   return [{ break: null }];
  // }
  return splitTextType(fragment.replace('%plain', ''), 'plain');
};

const addSeperatorReplacer = (
  _match: any,
  type: FragmentKeyTypes,
  ...args: any
) => {
  return `|%${type}[%%${args[0][0]}%%]|`;
};

const seperateRawInput = (rawInput: string): string => {
  let rawInputWithSeperators = rawInput;
  rawInputWithSeperators = rawInputWithSeperators.replaceAll(
    codeBlockRegex,
    (match: any, ...args) => addSeperatorReplacer(match, 'code', args)
  );
  rawInputWithSeperators = rawInputWithSeperators.replaceAll(
    inlineCodeRegex,
    (match: any, ...args) => addSeperatorReplacer(match, 'inline-code', args)
  );
  rawInputWithSeperators = rawInputWithSeperators.replaceAll(
    blockquoteRegex,
    (match: any, ...args) => addSeperatorReplacer(match, 'blockquote', args)
  );
  rawInputWithSeperators = rawInputWithSeperators.replaceAll(
    boldItalicsRegex,
    (match: any, ...args) => addSeperatorReplacer(match, 'bold-italics', args)
  );
  rawInputWithSeperators = rawInputWithSeperators.replaceAll(
    boldItalicsStrikeRegex,
    (match: any, ...args) =>
      addSeperatorReplacer(match, 'bold-italics-strike', args)
  );

  rawInputWithSeperators = rawInputWithSeperators.replaceAll(
    boldStrikeRegex,
    (match: any, ...args) => addSeperatorReplacer(match, 'bold-strike', args)
  );
  rawInputWithSeperators = rawInputWithSeperators.replaceAll(
    boldRegex,
    (match: any, ...args) => addSeperatorReplacer(match, 'bold', args)
  );
  rawInputWithSeperators = rawInputWithSeperators.replaceAll(
    italicsRegex,
    (match: any, ...args) => addSeperatorReplacer(match, 'italics', args)
  );
  rawInputWithSeperators = rawInputWithSeperators.replaceAll(
    strikeRegex,
    (match: any, ...args) => addSeperatorReplacer(match, 'strike', args)
  );
  rawInputWithSeperators = rawInputWithSeperators.replaceAll(
    imageRegex,
    (match: any, ...args) => addSeperatorReplacer(match, 'image', args)
  );
  // rawInputWithSeperators = rawInputWithSeperators.replaceAll(
  //   plainRegex,
  //   (match: any, ...args) => addSeperatorReplacer(match, 'plain', args)
  // );
  // rawInputWithSeperators = rawInputWithSeperators.replaceAll(
  //   lineBreakRegex,
  //   (match: any) => addSeperatorReplacer(match, 'break')
  // );
  return rawInputWithSeperators;
};

export const parseChatInput = (rawInput: string): FragmentType[] => {
  let frags: FragmentType[] = [];
  const consolidatedFragments: FragmentType[] = [];
  const rawInputWithSeperators = seperateRawInput(rawInput);

  const rawFragments = rawInputWithSeperators.split('|');

  rawFragments
    .filter((value: string) => value !== '')
    .forEach((rawFragment: string) => {
      const parsedFragment = parseFragment(rawFragment);
      frags = frags.concat(parsedFragment);
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
