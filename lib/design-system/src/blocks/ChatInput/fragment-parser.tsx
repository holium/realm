import { isValidPatp } from 'urbit-ob';
import {
  FragmentType,
  FragmentPlainType,
  FragmentBreakType,
} from '../Bubble/Bubble.types';

type ParserKey =
  | 'bold'
  | 'italics'
  | 'strike'
  | 'code'
  | 'blockquote'
  | 'inline-code'
  | 'ship'
  | 'image'
  | 'link'
  | 'bold-italics-strike'
  | 'break';

type ParserRule = {
  recurse: boolean;
  token?: string | RegExp;
  tokenLength?: number;
  ender?: string | RegExp;
  enderLength?: number;
  priority?: number;
  regex?: RegExp;
  filter?: (s: string) => boolean;
  printToken?: string;
};
type ParserRules = {
  [K in ParserKey]: ParserRule;
};

const parserRules: ParserRules = {
  bold: {
    token: '**',
    tokenLength: 2,
    recurse: true,
  },
  italics: {
    printToken: '*',
    token: /(((?<!\*)\*(?!\*))|(^\*(?!\*)))/,
    tokenLength: 1,
    recurse: true,
  },
  strike: {
    token: '~~',
    tokenLength: 2,
    recurse: true,
  },

  code: {
    token: '```',
    tokenLength: 3,
    recurse: false,
    priority: 0,
  },
  blockquote: {
    token: '> ',
    tokenLength: 2,
    ender: '\n',
    enderLength: 1,
    recurse: false,
    priority: 1,
  },
  'inline-code': {
    token: '`',
    tokenLength: 1,
    recurse: false,
    priority: 2,
  },
  ship: {
    regex: /~([a-z-])+/i,
    filter: isValidPatp,
    recurse: false,
    priority: 2.5,
  },
  image: {
    regex:
      /(https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#&//=]*)?\.(jpg|jpeg|png|gif|svg|webp|bmp|tif|tiff)(\?[-a-zA-Z0-9()@:%_+.~#&//=]*)?/i,
    recurse: false,
    priority: 3,
  },
  link: {
    regex:
      /((http|https|ftp):\/\/)?(www\.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/,
    // regex:
    //   /(https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}(\b|(\/([-a-zA-Z0-9()@:%_+.~#?&//=]*)+))/i,
    recurse: false,
    priority: 3.5,
  },
  'bold-italics-strike': {
    token: '***~~',
    ender: '~~***',
    tokenLength: 5,
    recurse: false,
    priority: 4,
  },
  break: {
    token: '\n',
    tokenLength: 1,
    recurse: false,
    priority: 5,
  },
};

/* TEST STRING
plain***~~BIS~~***`***~~fake-BIS~~***`plain```codblock `fakeinline` ```plain```codebloc
b2.5 ***~~fakeBIS~~***
```plain ***~~BIS~~***
plain
> blockquote
> blockquote`fakecode`*fakeitalics* blockquote
~~s~~
~~s1 **b1** ~~
~~s1 *i1* s1.a~~
** bold ~~in-strike~~ **
** bold ~~in-strike *italics* b-s~~ bold **
* ital ~~i-s **BIS** i-s~~ ital **b-i** * **b**
 **bold** plain www.example.com plain ~tolwer-mogmer ~not-valid stuff
plain ~zod ~fed ~hostyv https://i.stack.imgur.com/58jhk.jpg?s=128&g=1&g&s=32 plain 
 */

// takes a string and a specialType key (like 'blockquote' or 'italics-strike') and
// parses it into an object of the fragment (if found) and the pre- and post- text surrounding that fragment from the initial string
const eatSpecialType = (
  raw: string,
  type: ParserKey
): { frag: FragmentType | null; pre: string; post: string } => {
  // default result when no enter and exit match is found in the string, is {frag:null, pre: raw, post: ''};
  let frag = null;
  let pre = raw;
  let post = '';

  const reg = parserRules[type].regex;
  if (reg !== undefined) {
    const match = raw.match(reg);
    if (match && match.index !== undefined) {
      const startIndex = match.index;
      const matchingText = match[0];
      const endIndex = startIndex + matchingText.length;
      //@ts-ignore-error
      if (!parserRules[type].filter || parserRules[type].filter(matchingText)) {
        pre = raw.substr(0, startIndex);
        post = raw.substr(endIndex);
        frag = { [type]: matchingText } as FragmentType;
      }
    }
  } else {
    let startIndex: number;
    const startToken = parserRules[type].token;
    if (typeof startToken === 'string') {
      startIndex = raw.indexOf(startToken);
    } else if (typeof startToken === 'object') {
      // handle regex (for italics since * is a subset of bold's **)
      let possibleMatch = raw.match(startToken);
      startIndex =
        possibleMatch && possibleMatch.index !== undefined
          ? possibleMatch.index
          : -1;
    } else {
      throw new Error('should not be possible to reach this');
    }
    if (startIndex >= 0) {
      // we matched
      if (type === 'break') {
        pre = raw.substr(0, startIndex);
        post = raw.substr(startIndex + 1);
        frag = { break: null } as FragmentBreakType;
      } else {
        // see if we find an exit match
        const offset =
          startIndex + (parserRules[type].tokenLength as unknown as number);
        const endToken = parserRules[type].ender || startToken;
        let endTokenLength = (parserRules[type].enderLength ||
          parserRules[type].tokenLength) as unknown as number;
        let stopIndex: number;
        if (typeof endToken === 'string') {
          stopIndex = raw.substr(offset).indexOf(endToken);
        } else {
          // handle regex (for italics since * is a subset of bold's **)
          let interimMatch = raw.substr(offset).match(endToken);
          stopIndex =
            interimMatch && interimMatch.index !== undefined
              ? interimMatch.index
              : -1;
        }
        if (stopIndex >= 0) {
          // there is an exit match
          let parsedIndex = offset + stopIndex + endTokenLength;
          pre = raw.substr(0, startIndex);
          post = raw.substr(parsedIndex);
          frag = { [type]: raw.substr(offset, stopIndex) } as FragmentType;
        }
      }
    }
  }

  return { frag, pre, post };
};

// just a little helper to deal with interpolating the eaten fragment into the results array-of-strings-and-fragments
const updateResults = (
  results: any[],
  snippetIndex: number,
  eaten: { frag: FragmentType | null; pre: string; post: string }
): any[] => {
  let arrPre = results.slice(0, snippetIndex);
  let arrPost = results.slice(snippetIndex + 1);
  results = arrPre;
  results.push(eaten.pre);
  results.push(eaten.frag);
  results.push(eaten.post);
  arrPost.forEach((i) => results.push(i));
  return results;
};

// master function to parse a string into rich-text fragments
// basic strategy is to iteratively pull out things we know are good from the original string, whittling down strings into typed fragments
export const parseChatInput = (input: string): FragmentType[] => {
  //@ts-ignore-error
  let results: FragmentType[] = [input];

  const recursiveKeys = (Object.keys(parserRules) as ParserKey[]).filter(
    (k) => parserRules[k].recurse
  );
  const nonRecursiveKeys = (Object.keys(parserRules) as ParserKey[])
    .filter((k) => !parserRules[k].recurse)
    .sort(
      (a, b) => (parserRules[a].priority || 0) - (parserRules[b].priority || 0)
    );

  let snippet = input;
  let snippetIndex = 0;
  while (results.find((e) => typeof e === 'string')) {
    snippetIndex = results.findIndex((e) => typeof e === 'string');
    snippet = results[snippetIndex] as unknown as string;
    let matched = false;
    // handle the non-recursive types
    for (let ki = 0; ki < nonRecursiveKeys.length; ki++) {
      let key: ParserKey = nonRecursiveKeys[ki];
      if (!matched) {
        let eaten = eatSpecialType(snippet, key);
        if (eaten.frag) {
          results = updateResults(results, snippetIndex, eaten);
          matched = true;
        }
      }
    }
    // handle the recursive types
    // important that this happens AFTER the non-recursive types
    if (!matched) {
      let eats: any = {};
      for (let ki = 0; ki < recursiveKeys.length; ki++) {
        let key: ParserKey = recursiveKeys[ki];
        eats[key] = eatSpecialType(snippet, key);
      }
      // find the one that starts earliest in the snippet
      let smallest = 10000000;
      let smallestKey = null;
      for (let ki = 0; ki < recursiveKeys.length; ki++) {
        let key = recursiveKeys[ki];
        if (eats[key].frag && eats[key].pre.length < smallest) {
          smallest = eats[key].pre.length;
          smallestKey = key;
        }
      }
      if (smallestKey) {
        matched = true;
        // RECURSION HAPPENS HERE
        let innerFrags: any[] = parseChatInput(
          eats[smallestKey].frag[smallestKey]
        );
        for (let i = 0; i < innerFrags.length; i++) {
          if (innerFrags[i].plain) {
            innerFrags[i] = { [smallestKey]: innerFrags[i].plain };
          } else if (innerFrags[i].italics && smallestKey === 'bold') {
            innerFrags[i] = { 'bold-italics': innerFrags[i].italics };
          } else if (innerFrags[i].bold && smallestKey === 'italics') {
            innerFrags[i] = { 'bold-italics': innerFrags[i].bold };
          } else if (innerFrags[i].strike && smallestKey === 'bold') {
            innerFrags[i] = { 'bold-strike': innerFrags[i].strike };
          } else if (innerFrags[i].bold && smallestKey === 'strike') {
            innerFrags[i] = { 'bold-strike': innerFrags[i].bold };
          } else if (innerFrags[i].italics && smallestKey === 'strike') {
            innerFrags[i] = { 'italics-strike': innerFrags[i].italics };
          } else if (innerFrags[i].strike && smallestKey === 'italics') {
            innerFrags[i] = { 'italics-strike': innerFrags[i].strike };
          } else if (
            innerFrags[i]['bold-italics'] &&
            smallestKey === 'strike'
          ) {
            innerFrags[i] = {
              'bold-italics-strike': innerFrags[i]['bold-italics'],
            };
          } else if (
            innerFrags[i]['italics-strike'] &&
            smallestKey === 'bold'
          ) {
            innerFrags[i] = {
              'bold-italics-strike': innerFrags[i]['italics-strike'],
            };
          } else if (
            innerFrags[i]['bold-strike'] &&
            smallestKey === 'italics'
          ) {
            innerFrags[i] = {
              'bold-italics-strike': innerFrags[i]['bold-strike'],
            };
          }
        }
        let arrPre = results.slice(0, snippetIndex);
        let arrPost = results.slice(snippetIndex + 1);
        results = arrPre;
        results.push(eats[smallestKey].pre);
        for (let inneri = 0; inneri < innerFrags.length; inneri++) {
          results.push(innerFrags[inneri]);
        }
        results.push(eats[smallestKey].post);
        for (let arri = 0; arri < arrPost.length; arri++) {
          results.push(arrPost[arri]);
        }
      }
    }
    // fall-back to plain if nothing else matched
    if (!matched) {
      results[snippetIndex] = { plain: snippet } as FragmentPlainType;
    }
    //@ts-ignore
    results = results.filter((i) => i !== '');
  }
  //@ts-ignore
  return results;
};

export const convertFragmentsToText = (fragments: FragmentType[]): string => {
  return fragments.map((fragment) => fragmentToText(fragment)).join('');
};

export const fragmentToText = (fragment: FragmentType): string => {
  const [type, text] = Object.entries(fragment)[0];
  if (type === 'plain') return text;
  if (type === 'bold')
    return `${parserRules.bold.token}${text}${parserRules.bold.token}`;
  if (type === 'italics')
    return `${parserRules.italics.printToken}${text}${parserRules.italics.printToken}`;
  if (type === 'strike')
    return `${parserRules.strike.token}${text}${parserRules.strike.token}`;
  if (type === 'bold-italics') return `***${text}***`;
  if (type === 'bold-strike') return `**~~${text}~~**`;
  if (type === 'italics-strike') return `*~~${text}~~*`;
  if (type === 'bold-italics-strike') return `***~~${text}~~***`;
  if (type === 'blockquote') return `${parserRules.blockquote.token}${text}`;
  if (type === 'inline-code')
    return `${parserRules['inline-code'].token}${text}${parserRules['inline-code'].token}`;
  if (type === 'code')
    return `${parserRules.code.token}\n${text}\n${parserRules.code.token}`;
  if (type === 'break') return '\n';
  return text;
};
