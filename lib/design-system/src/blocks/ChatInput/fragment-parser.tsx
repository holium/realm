import {
  FragmentType,
  FragmentKeyTypes,
  TEXT_TYPES,
} from '../Bubble/Bubble.types';

const parserRules = {
  bold: {
    token: '**',
    recurse: true,
  },
  italics: {
    token: '*',
    recurse: true,
  },
  strike: {
    token: '~~',
    recurse: true,
  },
  'bold-italics': {
    token: '***',
    recurse: true,
  },
  'bold-strike': {
    token: '**~~',
    recurse: true,
  },

  blockquote: {
    token: '> ',
    ender: '\n',
    recurse: false,
  },
  'bold-italics-strike': {
    token: '***~~',
    ender: '~~***',
    recurse: false,
  },
  'inline-code': {
    token: '`',
    recurse: false,
  },
  code: {
    token: '```',
    recurse: false,
  },
  break: {
    token: '\n',
    recurse: false,
  },

};

/* TEST STRING
as***~~BIS~~***`***~~BIS~~***`df```b1 `fakeinline` ```aasdf```b2
b2.5 ***~~BIS~~***
```poop ***~~BIS~~***
plain
> blockquote
> blockquote`code`*italics* blockquote
~~s~~
~~s1 **b1** ~~
** bold ~~in-strike~~ **
 */
const updateResults = (results: any[], snippetIndex, eaten: {frag: FragmentType | null; pre: string; post: string;}): any[] => {
  let arrPre = results.slice(0, snippetIndex);
  let arrPost = results.slice(snippetIndex+1);
  results = arrPre;
  results.push(eaten.pre);
  results.push(eaten.frag);
  results.push(eaten.post);
  arrPost.forEach(i => results.push(i));
  return results;
}
const eatAll = (input: string): FragmentType[] => {
  let results = [input];

  let snippet = input;
  let snippetIndex = 0;
  while (results.find(e => typeof e === 'string')) {
    console.log(results);
    snippetIndex = results.findIndex(e => typeof e === 'string');
    snippet = results[snippetIndex];
    let matched = false;
    ['code', 'blockquote', 'inline-code', 'bold-italics-strike', 'break'].forEach(key => {
      if (!matched) {
        let eaten = eatSpecialType(snippet, key);
        if (eaten.frag) {
          results = updateResults(results, snippetIndex, eaten);
          matched = true;
        }
      }
    })
    if (!matched) {
      results[snippetIndex] = {plain: snippet} as FragmentPlainType;
    }
    results = results.filter(i => i !== '');
  }
  return results;
};
const eatSpecialType = (raw: string, type: string): {frag: FragmentType | null; pre: string; post: string;} => {
  let frag = null;
  let pre = raw;
  let post = '';

  const startIndex = raw.indexOf(parserRules[type].token);
  if (startIndex >= 0) { // we matched
    if (type === 'break') {
      pre = raw.substr(0, startIndex);
      post = raw.substr(startIndex + 1);
      frag = { break: null } as FragmentBreakType;
//    } else if (parserRules[type].recurse) {
    } else {
      // see if we find an exit match
      const offset = startIndex + parserRules[type].token.length;
      let stopIndex = raw.substr(offset).indexOf(parserRules[type].ender || parserRules[type].token);
      if (stopIndex >= 0) { // there is an exit match
        let parsedIndex = offset + stopIndex + (parserRules[type].ender || parserRules[type].token).length;
        pre = raw.substr(0, startIndex);
        post = raw.substr(parsedIndex);
        frag = { [type]: raw.substr(offset, stopIndex) } as FragmentType;
      }
    }
  }

  return {frag, pre, post};
};

const eatCode = (rawInput: string, results?: any[], globalOffset?: number): {frag: FragmentType; start: number; stop: number;}[] => {
  console.log(rawInput);
  results = results || [];
  globalOffset = globalOffset || 0;

  let codeIndex = rawInput.indexOf(parserRules.code.token);
  if (codeIndex >= 0) { // we matched
    // see if we find an exit match
    let offset = codeIndex + parserRules.code.token.length;
    let codeStopIndex = rawInput.substr(offset).indexOf(parserRules.code.token);
    if (codeStopIndex >= 0) { // there is an exit match
      let parsedIndex = offset + codeStopIndex + parserRules.code.token.length;
      results.push({
        start: codeIndex+globalOffset,
        stop: parsedIndex + globalOffset - 1,
        frag: {code: rawInput.substr(offset, codeStopIndex)} as FragmentCodeType
      });
      rawInput = rawInput.substr(parsedIndex);
      return eatCode(rawInput, results, globalOffset + parsedIndex);
    }
  }
  return results;
};

export const parseChatInput = (rawInput: string): FragmentType[] => {
  return eatAll(rawInput);
  /*
  let results = [];
  let { raw, chunks, globalOffset } = eatSpecialType(rawInput, 'code');
  let second = eatSpecialType(raw, 'bold-italics-strike', [], globalOffset);
  second.chunks.forEach(c => chunks.push(c));
  chunks = chunks.sort((a, b) => a.start < b.start ? -1 : 1);
  console.log(chunks);

  let plain = "";
  for (let i = 0; i < rawInput.length; i++) {
    if (chunks[0] && i >= chunks[0].start) {
      results.push({plain});
      plain = "";

      results.push(chunks[0].frag);
      i = chunks[0].stop;
      chunks = chunks.slice(1);
    } else {
      plain += rawInput[i];
    }
  }
  if (plain !== "") {
    results.push({plain});
  }

  return results; */
};


//// OLD ///////////////////////

// const boldToken = '**';
// const italicsToken = '*';
// const strikeToken = '~~';
// const boldItalicsToken = '***';
// const boldStrikeToken = '**~~';
// const boldItalicsStrikeToken = '***~~';
// const blockquoteToken = '>';
// const inlineCodeToken = '`';
// const codeBlockToken = '```';
// const lineBreakToken = '\n';
// 
// export const convertFragmentsToText = (fragments: FragmentType[]): string => {
//   return fragments.map((fragment) => fragmentToText(fragment)).join('');
// };
// 
// export const fragmentToText = (fragment: FragmentType): string => {
//   const [type, text] = Object.entries(fragment)[0];
//   if (type === 'plain') return text;
//   if (type === 'bold') return `${boldToken}${text}${boldToken}`;
//   if (type === 'italics') return `${italicsToken}${text}${italicsToken}`;
//   if (type === 'strike') return `${strikeToken}${text}${strikeToken}`;
//   if (type === 'boldItalics')
//     return `${boldItalicsToken}${text}${boldItalicsToken}`;
//   if (type === 'boldStrike')
//     return `${boldStrikeToken}${text}${boldStrikeToken}`;
//   if (type === 'boldItalicsStrike')
//     return `${boldItalicsStrikeToken}${text}${boldItalicsStrikeToken}`;
//   if (type === 'blockquote') return `${blockquoteToken}${text}`;
//   if (type === 'inlineCode')
//     return `${inlineCodeToken}${text}${inlineCodeToken}`;
//   if (type === 'codeBlock') return `${codeBlockToken}${text}${codeBlockToken}`;
//   if (type === 'lineBreak') return lineBreakToken;
//   return text;
// };
// 
// // const plainRegex = /^[a-zA-Z]+(([\'\,\.\- ][a-zA-Z ])?[a-zA-Z]*)*$/g;
// const boldRegex = /\*\*([^*]+)\*\*/g;
// const italicsRegex = /\*([^*]+)\*/g;
// const strikeRegex = /~~([^*]+)~~/g;
// const boldItalicsRegex = /\*\*\*([^*]+)\*\*\*/g;
// const boldStrikeRegex = /\*\*~~([^*]+)~~\*\*/g;
// const boldItalicsStrikeRegex = /\*\*\*~~([^*]+)~~\*\*\*/g;
// const blockquoteRegex = />([^>]+)$/g;
// const inlineCodeRegex = /`([^`]+)`/g;
// const codeBlockRegex = /```([^`]*)```/g;
// const linkRegex = /^\[([^\]]+)\]\(([^)]+)\)/g;
// const imageRegex = /^!\[([^\]]+)\]\(([^)]+)\)/g;
// const lineBreakRegex = /\n/g;
// 
// const START_TOKEN = '[%%';
// const END_TOKEN = '%%]';
// 
// const splitTextType = (text: string, type: string): FragmentType[] => {
//   const fragments = text.split(lineBreakRegex);
//   const parsedFragments: FragmentType[] = [];
//   fragments.forEach((fragment, index) => {
//     if (index > 0) parsedFragments.push({ break: null });
//     parsedFragments.push({ [type]: fragment } as FragmentType);
//   });
// 
//   return parsedFragments.filter(
//     // @ts-ignore
//     (fragment) => fragment[type] !== ''
//   );
// };
// 
// const parseFragment = (fragment: string): FragmentType[] => {
//   if (fragment?.includes(`%bold-italics-strike${START_TOKEN}`)) {
//     let sanitizedBoldItalicsStrike = fragment.replace(
//       `%bold-italics-strike${START_TOKEN}`,
//       ''
//     );
//     sanitizedBoldItalicsStrike = sanitizedBoldItalicsStrike.replace(
//       END_TOKEN,
//       ''
//     );
//     return splitTextType(sanitizedBoldItalicsStrike, 'bold-italics-strike');
//   }
//   if (fragment?.includes(`%bold-italics${START_TOKEN}`)) {
//     console.log(fragment);
//     let sanitizedBoldItalic = fragment.replace(
//       `%bold-italics${START_TOKEN}`,
//       ''
//     );
//     sanitizedBoldItalic = sanitizedBoldItalic.replaceAll(END_TOKEN, '');
//     return splitTextType(sanitizedBoldItalic, 'bold-italics');
//   }
//   if (fragment?.includes(`%bold-strike${START_TOKEN}`)) {
//     let sanitizedBoldStrike = fragment.replace(
//       `%bold-strike${START_TOKEN}`,
//       ''
//     );
//     sanitizedBoldStrike = sanitizedBoldStrike.replace(END_TOKEN, '');
//     return splitTextType(sanitizedBoldStrike, 'bold-strike');
//   }
//   if (fragment?.includes(`%bold${START_TOKEN}`)) {
//     let sanitizedBold = fragment.replace(`%bold${START_TOKEN}`, '');
//     sanitizedBold = sanitizedBold.replace(END_TOKEN, '');
//     return splitTextType(sanitizedBold, 'bold');
//   }
//   if (fragment?.includes(`%italics${START_TOKEN}`)) {
//     let sanitizedItalics = fragment.replace(`%italics${START_TOKEN}`, '');
//     sanitizedItalics = sanitizedItalics.replace(END_TOKEN, '');
//     return splitTextType(sanitizedItalics, 'italics');
//   }
//   if (fragment?.includes(`%strike${START_TOKEN}`)) {
//     let sanitizedStrike = fragment.replace(`%strike${START_TOKEN}`, '');
//     sanitizedStrike = sanitizedStrike.replace(END_TOKEN, '');
//     return splitTextType(sanitizedStrike, 'strike');
//   }
// 
//   if (fragment?.includes('%blockquote')) {
//     let sanitizedBlockquote = fragment.replace(`%blockquote${START_TOKEN}`, '');
//     sanitizedBlockquote = sanitizedBlockquote.replace(END_TOKEN, '');
//     return splitTextType(sanitizedBlockquote, 'blockquote');
//   }
// 
//   if (fragment?.includes(`%inline-code${START_TOKEN}`)) {
//     let sanitizedInlineCode = fragment.replace(
//       `%inline-code${START_TOKEN}`,
//       ''
//     );
//     sanitizedInlineCode = sanitizedInlineCode.replace(END_TOKEN, '');
// 
//     return [{ 'inline-code': sanitizedInlineCode }];
//   }
// 
//   if (fragment?.includes(`%code${START_TOKEN}`)) {
//     let sanitizedCode = fragment.replaceAll('%% \n', '%%');
//     sanitizedCode = sanitizedCode.replaceAll('\n %%', '%%');
//     sanitizedCode = sanitizedCode.replaceAll('%%\n', '%%');
//     sanitizedCode = sanitizedCode.replaceAll('\n%%', '%%');
//     sanitizedCode = sanitizedCode.replace(`%code${START_TOKEN}`, '');
//     sanitizedCode = sanitizedCode.replace(END_TOKEN, '');
//     return [
//       {
//         code: sanitizedCode,
//       },
//     ];
//   }
//   const link = linkRegex.exec(fragment);
//   if (link) {
//     return [{ link: link[1].replace('%link', '') }];
//   }
//   const image = imageRegex.exec(fragment);
//   if (image) {
//     return [{ image: image[1].replace('%image', '') }];
//   }
//   // const lineBreak = lineBreakRegex.exec(fragment);
//   // if (lineBreak) {
//   //   return [{ break: null }];
//   // }
//   return splitTextType(fragment.replace('%plain', ''), 'plain');
// };
// 
// const addSeperatorReplacer = (
//   _match: any,
//   type: FragmentKeyTypes,
//   ...args: any
// ) => {
//   return `|%${type}[%%${args[0][0]}%%]|`;
// };
// 
// const seperateRawInput = (rawInput: string): string => {
//   let rawInputWithSeperators = rawInput;
//   rawInputWithSeperators = rawInputWithSeperators.replaceAll(
//     codeBlockRegex,
//     (match: any, ...args) => addSeperatorReplacer(match, 'code', args)
//   );
//   rawInputWithSeperators = rawInputWithSeperators.replaceAll(
//     inlineCodeRegex,
//     (match: any, ...args) => addSeperatorReplacer(match, 'inline-code', args)
//   );
//   rawInputWithSeperators = rawInputWithSeperators.replaceAll(
//     blockquoteRegex,
//     (match: any, ...args) => addSeperatorReplacer(match, 'blockquote', args)
//   );
//   rawInputWithSeperators = rawInputWithSeperators.replaceAll(
//     boldItalicsRegex,
//     (match: any, ...args) => addSeperatorReplacer(match, 'bold-italics', args)
//   );
//   rawInputWithSeperators = rawInputWithSeperators.replaceAll(
//     boldItalicsStrikeRegex,
//     (match: any, ...args) =>
//       addSeperatorReplacer(match, 'bold-italics-strike', args)
//   );
// 
//   rawInputWithSeperators = rawInputWithSeperators.replaceAll(
//     boldStrikeRegex,
//     (match: any, ...args) => addSeperatorReplacer(match, 'bold-strike', args)
//   );
//   rawInputWithSeperators = rawInputWithSeperators.replaceAll(
//     boldRegex,
//     (match: any, ...args) => addSeperatorReplacer(match, 'bold', args)
//   );
//   rawInputWithSeperators = rawInputWithSeperators.replaceAll(
//     italicsRegex,
//     (match: any, ...args) => addSeperatorReplacer(match, 'italics', args)
//   );
//   rawInputWithSeperators = rawInputWithSeperators.replaceAll(
//     strikeRegex,
//     (match: any, ...args) => addSeperatorReplacer(match, 'strike', args)
//   );
//   rawInputWithSeperators = rawInputWithSeperators.replaceAll(
//     imageRegex,
//     (match: any, ...args) => addSeperatorReplacer(match, 'image', args)
//   );
//   // rawInputWithSeperators = rawInputWithSeperators.replaceAll(
//   //   plainRegex,
//   //   (match: any, ...args) => addSeperatorReplacer(match, 'plain', args)
//   // );
//   // rawInputWithSeperators = rawInputWithSeperators.replaceAll(
//   //   lineBreakRegex,
//   //   (match: any) => addSeperatorReplacer(match, 'break')
//   // );
//   return rawInputWithSeperators;
// };
// 
// export const parseChatInput = (rawInput: string): FragmentType[] => {
//   let frags: FragmentType[] = [];
//   const consolidatedFragments: FragmentType[] = [];
//   const rawInputWithSeperators = seperateRawInput(rawInput);
// 
//   const rawFragments = rawInputWithSeperators.split('|');
// 
//   rawFragments
//     .filter((value: string) => value !== '')
//     .forEach((rawFragment: string) => {
//       const parsedFragment = parseFragment(rawFragment);
//       frags = frags.concat(parsedFragment);
//     });
// 
//   console.log(rawFragments);
// 
//   frags.forEach((fragment: FragmentType, index: number) => {
//     let previousFragment: FragmentType | null = null;
//     let previousFragmentKey: FragmentKeyTypes | null = null;
//     let currentFragmentKey: FragmentKeyTypes = Object.keys(
//       fragment
//     )[0] as FragmentKeyTypes;
//     if (index !== 0) {
//       previousFragment = frags[index - 1];
//       previousFragmentKey = Object.keys(
//         previousFragment
//       )[0] as FragmentKeyTypes;
//     }
//     if (
//       TEXT_TYPES.includes(currentFragmentKey) &&
//       previousFragmentKey === currentFragmentKey
//     ) {
//       let lastConsolidated =
//         consolidatedFragments[consolidatedFragments.length - 1];
//       const lastValue = Object.values(lastConsolidated)[0];
//       const currentValue = Object.values(fragment)[0];
//       lastConsolidated = {
//         [currentFragmentKey]: `${lastValue} ${currentValue}`,
//       } as FragmentType;
//       consolidatedFragments[consolidatedFragments.length - 1] =
//         lastConsolidated;
//     } else {
//       consolidatedFragments.push(fragment);
//     }
//   });
// 
//   return consolidatedFragments;
// };
